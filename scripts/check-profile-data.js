// Check what data is in the profiles
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

async function main() {
  console.log('🔍 Checking Profile Data')
  console.log('=' .repeat(60))

  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.log('❌ Error:', error.message)
    return
  }

  console.log(`\nFound ${profiles.length} profiles:\n`)

  profiles.forEach((profile, i) => {
    console.log(`${i + 1}. ${profile.name || 'No name'}`)
    console.log(`   Headline: ${profile.headline || 'No headline'}`)
    console.log(`   Bio: ${profile.bio || 'No bio'}`)
    console.log(`   Intent: ${profile.intent_text || 'No intent'}`)
    console.log(`   Skills: ${profile.skills?.join(', ') || 'No skills'}`)
    console.log(`   Location: ${profile.location || 'No location'}`)
    console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`)
    console.log()
  })

  // Get all embeddings
  const { data: embeddings } = await supabase
    .from('profile_embeddings')
    .select('profile_id, embedding_text')
    .order('created_at', { ascending: false })

  console.log('=' .repeat(60))
  console.log(`\nEmbedding texts:\n`)

  embeddings.forEach((emb, i) => {
    console.log(`${i + 1}. Profile ID: ${emb.profile_id}`)
    console.log(`   Text: ${emb.embedding_text}`)
    console.log()
  })

  // Test search with lower threshold
  console.log('=' .repeat(60))
  console.log('\n🧪 Testing search with different thresholds:\n')

  const testQuery = 'technical cofounder who knows AI'

  // Generate embedding for test query
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: testQuery,
    }),
  })

  const { data: embeddingData } = await embeddingResponse.json()
  const queryEmbedding = embeddingData[0].embedding

  // Try different thresholds
  for (const threshold of [0.0, 0.3, 0.5, 0.7]) {
    const { data: matches } = await supabase.rpc('match_profiles', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: 10,
    })

    console.log(`Threshold ${threshold}: ${matches?.length || 0} matches`)
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        console.log(`   - ${match.name}: similarity = ${1 - match.distance}`)
      })
    }
  }
}

main()
