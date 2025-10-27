// Check what columns exist in profiles table
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking profiles table schema...\n')

  // Try to insert a minimal profile and see what error we get
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error querying profiles table:', error.message)
    return
  }

  if (data && data.length > 0) {
    console.log('Existing profile columns:')
    console.log(Object.keys(data[0]).join(', '))
  } else {
    console.log('No profiles exist yet. Checking table structure...')

    // Try a minimal insert to see what columns are expected
    const testInsert = await supabase
      .from('profiles')
      .insert({ id: '00000000-0000-0000-0000-000000000000' })
      .select()

    console.log('Insert error:', testInsert.error?.message)
  }
}

checkSchema()
