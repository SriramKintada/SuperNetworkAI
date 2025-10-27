// Test Apify LinkedIn scraping
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') })

const APIFY_API_KEY = process.env.APIFY_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function testLinkedInScraping(linkedinUrl) {
  console.log('🔍 Testing Apify LinkedIn Scraping')
  console.log('=' .repeat(60))
  console.log(`LinkedIn URL: ${linkedinUrl}`)
  console.log('')

  if (!APIFY_API_KEY) {
    console.error('❌ APIFY_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    console.log('Step 1: Calling Apify Actor...')
    const startTime = Date.now()

    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=${APIFY_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [{ url: linkedinUrl }],
          proxyConfiguration: { useApifyProxy: true },
        }),
      }
    )

    const scrapingTime = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Apify response received in ${scrapingTime}s`)
    console.log(`   Status: ${apifyResponse.status} ${apifyResponse.statusText}`)

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('❌ Apify API Error:', errorText)
      process.exit(1)
    }

    const linkedinData = await apifyResponse.json()

    if (!linkedinData || linkedinData.length === 0) {
      console.error('❌ No data returned from LinkedIn scraper')
      process.exit(1)
    }

    const profile = linkedinData[0]
    console.log('')
    console.log('📄 Scraped LinkedIn Data:')
    console.log('=' .repeat(60))
    console.log(`Name: ${profile.fullName || profile.firstName + ' ' + profile.lastName || 'N/A'}`)
    console.log(`Headline: ${profile.headline || 'N/A'}`)
    console.log(`Location: ${profile.location || profile.geo?.city || 'N/A'}`)
    console.log(`Followers: ${profile.followers || 'N/A'}`)
    console.log(`Connections: ${profile.connections || 'N/A'}`)
    console.log(`About: ${profile.about ? profile.about.substring(0, 200) + '...' : 'N/A'}`)
    console.log(`Skills: ${profile.skills ? profile.skills.length + ' skills found' : 'N/A'}`)
    console.log(`Experience: ${profile.experience ? profile.experience.length + ' positions' : 'N/A'}`)
    console.log('')

    // Step 2: Test OpenAI extraction
    console.log('Step 2: Testing OpenAI GPT-4o Mini extraction...')

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

    const openaiStartTime = Date.now()
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

    const extractionTime = ((Date.now() - openaiStartTime) / 1000).toFixed(2)
    console.log(`✅ OpenAI response received in ${extractionTime}s`)

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('❌ OpenAI API Error:', errorText)
      process.exit(1)
    }

    const openaiData = await openaiResponse.json()
    let extractedData = openaiData.choices[0].message.content

    // Clean up response
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const enrichedProfile = JSON.parse(extractedData)

    console.log('')
    console.log('🤖 AI-Extracted Profile Data:')
    console.log('=' .repeat(60))
    console.log(JSON.stringify(enrichedProfile, null, 2))
    console.log('')

    console.log('✅ LinkedIn scraping and AI extraction successful!')
    console.log('')
    console.log('Summary:')
    console.log(`  - Scraping time: ${scrapingTime}s`)
    console.log(`  - Extraction time: ${extractionTime}s`)
    console.log(`  - Total time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
    console.log(`  - Skills extracted: ${enrichedProfile.skills?.length || 0}`)
    console.log(`  - Bio generated: ${enrichedProfile.bio ? 'Yes' : 'No'}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run test with user's LinkedIn profile
const linkedinUrl = process.argv[2] || 'https://www.linkedin.com/in/sriramkintada'
testLinkedInScraping(linkedinUrl)
