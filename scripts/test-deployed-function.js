// Test the deployed hyper-service Edge Function
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testHyperService(linkedinUrl) {
  console.log('🧪 Testing Deployed hyper-service Edge Function')
  console.log('=' .repeat(70))
  console.log(`LinkedIn URL: ${linkedinUrl}`)
  console.log('')

  try {
    console.log('Calling Edge Function...')
    const startTime = Date.now()

    const response = await fetch(`${SUPABASE_URL}/functions/v1/hyper-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ linkedinUrl })
    })

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`Response received in ${elapsed}s`)
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log('')

    const data = await response.json()

    if (!response.ok) {
      console.log('❌ ERROR RESPONSE:')
      console.log(JSON.stringify(data, null, 2))
    } else {
      console.log('✅ SUCCESS RESPONSE:')
      console.log(JSON.stringify(data, null, 2))
    }

  } catch (error) {
    console.error('')
    console.error('❌ Request failed:', error.message)
  }
}

const linkedinUrl = process.argv[2] || 'https://www.linkedin.com/in/sriramkintada'
testHyperService(linkedinUrl)
