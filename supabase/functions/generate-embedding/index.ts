import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { profileId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (!profile) throw new Error('Profile not found')

    // Generate comprehensive embedding text
    // Prefer vectorization_text (created by LinkedIn enrichment) for comprehensive semantic search
    // Fall back to building text from available fields
    const embeddingText = profile.vectorization_text ||
      `${profile.name}. ${profile.headline || ''}. ${profile.bio || ''}. ${profile.experience_summary || ''}. ${profile.intent_text || ''}. Skills: ${profile.skills?.join(', ') || ''}. Industries: ${profile.industries?.join(', ') || ''}. Expertise: ${profile.expertise_areas?.join(', ') || ''}. Location: ${profile.location || ''}. Roles: ${profile.all_roles?.join(', ') || ''}. Companies: ${profile.all_companies?.join(', ') || ''}. Education: ${profile.education_summary || ''}. Achievements: ${profile.key_achievements?.join('. ') || ''}.`

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: embeddingText,
      }),
    })

    const { data: embeddingData } = await response.json()
    const embedding = embeddingData[0].embedding

    // Store embedding
    await supabaseClient
      .from('profile_embeddings')
      .upsert({
        profile_id: profileId,
        embedding,
        embedding_text: embeddingText,
        embedding_text_hash: await crypto.subtle.digest('SHA-256', new TextEncoder().encode(embeddingText)).then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('')),
      })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
