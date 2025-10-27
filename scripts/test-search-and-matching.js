// Test Search and Matching Edge Functions
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('🔍 Testing Search and Matching Features')
console.log('=' .repeat(60))

// Test 1: Check if search-profiles Edge Function is deployed
async function testSearchFunction() {
  console.log('\n📍 Test 1: Search Profiles Edge Function')
  console.log('-' .repeat(60))

  try {
    console.log('Testing query: "technical cofounder who knows AI"')

    const { data, error } = await supabase.functions.invoke('search-profiles', {
      body: {
        query: 'technical cofounder who knows AI',
        limit: 10
      }
    })

    if (error) {
      console.log('❌ Error:', error.message)
      return false
    }

    console.log('✅ Function deployed and working!')
    console.log(`   Found ${data.results?.length || 0} results`)

    if (data.results && data.results.length > 0) {
      console.log('\n   Top matches:')
      data.results.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.name || 'Unknown'}`)
        console.log(`      Headline: ${match.headline || 'N/A'}`)
        console.log(`      Similarity: ${Math.round((1 - (match.distance || 0)) * 100)}%`)
      })
    }

    return data.results || []
  } catch (error) {
    console.log('❌ Exception:', error.message)
    return false
  }
}

// Test 2: Check if match-ranking Edge Function is deployed
async function testMatchRanking(searchResults) {
  console.log('\n📍 Test 2: Match Ranking Edge Function')
  console.log('-' .repeat(60))

  if (!searchResults || searchResults.length === 0) {
    console.log('⚠️  Skipping - no search results to rank')
    return
  }

  try {
    console.log('Testing ranking with search results...')

    const { data, error } = await supabase.functions.invoke('match-ranking', {
      body: {
        query: 'technical cofounder who knows AI',
        matches: searchResults
      }
    })

    if (error) {
      console.log('❌ Error:', error.message)
      return
    }

    console.log('✅ Function deployed and working!')
    console.log(`   Ranked ${data.results?.length || 0} profiles`)

    if (data.results && data.results.length > 0) {
      console.log('\n   AI-ranked matches:')
      data.results.slice(0, 3).forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.profile?.name || 'Unknown'} - ${Math.round(match.match_score * 100)}%`)
        console.log(`      Explanation: ${match.explanation}`)
      })
    }
  } catch (error) {
    console.log('❌ Exception:', error.message)
  }
}

// Test 3: Check database RPC function
async function testDatabaseRPC() {
  console.log('\n📍 Test 3: Database match_profiles RPC Function')
  console.log('-' .repeat(60))

  try {
    // Create a test embedding (1536 zeros - just for testing)
    const testEmbedding = new Array(1536).fill(0)
    testEmbedding[0] = 1 // Make it non-zero

    const { data, error } = await supabase.rpc('match_profiles', {
      query_embedding: testEmbedding,
      match_threshold: 0.5,
      match_count: 5
    })

    if (error) {
      console.log('❌ RPC Error:', error.message)
      console.log('   This function might not be deployed in the database')
      return
    }

    console.log('✅ RPC function exists and working!')
    console.log(`   Returned ${data?.length || 0} matches`)
  } catch (error) {
    console.log('❌ Exception:', error.message)
  }
}

// Test 4: Check profiles have embeddings
async function checkEmbeddingsCoverage() {
  console.log('\n📍 Test 4: Embeddings Coverage')
  console.log('-' .repeat(60))

  try {
    const { count: profileCount } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    const { count: embeddingCount } = await supabase
      .from('profile_embeddings')
      .select('profile_id', { count: 'exact', head: true })

    console.log(`   Total profiles: ${profileCount}`)
    console.log(`   Profiles with embeddings: ${embeddingCount}`)

    if (profileCount > 0) {
      const coverage = Math.round((embeddingCount / profileCount) * 100)
      console.log(`   Coverage: ${coverage}%`)

      if (coverage === 100) {
        console.log('   ✅ All profiles have embeddings!')
      } else {
        console.log(`   ⚠️  ${profileCount - embeddingCount} profiles missing embeddings`)
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// Test 5: Test natural language queries
async function testNaturalLanguageQueries() {
  console.log('\n📍 Test 5: Natural Language Query Examples')
  console.log('-' .repeat(60))

  const testQueries = [
    'technical cofounder who knows AI',
    'designer looking for startups',
    'product manager with experience in fintech',
  ]

  for (const query of testQueries) {
    console.log(`\n   Query: "${query}"`)

    try {
      const { data, error } = await supabase.functions.invoke('search-profiles', {
        body: { query, limit: 3 }
      })

      if (error) {
        console.log(`   ❌ Error: ${error.message}`)
        continue
      }

      console.log(`   ✅ Found ${data.results?.length || 0} matches`)
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`)
    }
  }
}

// Run all tests
async function main() {
  await checkEmbeddingsCoverage()
  await testDatabaseRPC()

  const searchResults = await testSearchFunction()

  if (searchResults && searchResults.length > 0) {
    await testMatchRanking(searchResults)
  }

  await testNaturalLanguageQueries()

  console.log('\n' + '=' .repeat(60))
  console.log('✅ Testing complete!')
  console.log('\nℹ️  Summary:')
  console.log('   - search-profiles: Vector similarity search with OpenAI embeddings')
  console.log('   - match-ranking: AI-powered ranking with explanations (GPT-4o Mini)')
  console.log('   - Natural language queries supported')
}

main()
