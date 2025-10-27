// Debug Apify LinkedIn scraping to see RAW response
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') })

const APIFY_API_KEY = process.env.APIFY_API_KEY

async function debugLinkedInScraping(linkedinUrl) {
  console.log('🔍 DEBUG: Apify LinkedIn Scraping')
  console.log('=' .repeat(70))
  console.log(`LinkedIn URL: ${linkedinUrl}`)
  console.log('')

  if (!APIFY_API_KEY) {
    console.error('❌ APIFY_API_KEY not found in .env.local')
    process.exit(1)
  }

  try {
    console.log('Calling Apify Actor...')
    console.log('Request body:', JSON.stringify({
      startUrls: [{ url: linkedinUrl }],
      proxyConfiguration: { useApifyProxy: true },
    }, null, 2))
    console.log('')

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

    console.log(`Status: ${apifyResponse.status} ${apifyResponse.statusText}`)

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('❌ Apify API Error:', errorText)
      process.exit(1)
    }

    const linkedinData = await apifyResponse.json()

    console.log('')
    console.log('📦 RAW RESPONSE FROM APIFY:')
    console.log('=' .repeat(70))
    console.log(JSON.stringify(linkedinData, null, 2))
    console.log('')
    console.log('=' .repeat(70))
    console.log(`Total items returned: ${linkedinData.length}`)

    if (linkedinData.length > 0) {
      const profile = linkedinData[0]
      console.log('')
      console.log('📊 FIRST ITEM KEYS:')
      console.log(Object.keys(profile))
      console.log('')
      console.log('📝 FIRST ITEM VALUES:')
      console.log(`fullName: ${profile.fullName}`)
      console.log(`firstName: ${profile.firstName}`)
      console.log(`lastName: ${profile.lastName}`)
      console.log(`headline: ${profile.headline}`)
      console.log(`profileUrl: ${profile.profileUrl}`)
      console.log(`url: ${profile.url}`)
      console.log(`linkedInUrl: ${profile.linkedInUrl}`)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Run with user's LinkedIn profile
const linkedinUrl = process.argv[2] || 'https://www.linkedin.com/in/sriramkintada'
debugLinkedInScraping(linkedinUrl)
