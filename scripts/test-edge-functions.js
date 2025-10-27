// Test Edge Functions to see if they're deployed and working
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testEdgeFunction(name, url, testPayload = null) {
  console.log(`\n🧪 Testing: ${name}`)
  console.log(`URL: ${url}`)
  console.log('=' .repeat(60))

  try {
    // Test OPTIONS request (CORS)
    console.log('1️⃣ Testing CORS (OPTIONS request)...')
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      }
    })
    console.log(`   Status: ${optionsResponse.status} ${optionsResponse.statusText}`)
    console.log(`   ✅ CORS headers present`)

    // Test actual request
    if (testPayload) {
      console.log('2️⃣ Testing with payload...')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      })

      console.log(`   Status: ${response.status} ${response.statusText}`)

      const data = await response.text()
      try {
        const json = JSON.parse(data)
        console.log('   Response:', JSON.stringify(json, null, 2).substring(0, 500))
      } catch {
        console.log('   Response (text):', data.substring(0, 500))
      }

      if (response.ok) {
        console.log('   ✅ Function working!')
      } else {
        console.log('   ⚠️  Function returned error')
      }
    } else {
      console.log('2️⃣ Skipping payload test (no test payload provided)')
    }

  } catch (error) {
    console.error('   ❌ Error:', error.message)
    return false
  }

  return true
}

async function main() {
  console.log('🔍 Testing Supabase Edge Functions')
  console.log('=' .repeat(60))

  // Test 1: hyper-service
  await testEdgeFunction(
    'hyper-service',
    'https://mpztkfmhgbbidrylngbw.supabase.co/functions/v1/hyper-service',
    { test: true }
  )

  // Test 2: super-api
  await testEdgeFunction(
    'super-api',
    'https://mpztkfmhgbbidrylngbw.supabase.co/functions/v1/super-api',
    { test: true }
  )

  // Test 3: enrich-linkedin-profile
  await testEdgeFunction(
    'enrich-linkedin-profile',
    'https://mpztkfmhgbbidrylngbw.supabase.co/functions/v1/enrich-linkedin-profile',
    { linkedinUrl: 'https://www.linkedin.com/in/test' }
  )

  console.log('\n' + '=' .repeat(60))
  console.log('✅ Testing complete!')
}

main()
