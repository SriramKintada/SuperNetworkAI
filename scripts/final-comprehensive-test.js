// Comprehensive final test of all critical features
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let testsPassed = 0
let testsFailed = 0

function logTest(name, passed, details = '') {
  if (passed) {
    console.log(`✅ ${name}`)
    if (details) console.log(`   ${details}`)
    testsPassed++
  } else {
    console.log(`❌ ${name}`)
    if (details) console.log(`   ${details}`)
    testsFailed++
  }
}

console.log('🔍 COMPREHENSIVE FINAL TEST')
console.log('=' .repeat(70))
console.log('Testing all critical features before GitHub push\n')

// TEST 1: Database Connectivity
console.log('📍 Test 1: Database Connectivity')
console.log('-' .repeat(70))

try {
  const { data: profiles, error } = await supabase.from('profiles').select('id').limit(1)
  logTest('Profiles table accessible', !error, error ? error.message : `Found ${profiles?.length || 0} profiles`)
} catch (e) {
  logTest('Profiles table accessible', false, e.message)
}

try {
  const { data: embeddings, error } = await supabase.from('profile_embeddings').select('id').limit(1)
  logTest('Profile embeddings table accessible', !error, error ? error.message : `Found ${embeddings?.length || 0} embeddings`)
} catch (e) {
  logTest('Profile embeddings table accessible', false, e.message)
}

try {
  const { data: communities, error } = await supabase.from('communities').select('id').limit(1)
  logTest('Communities table accessible', !error, error ? error.message : `Found ${communities?.length || 0} communities`)
} catch (e) {
  logTest('Communities table accessible', false, e.message)
}

try {
  const { data: members, error } = await supabase.from('community_members').select('id').limit(1)
  logTest('Community members table accessible', !error, error ? error.message : `Found ${members?.length || 0} members`)
} catch (e) {
  logTest('Community members table accessible', false, e.message)
}

// TEST 2: Profile Data Integrity
console.log('\n📍 Test 2: Profile Data Integrity')
console.log('-' .repeat(70))

const { data: allProfiles } = await supabase.from('profiles').select('*')
const profilesWithData = allProfiles?.filter(p => p.headline && p.bio && p.skills && p.skills.length > 0) || []
logTest('Profiles have complete data', profilesWithData.length === allProfiles?.length, `${profilesWithData.length}/${allProfiles?.length} profiles complete`)

// TEST 3: Embeddings Coverage
console.log('\n📍 Test 3: Embeddings Coverage')
console.log('-' .repeat(70))

const { count: profileCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
const { count: embeddingCount } = await supabase.from('profile_embeddings').select('profile_id', { count: 'exact', head: true })
const coverage = profileCount > 0 ? Math.round((embeddingCount / profileCount) * 100) : 0
logTest('Embeddings coverage 100%', coverage === 100, `${embeddingCount}/${profileCount} profiles have embeddings (${coverage}%)`)

// TEST 4: Vector Database RPC Function
console.log('\n📍 Test 4: Vector Database RPC Function')
console.log('-' .repeat(70))

try {
  const testEmbedding = new Array(1536).fill(0)
  testEmbedding[0] = 1
  const { data, error } = await supabase.rpc('match_profiles', {
    query_embedding: testEmbedding,
    match_threshold: 0.5,
    match_count: 5
  })
  logTest('match_profiles RPC function working', !error, error ? error.message : `Returned ${data?.length || 0} results`)
} catch (e) {
  logTest('match_profiles RPC function working', false, e.message)
}

// TEST 5: Edge Function - search-profiles
console.log('\n📍 Test 5: Edge Function - search-profiles')
console.log('-' .repeat(70))

try {
  const { data, error } = await supabase.functions.invoke('search-profiles', {
    body: { query: 'technical cofounder who knows AI', limit: 5 }
  })
  const resultCount = data?.results?.length || 0
  logTest('search-profiles function deployed', !error, error ? error.message : `Returned ${resultCount} results`)

  if (data?.results && data.results.length > 0) {
    const hasValidData = data.results[0].headline && data.results[0].similarity !== undefined
    logTest('search-profiles returns valid data', hasValidData, `Top result: ${data.results[0].name}`)
  }
} catch (e) {
  logTest('search-profiles function deployed', false, e.message)
}

// TEST 6: Edge Function - match-ranking
console.log('\n📍 Test 6: Edge Function - match-ranking')
console.log('-' .repeat(70))

try {
  const testMatches = [
    { id: '1', name: 'Test User', headline: 'AI Engineer', intent_text: 'Finding cofounders', skills: ['AI', 'ML'] }
  ]
  const { data, error } = await supabase.functions.invoke('match-ranking', {
    body: { query: 'technical cofounder', matches: testMatches }
  })
  const resultCount = data?.results?.length || 0
  logTest('match-ranking function deployed', !error, error ? error.message : `Returned ${resultCount} results`)

  if (data?.results && data.results.length > 0) {
    const hasExplanation = data.results[0].explanation && data.results[0].match_score !== undefined
    logTest('match-ranking returns AI explanations', hasExplanation, `Score: ${Math.round(data.results[0].match_score * 100)}%`)
  }
} catch (e) {
  logTest('match-ranking function deployed', false, e.message)
}

// TEST 7: Edge Function - hyper-service (LinkedIn)
console.log('\n📍 Test 7: Edge Function - hyper-service (LinkedIn)')
console.log('-' .repeat(70))

try {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/hyper-service`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ test: true })
  })
  const isDeployed = response.status !== 404
  logTest('hyper-service function deployed', isDeployed, isDeployed ? `Status: ${response.status}` : 'Function not found')
} catch (e) {
  logTest('hyper-service function deployed', false, e.message)
}

// TEST 8: OpenAI API Connectivity
console.log('\n📍 Test 8: OpenAI API Connectivity')
console.log('-' .repeat(70))

try {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: 'test',
    }),
  })
  const data = await response.json()
  const isWorking = response.ok && data.data && data.data[0].embedding
  logTest('OpenAI embeddings API working', isWorking, isWorking ? `Generated ${data.data[0].embedding.length}d vector` : 'API error')
} catch (e) {
  logTest('OpenAI embeddings API working', false, e.message)
}

// TEST 9: Privacy Settings Database Integration
console.log('\n📍 Test 9: Privacy Settings Database Integration')
console.log('-' .repeat(70))

const { data: testProfile } = await supabase.from('profiles').select('visibility, show_in_search').limit(1).single()
const hasPrivacyFields = testProfile && ('visibility' in testProfile || 'show_in_search' in testProfile)
logTest('Privacy settings fields exist', hasPrivacyFields, hasPrivacyFields ? 'visibility and show_in_search fields present' : 'Fields missing')

// TEST 10: Community Creation Database Integration
console.log('\n📍 Test 10: Community Creation Database Integration')
console.log('-' .repeat(70))

const { data: testCommunity } = await supabase.from('communities').select('id, name, type, invite_code').limit(1).single()
const hasCommunityFields = testCommunity && 'type' in testCommunity && 'invite_code' in testCommunity
logTest('Community fields exist', hasCommunityFields, hasCommunityFields ? 'All community fields present' : 'Fields missing')

// TEST 11: Full Search Flow End-to-End
console.log('\n📍 Test 11: Full Search Flow End-to-End')
console.log('-' .repeat(70))

try {
  // Step 1: Vector search
  const { data: searchData, error: searchError } = await supabase.functions.invoke('search-profiles', {
    body: { query: 'AI engineer', limit: 3 }
  })

  if (searchError) throw new Error(searchError.message)

  const searchResults = searchData?.results || []
  logTest('Step 1: Vector search', searchResults.length > 0, `Found ${searchResults.length} matches`)

  if (searchResults.length > 0) {
    // Step 2: AI ranking
    const { data: rankingData, error: rankingError } = await supabase.functions.invoke('match-ranking', {
      body: { query: 'AI engineer', matches: searchResults }
    })

    if (rankingError) throw new Error(rankingError.message)

    const rankedResults = rankingData?.results || []
    logTest('Step 2: AI ranking', rankedResults.length > 0, `Ranked ${rankedResults.length} profiles`)

    if (rankedResults.length > 0) {
      const hasExplanations = rankedResults.every(r => r.explanation && r.match_score !== undefined)
      logTest('Step 3: Explanations generated', hasExplanations, `Top match: ${Math.round(rankedResults[0].match_score * 100)}%`)
    }
  }
} catch (e) {
  logTest('Full search flow end-to-end', false, e.message)
}

// SUMMARY
console.log('\n' + '=' .repeat(70))
console.log('📊 TEST SUMMARY')
console.log('=' .repeat(70))
console.log(`✅ Passed: ${testsPassed}`)
console.log(`❌ Failed: ${testsFailed}`)
console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`)

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Ready for GitHub push.')
} else {
  console.log(`\n⚠️  ${testsFailed} tests failed. Review issues before pushing.`)
}

console.log('\n' + '=' .repeat(70))
