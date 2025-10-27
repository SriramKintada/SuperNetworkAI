// Direct HTTP test of search-profiles function
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function testSearchDirect() {
  console.log('🧪 Testing search-profiles directly via HTTP')
  console.log('=' .repeat(60))

  const url = `${SUPABASE_URL}/functions/v1/search-profiles`
  console.log('URL:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'technical cofounder who knows AI',
        limit: 10
      })
    })

    console.log('Status:', response.status, response.statusText)

    const text = await response.text()
    console.log('Response:', text)

    if (response.ok) {
      const data = JSON.parse(text)
      console.log('\n✅ Function working!')
      console.log('Results:', data.results?.length || 0)
    } else {
      console.log('\n❌ Function error')
    }
  } catch (error) {
    console.log('❌ Exception:', error.message)
  }
}

async function testMatchRankingDirect() {
  console.log('\n🧪 Testing match-ranking directly via HTTP')
  console.log('=' .repeat(60))

  const url = `${SUPABASE_URL}/functions/v1/match-ranking`
  console.log('URL:', url)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'technical cofounder',
        matches: [
          { id: '1', name: 'Test User', headline: 'Developer', intent_text: 'Looking for cofounders', skills: ['AI', 'ML'] }
        ]
      })
    })

    console.log('Status:', response.status, response.statusText)

    const text = await response.text()
    console.log('Response:', text.substring(0, 500))

    if (response.ok) {
      console.log('\n✅ Function working!')
    } else {
      console.log('\n❌ Function error')
    }
  } catch (error) {
    console.log('❌ Exception:', error.message)
  }
}

testSearchDirect().then(() => testMatchRankingDirect())
