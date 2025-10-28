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

    // Step 1: Call Apify anchor/linkedin-profile-enrichment actor
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/run-sync-get-dataset-items?token=${Deno.env.get('APIFY_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: [linkedinUrl],
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
    console.log('LinkedIn data scraped successfully')
    console.log('Profile URL:', profile.url)
    console.log('Profile Name:', profile.full_name || profile.name)

    // Validate that we scraped the correct profile
    const requestedUsername = linkedinUrl.toLowerCase().replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')
    const scrapedUrl = (profile.url || '').toLowerCase()
    const scrapedUsername = scrapedUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '')

    if (requestedUsername && scrapedUsername && requestedUsername !== scrapedUsername) {
      console.error(`WARNING: Profile mismatch! Requested: ${requestedUsername}, Got: ${scrapedUsername}`)
      throw new Error(`LinkedIn profile mismatch. Requested profile '${requestedUsername}' but got '${scrapedUsername}'. The profile may be private, deleted, or the URL is incorrect.`)
    }

    // Step 2: Use OpenAI GPT-4o to extract and structure comprehensive profile details
    const extractionPrompt = `You are an expert LinkedIn profile analyzer. Your task is to extract comprehensive professional information from this LinkedIn profile data and structure it for AI-powered matching and search.

CRITICAL INSTRUCTIONS:
1. Extract ALL relevant information about the person's professional background
2. Create a rich, detailed bio that captures their expertise, experience, and career focus
3. Identify ALL skills mentioned or implied from their work experience
4. Summarize their career trajectory and key achievements
5. Extract current role and company accurately
6. Identify all roles they've worked in throughout their career

LinkedIn Profile Data:
${JSON.stringify(profile, null, 2)}

DATA STRUCTURE GUIDE:
- full_name / first_name + last_name: Person's name
- headline: Professional headline/title
- summary: About section (use this for bio)
- country, city: Location
- profile_pic_url: Profile picture
- follower_count: Number of followers
- skills: Array of skills
- certifications: Array of certifications
- experiences: Array of work experiences with {company_name, title, description, start_date, end_date}
- education: Array of education with {school, degree, field_of_study}
- company_name: Most recent company
- company_industry: Industry

EXTRACT THE FOLLOWING IN JSON FORMAT:
{
  "name": "Full name",
  "current_role": "Current job title (from most recent experience or headline)",
  "current_company": "Current company name",
  "bio": "A compelling, detailed 3-5 sentence professional bio that summarizes their background, expertise, key achievements, and career focus. Include specific domains they work in, technologies they use, and their professional strengths.",
  "location": "City, Country",
  "skills": ["skill1", "skill2", ...] (Extract 15-20 skills from skills array AND infer additional skills from experience descriptions),
  "experience_summary": "Detailed summary of their career trajectory, highlighting progression, key roles, major achievements, and areas of expertise. 2-3 sentences.",
  "all_roles": ["role1", "role2", ...] (List ALL job titles they've held, including current role),
  "all_companies": ["company1", "company2", ...] (List ALL companies they've worked at),
  "industries": ["industry1", "industry2", ...] (Infer industries from experience and current company),
  "education_summary": "Highest degree, institution, and field of study",
  "years_of_experience": "Estimated total years of professional experience (number)",
  "certifications": ["cert1", "cert2", ...] (If available),
  "key_achievements": ["achievement1", "achievement2", ...] (Extract from experience descriptions, 3-5 notable achievements),
  "expertise_areas": ["area1", "area2", ...] (Core areas of expertise inferred from skills and experience, 5-10 areas)
}

IMPORTANT:
- Be thorough and detailed in bio and experience_summary
- Extract as many skills as possible (15-20+)
- Infer skills from job descriptions even if not in skills array
- Make the output rich for semantic search and AI matching
- Return ONLY valid JSON, no markdown or extra text`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert profile analyzer specializing in extracting comprehensive professional information for AI-powered talent matching. Always return valid, detailed JSON with rich context for semantic search.'
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

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    let extractedData = openaiData.choices[0].message.content

    // Clean up response (remove markdown if present)
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const enrichedProfile = JSON.parse(extractedData)

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
      // Create comprehensive text for vectorization
      vectorization_text: `${enrichedProfile.name}. ${enrichedProfile.headline || enrichedProfile.current_role + ' at ' + enrichedProfile.current_company}. ${enrichedProfile.bio}. ${enrichedProfile.experience_summary}. Located in ${enrichedProfile.location}. Skills: ${enrichedProfile.skills.join(', ')}. Industries: ${enrichedProfile.industries.join(', ')}. Expertise: ${enrichedProfile.expertise_areas.join(', ')}. Education: ${enrichedProfile.education_summary}. Roles: ${enrichedProfile.all_roles.join(', ')}. Companies: ${enrichedProfile.all_companies.join(', ')}. Achievements: ${enrichedProfile.key_achievements.join('. ')}.`
    }

    console.log('Profile enriched successfully with comprehensive data')
    console.log('Skills extracted:', enrichedProfile.skills.length)
    console.log('Expertise areas:', enrichedProfile.expertise_areas.length)

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
