import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { linkedinUrl } = await req.json()

    if (!linkedinUrl) {
      throw new Error('LinkedIn URL is required')
    }

    console.log('Scraping LinkedIn profile:', linkedinUrl)

    // Step 1: Call Apify to scrape LinkedIn profile
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=${Deno.env.get('APIFY_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [{ url: linkedinUrl }],
          proxyConfiguration: { useApifyProxy: true },
        }),
      }
    )

    if (!apifyResponse.ok) {
      throw new Error(`Apify API error: ${apifyResponse.statusText}`)
    }

    const linkedinData = await apifyResponse.json()

    if (!linkedinData || linkedinData.length === 0) {
      throw new Error('No data returned from LinkedIn scraper')
    }

    const profile = linkedinData[0]

    // Extract data from new Apify response structure (basic_info, experience, etc.)
    const basicInfo = profile.basic_info || {}
    const fullName = basicInfo.fullname || basicInfo.full_name || `${basicInfo.first_name || ''} ${basicInfo.last_name || ''}`.trim()
    const scrapedProfileUrl = basicInfo.profile_url || basicInfo.profileUrl || ''

    console.log('LinkedIn data scraped:', fullName)
    console.log('Profile URL from Apify:', scrapedProfileUrl)
    console.log('Requested URL:', linkedinUrl)

    // Validate that we scraped the correct profile
    const requestedUsername = linkedinUrl.toLowerCase().replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')
    const scrapedUsername = scrapedProfileUrl.toLowerCase().replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')

    if (requestedUsername !== scrapedUsername) {
      console.error(`WARNING: Profile mismatch! Requested: ${requestedUsername}, Got: ${scrapedUsername}`)
      throw new Error(`LinkedIn profile mismatch. Requested profile '${requestedUsername}' but got '${scrapedUsername}'. The profile may be private, deleted, or the URL is incorrect.`)
    }

    // Step 2: Use OpenAI GPT-4o Mini to extract and structure key details
    const extractionPrompt = `You are a professional profile analyzer. Extract and structure the following LinkedIn profile data into a clean, professional format.

IMPORTANT: The data structure uses these fields:
- basic_info: {fullname, headline, about, location: {city, country, full}, current_company, follower_count, connection_count}
- experience: [array of work experiences]
- education: [array of education]
- skills: [array of skills]

LinkedIn Profile Data:
${JSON.stringify(profile, null, 2)}

Extract the following information in JSON format:
{
  "name": "Full name from basic_info.fullname",
  "headline": "Current role at company (use basic_info.headline or construct from experience[0])",
  "bio": "A compelling 2-3 sentence professional bio based on basic_info.about",
  "location": "From basic_info.location.full",
  "skills": ["skill1", "skill2", ...] (extract top 10-15 from skills array),
  "experience_summary": "Brief summary of career trajectory from experience array",
  "industries": ["industry1", "industry2"] (infer from experience and skills),
  "education": "Highest degree from education array",
  "current_role": "From experience[0].title",
  "current_company": "From basic_info.current_company or experience[0].company"
}

Return ONLY valid JSON, no markdown or extra text.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a professional data extraction assistant. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    let extractedData = openaiData.choices[0].message.content

    // Clean up response (remove markdown if present)
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const enrichedProfile = JSON.parse(extractedData)

    // Step 3: Add raw LinkedIn data for reference
    const result = {
      ...enrichedProfile,
      linkedin_url: linkedinUrl,
      photo_url: basicInfo.profile_picture_url || profile.profilePicture || profile.photoUrl || null,
      raw_linkedin_data: {
        followers: basicInfo.follower_count || profile.followers || null,
        connections: basicInfo.connection_count || profile.connections || null,
        posts: profile.postsCount || null,
        articles: profile.articlesCount || null,
      }
    }

    console.log('Profile enriched successfully')

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error enriching profile:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to scrape and enrich LinkedIn profile'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
