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

    console.log('=== Starting LinkedIn Import ===')
    console.log('Requested URL:', linkedinUrl)

    // Step 1: Call Apify actor using regular run endpoint (not run-sync)
    // The actor will process asynchronously and we'll poll for results
    console.log('Step 1: Starting Apify actor run...')

    const apifyApiKey = Deno.env.get('APIFY_API_KEY')
    if (!apifyApiKey) {
      throw new Error('APIFY_API_KEY environment variable is not set')
    }

    // Start the actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/runs?token=${apifyApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [linkedinUrl],
          proxyConfiguration: { useApifyProxy: true },
        }),
      }
    )

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error('Apify run start error:', errorText)
      throw new Error(`Apify API error (${runResponse.status}): ${errorText}`)
    }

    const runData = await runResponse.json()
    const runId = runData.data.id
    const defaultDatasetId = runData.data.defaultDatasetId

    console.log('Actor run started, ID:', runId)
    console.log('Dataset ID:', defaultDatasetId)

    // Wait for the run to complete (poll status)
    let status = 'RUNNING'
    let attempts = 0
    const maxAttempts = 60 // 60 attempts * 2s = 120s timeout

    while (status === 'RUNNING' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/runs/${runId}?token=${apifyApiKey}`
      )

      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        status = statusData.data.status
        console.log(`Status check ${attempts + 1}/${maxAttempts}: ${status}`)
      }

      attempts++
    }

    if (status !== 'SUCCEEDED') {
      throw new Error(`Apify run did not complete successfully. Status: ${status}`)
    }

    console.log('Actor run completed successfully!')

    // Fetch the dataset items
    const datasetResponse = await fetch(
      `https://api.apify.com/v2/datasets/${defaultDatasetId}/items?token=${apifyApiKey}`
    )

    if (!datasetResponse.ok) {
      const errorText = await datasetResponse.text()
      console.error('Dataset fetch error:', errorText)
      throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`)
    }

    const linkedinData = await datasetResponse.json()
    console.log('Dataset items count:', linkedinData?.length || 0)

    if (!linkedinData || linkedinData.length === 0) {
      throw new Error('No data returned from LinkedIn scraper. The profile may be private or inaccessible.')
    }

    const profile = linkedinData[0]
    console.log('Profile name:', profile.full_name || profile.first_name + ' ' + profile.last_name)
    console.log('Profile URL:', profile.url)

    // Validate that we scraped the correct profile
    const requestedUsername = linkedinUrl.toLowerCase().replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')
    const scrapedUrl = (profile.url || '').toLowerCase()
    const scrapedUsername = scrapedUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')

    console.log('Username comparison - Requested:', requestedUsername, 'Scraped:', scrapedUsername)

    if (requestedUsername && scrapedUsername && requestedUsername !== scrapedUsername) {
      console.error(`Profile mismatch! Requested: ${requestedUsername}, Got: ${scrapedUsername}`)
      throw new Error(`LinkedIn profile mismatch. Requested '${requestedUsername}' but got '${scrapedUsername}'. The profile may be private, deleted, or the URL is incorrect.`)
    }

    // Step 2: Use OpenAI GPT-4o to extract and structure comprehensive profile details
    console.log('Step 2: Calling OpenAI for data extraction...')

    const extractionPrompt = `You are an expert LinkedIn profile analyzer. Extract comprehensive professional information from this LinkedIn profile data.

LinkedIn Profile Data:
${JSON.stringify(profile, null, 2)}

IMPORTANT FIELD MAPPINGS:
- Name: full_name OR (first_name + last_name)
- Headline: headline field
- Bio: summary OR about field (create compelling 3-5 sentence bio)
- Location: city + country OR location.full
- Current role: company_name field OR experiences[0].title
- Current company: company_name field OR experiences[0].company
- Skills: skills array (extract 15-20+)
- Experience: experiences array (extract all roles and companies)
- Education: education array

EXTRACT IN JSON FORMAT (ONLY JSON, NO MARKDOWN):
{
  "name": "Full name",
  "current_role": "Current job title",
  "current_company": "Current company",
  "bio": "Detailed 3-5 sentence professional bio",
  "location": "City, Country",
  "skills": ["skill1", "skill2", ...] (15-20 skills),
  "experience_summary": "Career trajectory summary",
  "all_roles": ["role1", "role2", ...] (all job titles),
  "all_companies": ["company1", "company2", ...] (all companies),
  "industries": ["industry1", ...] (inferred from experience),
  "education_summary": "Highest degree and institution",
  "years_of_experience": 10,
  "certifications": ["cert1", ...],
  "key_achievements": ["achievement1", ...] (3-5 achievements),
  "expertise_areas": ["area1", ...] (5-10 core expertise areas)
}

Return ONLY valid JSON, no markdown.`

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert profile analyzer. Always return valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    console.log('OpenAI response status:', openaiResponse.status)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error (${openaiResponse.status}): ${errorText}`)
    }

    const openaiData = await openaiResponse.json()
    let extractedData = openaiData.choices[0].message.content

    // Clean up response (remove markdown if present)
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const enrichedProfile = JSON.parse(extractedData)
    console.log('Successfully parsed OpenAI JSON response')
    console.log('Extracted skills count:', enrichedProfile.skills?.length || 0)

    // Step 3: Combine with raw LinkedIn data
    const result = {
      ...enrichedProfile,
      linkedin_url: linkedinUrl,
      photo_url: profile.profile_pic_url || profile.profile_picture_url || null,
      headline: profile.headline || `${enrichedProfile.current_role} at ${enrichedProfile.current_company}`,
      raw_linkedin_data: {
        followers: profile.follower_count || null,
        connections: profile.connection_count || null,
        public_identifier: profile.public_identifier || null,
        open_to_work: profile.open_to_work || false,
      },
      vectorization_text: `${enrichedProfile.name}. ${enrichedProfile.headline || enrichedProfile.current_role + ' at ' + enrichedProfile.current_company}. ${enrichedProfile.bio}. ${enrichedProfile.experience_summary}. Located in ${enrichedProfile.location}. Skills: ${enrichedProfile.skills?.join(', ') || ''}. Industries: ${enrichedProfile.industries?.join(', ') || ''}. Expertise: ${enrichedProfile.expertise_areas?.join(', ') || ''}. Education: ${enrichedProfile.education_summary || ''}. Roles: ${enrichedProfile.all_roles?.join(', ') || ''}. Companies: ${enrichedProfile.all_companies?.join(', ') || ''}. Achievements: ${enrichedProfile.key_achievements?.join('. ') || ''}.`
    }

    console.log('=== LinkedIn Import Complete ===')
    console.log('Skills extracted:', result.skills?.length || 0)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('=== ERROR in LinkedIn Import ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
        details: 'Failed to scrape and enrich LinkedIn profile',
        errorType: error.constructor.name
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
