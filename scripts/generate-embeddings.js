/**
 * Generate embeddings for all existing profiles
 * Run this after initial deployment or when profiles are imported
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function generateEmbeddings() {
  console.log('🤖 Generating embeddings for all profiles...\n')

  // Get all profiles without embeddings
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, name, headline, bio, intent_text, skills')
    .is('profile_complete', true)

  if (error) {
    console.error('❌ Error fetching profiles:', error)
    process.exit(1)
  }

  console.log(`Found ${profiles.length} profiles\n`)

  let successCount = 0
  let errorCount = 0

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < profiles.length; i += batchSize) {
    const batch = profiles.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(profiles.length / batchSize)}...`)

    const promises = batch.map(async (profile) => {
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/generate-embedding`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ profileId: profile.id }),
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        successCount++
        console.log(`   ✅ ${profile.name}`)
      } catch (error) {
        errorCount++
        console.error(`   ❌ ${profile.name}: ${error.message}`)
      }
    })

    await Promise.all(promises)

    // Rate limit: wait 1 second between batches
    if (i + batchSize < profiles.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Success: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log(`📊 Total: ${profiles.length}`)
  console.log('='.repeat(50))
}

generateEmbeddings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
