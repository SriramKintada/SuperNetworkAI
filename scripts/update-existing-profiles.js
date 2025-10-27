// Update existing profiles with meaningful data
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function generateEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  })

  const data = await response.json()
  return data.data[0].embedding
}

const profileUpdates = [
  {
    headline: 'Senior AI Engineer at Google',
    bio: 'Passionate about machine learning and artificial intelligence. 8 years of experience building RAG systems and LLM applications. Looking for a business cofounder to build the next generation of AI tools.',
    intent_text: 'Finding a Cofounder, Seeking Investment',
    skills: ['AI', 'Machine Learning', 'RAG', 'LLMs', 'Python', 'TensorFlow', 'PyTorch'],
    location: 'San Francisco, CA',
  },
  {
    headline: 'Product Designer at Figma',
    bio: 'Creative product designer with a passion for user experience. 5 years of experience designing products for startups and large companies. Looking for early-stage startup opportunities.',
    intent_text: 'Finding a Cofounder, Learning & Mentorship',
    skills: ['UI/UX Design', 'Figma', 'Product Strategy', 'User Research', 'Prototyping'],
    location: 'New York, NY',
  },
  {
    headline: 'Founder & CEO at FinTech Startup',
    bio: 'Serial entrepreneur with 2 successful exits. Expert in fintech, payments, and blockchain. Currently seeking technical cofounder for new venture in decentralized finance.',
    intent_text: 'Finding a Cofounder, Hiring Talent',
    skills: ['Fintech', 'Blockchain', 'Business Strategy', 'Fundraising', 'Product Management'],
    location: 'Austin, TX',
  },
]

async function main() {
  console.log('🔄 Updating Existing Profiles with Meaningful Data')
  console.log('=' .repeat(60))

  // Get existing profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(3)

  if (error || !profiles || profiles.length === 0) {
    console.log('❌ Error fetching profiles or no profiles found')
    return
  }

  console.log(`\n✅ Found ${profiles.length} profiles to update\n`)

  for (let i = 0; i < Math.min(profiles.length, profileUpdates.length); i++) {
    const profile = profiles[i]
    const update = profileUpdates[i]

    console.log(`📝 Updating profile: ${profile.name}`)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        headline: update.headline,
        bio: update.bio,
        intent_text: update.intent_text,
        skills: update.skills,
        location: update.location,
      })
      .eq('id', profile.id)

    if (updateError) {
      console.log(`   ❌ Error updating profile: ${updateError.message}`)
      continue
    }

    console.log(`   ✅ Profile updated`)

    // Generate embedding text
    const embeddingText = `${update.headline}. ${update.bio}. ${update.location ? 'Based in ' + update.location + '.' : ''} Skills: ${update.skills.join(', ')}. Looking for: ${update.intent_text}.`

    console.log(`   📊 Generating new embedding...`)

    // Generate embedding
    const embedding = await generateEmbedding(embeddingText)

    // Create hash
    const hash = crypto.createHash('sha256').update(embeddingText).digest('hex')

    // Delete old embedding
    await supabase
      .from('profile_embeddings')
      .delete()
      .eq('profile_id', profile.id)

    // Store new embedding
    const { error: embeddingError } = await supabase
      .from('profile_embeddings')
      .insert({
        profile_id: profile.id,
        embedding: embedding,
        embedding_text: embeddingText,
        embedding_text_hash: hash,
      })

    if (embeddingError) {
      console.log(`   ❌ Error creating embedding: ${embeddingError.message}`)
      continue
    }

    console.log(`   ✅ Embedding regenerated and stored\n`)
  }

  console.log('=' .repeat(60))
  console.log('✅ Profiles updated successfully!')
  console.log('\n📊 Database now has profiles with:')
  console.log('   - Meaningful bios and headlines')
  console.log('   - Skills and locations')
  console.log('   - Intent texts')
  console.log('   - Updated vector embeddings')
  console.log('\n🔍 Try searching now with queries like:')
  console.log('   - "technical cofounder who knows AI"')
  console.log('   - "designer looking for startups"')
  console.log('   - "fintech founder with blockchain experience"')
}

main()
