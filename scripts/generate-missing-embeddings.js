// Generate embeddings for existing profiles that don't have them
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

async function generateMissingEmbeddings() {
  console.log('🔍 Finding profiles without embeddings...')
  console.log('=' .repeat(60))

  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, headline, bio, intent_text, skills, location')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message)
      process.exit(1)
    }

    console.log(`Found ${profiles.length} total profiles`)

    // Get existing embeddings
    const { data: existingEmbeddings, error: embeddingsError } = await supabase
      .from('profile_embeddings')
      .select('profile_id')

    if (embeddingsError) {
      console.error('❌ Error fetching embeddings:', embeddingsError.message)
      process.exit(1)
    }

    const embeddedProfileIds = new Set(existingEmbeddings?.map(e => e.profile_id) || [])
    console.log(`Found ${embeddedProfileIds.size} profiles with embeddings`)

    // Find profiles without embeddings
    const profilesWithoutEmbeddings = profiles.filter(p => !embeddedProfileIds.has(p.id))

    console.log(`Need to generate embeddings for ${profilesWithoutEmbeddings.length} profiles`)
    console.log('')

    if (profilesWithoutEmbeddings.length === 0) {
      console.log('✅ All profiles already have embeddings!')
      return
    }

    // Generate embeddings for each profile
    for (const profile of profilesWithoutEmbeddings) {
      console.log(`Processing: ${profile.name}`)

      // Create embedding text
      const skillsText = Array.isArray(profile.skills) ? profile.skills.join(', ') : ''
      const embeddingText = [
        profile.name,
        profile.headline || '',
        profile.bio || '',
        profile.location ? `Based in ${profile.location}` : '',
        skillsText ? `Skills: ${skillsText}` : '',
        profile.intent_text || ''
      ].filter(Boolean).join('. ')

      console.log(`  Text length: ${embeddingText.length} characters`)

      if (embeddingText.trim().length < 10) {
        console.log('  ⚠️  Skipping - insufficient profile data')
        continue
      }

      try {
        // Generate embedding
        console.log('  Generating embedding...')
        const embedding = await generateEmbedding(embeddingText)
        console.log(`  ✅ Embedding generated (${embedding.length} dimensions)`)

        // Create hash of text for caching
        const crypto = await import('crypto')
        const hash = crypto.createHash('md5').update(embeddingText).digest('hex')

        // Store embedding
        const { error: insertError } = await supabase
          .from('profile_embeddings')
          .upsert({
            profile_id: profile.id,
            embedding: embedding,
            embedding_text: embeddingText,
            embedding_text_hash: hash,
          })

        if (insertError) {
          console.error(`  ❌ Error storing embedding:`, insertError.message)
        } else {
          console.log('  ✅ Embedding stored successfully')
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error) {
        console.error(`  ❌ Error:`, error.message)
      }

      console.log('')
    }

    console.log('=' .repeat(60))
    console.log('✅ Embedding generation complete!')
    console.log('')

    // Verify final count
    const { count } = await supabase
      .from('profile_embeddings')
      .select('id', { count: 'exact', head: true })

    console.log(`📊 Final Stats:`)
    console.log(`  Total profiles: ${profiles.length}`)
    console.log(`  Profiles with embeddings: ${count}`)
    console.log(`  Missing embeddings: ${profiles.length - count}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error)
    process.exit(1)
  }
}

generateMissingEmbeddings()
