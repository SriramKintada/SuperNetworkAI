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
    console.log('LinkedIn data scraped:', profile.fullName)

    // Step 2: Use OpenAI GPT-4o Mini to extract and structure key details
    const extractionPrompt = `You are a professional profile analyzer. Extract and structure the following LinkedIn profile data into a clean, professional format.

LinkedIn Profile Data:
${JSON.stringify(profile, null, 2)}

Extract the following information in JSON format:
{
  "name": "Full name",
  "headline": "Current role at company (e.g., 'Senior Engineer at Google')",
  "bio": "A compelling 2-3 sentence professional bio summarizing their background, expertise, and career focus",
  "location": "City, Country",
  "skills": ["skill1", "skill2", ...] (extract top 10-15 skills),
  "experience_summary": "Brief summary of career trajectory and key achievements",
  "industries": ["industry1", "industry2"] (extract main industries),
  "education": "Highest degree and institution",
  "current_role": "Current job title",
  "current_company": "Current company name"
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
      photo_url: profile.profilePicture || profile.photoUrl || null,
      raw_linkedin_data: {
        followers: profile.followers,
        connections: profile.connections,
        posts: profile.postsCount,
        articles: profile.articlesCount,
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
