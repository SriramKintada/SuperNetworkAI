// Create test profiles with meaningful data
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

const testProfiles = [
  {
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    headline: 'Senior AI Engineer at Google',
    bio: 'Passionate about machine learning and artificial intelligence. 8 years of experience building RAG systems and LLM applications. Looking for a business cofounder to build the next generation of AI tools.',
    intent_text: 'Finding a Cofounder, Seeking Investment',
    skills: ['AI', 'Machine Learning', 'RAG', 'LLMs', 'Python', 'TensorFlow', 'PyTorch'],
    location: 'San Francisco, CA',
  },
  {
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@example.com',
    headline: 'Product Designer at Figma',
    bio: 'Creative product designer with a passion for user experience. 5 years of experience designing products for startups and large companies. Looking for early-stage startup opportunities.',
    intent_text: 'Finding a Cofounder, Learning & Mentorship',
    skills: ['UI/UX Design', 'Figma', 'Product Strategy', 'User Research', 'Prototyping'],
    location: 'New York, NY',
  },
  {
    name: 'Jordan Kim',
    email: 'jordan.kim@example.com',
    headline: 'Founder & CEO at FinTech Startup',
    bio: 'Serial entrepreneur with 2 successful exits. Expert in fintech, payments, and blockchain. Currently seeking technical cofounder for new venture in decentralized finance.',
    intent_text: 'Finding a Cofounder, Hiring Talent',
    skills: ['Fintech', 'Blockchain', 'Business Strategy', 'Fundraising', 'Product Management'],
    location: 'Austin, TX',
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    headline: 'Full Stack Developer at Stripe',
    bio: 'Full-stack engineer specializing in React, Node.js, and cloud infrastructure. Passionate about building scalable systems. Open to cofounder opportunities or advisory roles.',
    intent_text: 'Finding a Cofounder, Strategic Partnerships',
    skills: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'TypeScript', 'Docker', 'Kubernetes'],
    location: 'Seattle, WA',
  },
]

async function main() {
  console.log('🚀 Creating Test Profiles with Meaningful Data')
  console.log('=' .repeat(60))

  // Get an existing user ID
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('user_id')
    .limit(1)

  if (!existingProfiles || existingProfiles.length === 0) {
    console.log('❌ No existing profiles found. Need at least one user to create test profiles.')
    return
  }

  const existingUserId = existingProfiles[0].user_id
  console.log(`\n✅ Using existing user ID: ${existingUserId}`)

  for (const profileData of testProfiles) {
    console.log(`\n📝 Creating profile: ${profileData.name}`)

    // Use existing user ID (profiles can share user_id for testing)
    const userId = existingUserId

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name: profileData.name,
        email: profileData.email,
        headline: profileData.headline,
        bio: profileData.bio,
        intent_text: profileData.intent_text,
        skills: profileData.skills,
        location: profileData.location,
      })
      .select()
      .single()

    if (profileError) {
      console.log(`   ❌ Error creating profile: ${profileError.message}`)
      continue
    }

    console.log(`   ✅ Profile created with ID: ${profile.id}`)

    // Generate embedding text
    const embeddingText = `${profileData.headline}. ${profileData.bio}. ${profileData.location ? 'Based in ' + profileData.location + '.' : ''} Skills: ${profileData.skills.join(', ')}. Looking for: ${profileData.intent_text}.`

    console.log(`   📊 Generating embedding...`)

    // Generate embedding
    const embedding = await generateEmbedding(embeddingText)

    // Create hash
    const hash = crypto.createHash('sha256').update(embeddingText).digest('hex')

    // Store embedding
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

    console.log(`   ✅ Embedding created and stored`)
  }

  console.log('\n' + '=' .repeat(60))
  console.log('✅ Test profiles created successfully!')
  console.log('\n📊 Database now has profiles with:')
  console.log('   - Meaningful bios and headlines')
  console.log('   - Skills and locations')
  console.log('   - Intent texts')
  console.log('   - Vector embeddings')
  console.log('\n🔍 Try searching now with queries like:')
  console.log('   - "technical cofounder who knows AI"')
  console.log('   - "designer looking for startups"')
  console.log('   - "product manager with fintech experience"')
}

main()
