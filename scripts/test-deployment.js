/**
 * Quick Backend Deployment Test
 * Tests all Edge Functions to verify deployment
 */

// Load from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local exists with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('🧪 Testing SuperNetworkAI Backend Deployment\n')

async function testDatabase() {
  console.log('1. Testing Database Connection...')
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('   ✅ Database connected')
      console.log(`   📊 Profiles in database: ${data.length}`)
      return true
    } else {
      console.log('   ❌ Database error:', response.status)
      return false
    }
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message)
    return false
  }
}

async function testEdgeFunction(name, path, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, options)

    if (response.ok || response.status === 400) {
      // 400 is OK for functions expecting specific data
      console.log(`   ✅ ${name} deployed and responding`)
      return true
    } else {
      console.log(`   ❌ ${name} error: ${response.status}`)
      const text = await response.text()
      console.log(`      ${text}`)
      return false
    }
  } catch (error) {
    console.log(`   ❌ ${name} failed:`, error.message)
    return false
  }
}

async function runTests() {
  let passCount = 0
  let failCount = 0

  // Test 1: Database
  if (await testDatabase()) passCount++
  else failCount++
  console.log()

  // Test 2-9: Edge Functions
  console.log('2. Testing Edge Functions...')

  const functions = [
    ['get-profile', 'get-profile?user_id=test', 'GET'],
    ['update-profile', 'update-profile', 'PUT', { name: 'Test' }],
    ['generate-embedding', 'generate-embedding', 'POST', { profileId: 'test' }],
    ['search-profiles', 'search-profiles', 'POST', { query: 'test', limit: 10 }],
    ['match-ranking', 'match-ranking', 'POST', { query: 'test', matches: [] }],
    ['connections', 'connections', 'GET'],
    ['communities', 'communities', 'GET'],
    ['messages', 'messages', 'GET']
  ]

  for (const [name, path, method, body] of functions) {
    if (await testEdgeFunction(name, path, method, body)) passCount++
    else failCount++
  }

  console.log()
  console.log('=' .repeat(50))
  console.log(`✅ Passed: ${passCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log(`📊 Total: ${passCount + failCount}`)
  console.log('=' .repeat(50))

  if (failCount === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your backend is fully deployed!\n')
    console.log('Next steps:')
    console.log('1. Start dev server: npm run dev')
    console.log('2. Create a test user at: http://localhost:3000/signup')
    console.log('3. Test all features via frontend')
  } else {
    console.log('\n⚠️  Some tests failed. Check deployment:')
    console.log('- Verify all Edge Functions deployed')
    console.log('- Check Supabase logs for errors')
    console.log('- Ensure OpenAI API key is set')
  }
}

runTests()
