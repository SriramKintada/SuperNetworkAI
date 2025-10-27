// Test OpenAI embeddings generation and storage in Supabase vector DB
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testEmbeddingsStorage() {
  console.log('🧪 Testing OpenAI Embeddings & Vector DB Storage')
  console.log('=' .repeat(60))
  console.log('')

  try {
    // Step 1: Create test profile text
    const testProfileText = `Senior Software Engineer at Google. Passionate about AI, machine learning, and full-stack development.
    Based in San Francisco, CA. Skills: Python, React, TypeScript, Machine Learning, RAG, Vector Databases.
    Looking for: Finding a Cofounder, Strategic Partnerships.`

    console.log('Step 1: Test Profile Text')
    console.log(`Text: ${testProfileText.substring(0, 100)}...`)
    console.log(`Length: ${testProfileText.length} characters`)
    console.log('')

    // Step 2: Generate embedding using OpenAI text-embedding-3-small
    console.log('Step 2: Generating embedding with OpenAI text-embedding-3-small...')
    const embeddingStartTime = Date.now()

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: testProfileText,
      }),
    })

    const embeddingTime = ((Date.now() - embeddingStartTime) / 1000).toFixed(2)

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text()
      console.error('❌ OpenAI Embeddings API Error:', errorText)
      process.exit(1)
    }

    const embeddingData = await embeddingResponse.json()
    const embedding = embeddingData.data[0].embedding

    console.log(`✅ Embedding generated in ${embeddingTime}s`)
    console.log(`   Model: ${embeddingData.model}`)
    console.log(`   Dimensions: ${embedding.length}`)
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`)
    console.log(`   Usage: ${embeddingData.usage.total_tokens} tokens`)
    console.log('')

    // Step 3: Check if profiles table exists and has any profiles
    console.log('Step 3: Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, headline, bio, created_at')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error querying profiles table:', profilesError.message)
      console.log('   This might mean the table doesn\'t exist or RLS policies are blocking access')
    } else {
      console.log(`✅ Profiles table accessible`)
      console.log(`   Found ${profiles.length} profile(s)`)
      if (profiles.length > 0) {
        console.log(`   Latest profile: ${profiles[0].name} - ${profiles[0].headline || 'No headline'}`)
        console.log(`   Created: ${new Date(profiles[0].created_at).toLocaleString()}`)
      }
    }
    console.log('')

    // Step 4: Check profile_embeddings table
    console.log('Step 4: Checking profile_embeddings table...')
    const { data: embeddings, error: embeddingsError, count } = await supabase
      .from('profile_embeddings')
      .select('id, profile_id, created_at, updated_at', { count: 'exact' })
      .limit(5)

    if (embeddingsError) {
      console.error('❌ Error querying profile_embeddings table:', embeddingsError.message)
      console.log('   The table might not exist yet')
    } else {
      console.log(`✅ Profile embeddings table accessible`)
      console.log(`   Total embeddings stored: ${count}`)
      if (embeddings && embeddings.length > 0) {
        console.log(`   Latest embedding created: ${new Date(embeddings[0].created_at).toLocaleString()}`)
        console.log(`   Last updated: ${new Date(embeddings[0].updated_at).toLocaleString()}`)
      } else {
        console.log('   ⚠️  No embeddings found yet - this is expected if no profiles have been created')
      }
    }
    console.log('')

    // Step 5: Test vector similarity search (if embeddings exist)
    if (embeddings && embeddings.length > 0) {
      console.log('Step 5: Testing vector similarity search...')

      const { data: searchResults, error: searchError } = await supabase
        .rpc('match_profiles', {
          query_embedding: embedding,
          match_threshold: 0.3,
          match_count: 5,
        })

      if (searchError) {
        console.error('❌ Error running vector search:', searchError.message)
        console.log('   The match_profiles function might not exist yet')
      } else {
        console.log(`✅ Vector search successful`)
        console.log(`   Found ${searchResults?.length || 0} similar profiles`)
        if (searchResults && searchResults.length > 0) {
          console.log('   Top matches:')
          searchResults.forEach((result, idx) => {
            console.log(`     ${idx + 1}. ${result.name} - Similarity: ${(1 - result.distance).toFixed(3)}`)
          })
        }
      }
      console.log('')
    } else {
      console.log('Step 5: Skipping vector search (no embeddings in database yet)')
      console.log('')
    }

    // Summary
    console.log('=' .repeat(60))
    console.log('📊 Test Summary:')
    console.log(`  ✅ OpenAI embeddings API: Working (${embeddingTime}s)`)
    console.log(`  ✅ Embedding dimensions: ${embedding.length} (expected: 1536)`)
    console.log(`  ${profilesError ? '❌' : '✅'} Profiles table: ${profilesError ? 'Error' : 'Accessible'}`)
    console.log(`  ${embeddingsError ? '❌' : '✅'} Profile embeddings table: ${embeddingsError ? 'Error' : 'Accessible'}`)
    console.log(`  📈 Embeddings stored: ${count || 0}`)
    console.log('')

    if (count === 0) {
      console.log('⚠️  No embeddings in database yet.')
      console.log('   To test end-to-end:')
      console.log('   1. Complete onboarding with a profile')
      console.log('   2. Check that profile gets created')
      console.log('   3. Run this script again to verify embedding was stored')
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testEmbeddingsStorage()
