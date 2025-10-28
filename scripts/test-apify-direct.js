// Test Apify Anchor actor directly to see what we're getting
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const APIFY_API_KEY = process.env.APIFY_API_KEY

async function testApifyDirect(linkedinUrl) {
  console.log('🧪 Testing Apify Anchor Actor Directly')
  console.log('=' .repeat(70))
  console.log(`LinkedIn URL: ${linkedinUrl}`)
  console.log('')

  if (!APIFY_API_KEY) {
    console.error('❌ APIFY_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    console.log('Calling Apify API...')
    const url = `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/run-sync-get-dataset-items?token=${APIFY_API_KEY}`

    const requestBody = {
      startUrls: [{ url: linkedinUrl }],
      proxyConfiguration: { useApifyProxy: true },
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    console.log('')

    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Response received in ${elapsed}s`)
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log('')

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error:', errorText)
      process.exit(1)
    }

    const data = await response.json()
    console.log('✅ Response received successfully')
    console.log(`Items count: ${data?.length || 0}`)
    console.log('')

    if (data && data.length > 0) {
      const profile = data[0]
      console.log('📊 PROFILE DATA:')
      console.log('=' .repeat(70))
      console.log(`Full Name: ${profile.full_name || 'N/A'}`)
      console.log(`First Name: ${profile.first_name || 'N/A'}`)
      console.log(`Last Name: ${profile.last_name || 'N/A'}`)
      console.log(`Headline: ${profile.headline || 'N/A'}`)
      console.log(`URL: ${profile.url || 'N/A'}`)
      console.log(`Location: ${profile.city}, ${profile.country}`)
      console.log(`Company: ${profile.company_name || 'N/A'}`)
      console.log(`Skills: ${profile.skills?.length || 0} skills`)
      console.log(`Experiences: ${profile.experiences?.length || 0} positions`)
      console.log(`Education: ${profile.education?.length || 0} schools`)
      console.log('')
      console.log('📝 FULL RAW RESPONSE:')
      console.log('=' .repeat(70))
      console.log(JSON.stringify(profile, null, 2))
    } else {
      console.log('⚠️ No data returned')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Test with the provided LinkedIn URL
const linkedinUrl = process.argv[2] || 'https://www.linkedin.com/in/williamhgates'
testApifyDirect(linkedinUrl)
