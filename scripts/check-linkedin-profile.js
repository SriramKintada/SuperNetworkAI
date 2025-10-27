// Check if a LinkedIn profile URL is accessible
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

async function checkLinkedInProfile(url) {
  console.log('🔍 Checking LinkedIn Profile Accessibility')
  console.log('=' .repeat(70))
  console.log(`URL: ${url}`)
  console.log('')

  try {
    console.log('Attempting to fetch profile page...')
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'manual' // Don't follow redirects automatically
    })

    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Redirect: ${response.headers.get('location') || 'None'}`)

    if (response.status === 301 || response.status === 302) {
      const redirectUrl = response.headers.get('location')
      console.log('')
      console.log('⚠️ PROFILE IS REDIRECTING')
      console.log(`Redirect destination: ${redirectUrl}`)

      if (redirectUrl && redirectUrl.includes('/authwall')) {
        console.log('')
        console.log('❌ ISSUE FOUND: Profile requires login to view')
        console.log('This means your LinkedIn profile is NOT PUBLIC.')
        console.log('')
        console.log('To fix this:')
        console.log('1. Go to your LinkedIn profile')
        console.log('2. Click "Me" → "Settings & Privacy"')
        console.log('3. Click "Visibility" → "Visibility of your profile & network"')
        console.log('4. Set "Profile viewing options" to PUBLIC')
        console.log('5. Make sure "Public profile visibility" is ON')
      }
    } else if (response.status === 404) {
      console.log('')
      console.log('❌ ISSUE FOUND: Profile not found (404)')
      console.log('The LinkedIn URL might be incorrect or the profile was deleted.')
    } else if (response.status === 200) {
      console.log('')
      console.log('✅ Profile is accessible!')
      console.log('The profile exists and can be accessed.')
    } else {
      console.log('')
      console.log(`⚠️ Unexpected status: ${response.status}`)
    }

  } catch (error) {
    console.error('')
    console.error('❌ Error checking profile:', error.message)
  }
}

const linkedinUrl = process.argv[2] || 'https://www.linkedin.com/in/sriramkintada'
checkLinkedInProfile(linkedinUrl)
