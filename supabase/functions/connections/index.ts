import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { user } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    if (req.method === 'POST') {
      const { target_user_id, message } = await req.json()

      const [userId1, userId2] = [user.id, target_user_id].sort()

      const { data, error } = await supabaseClient
        .from('connections')
        .insert({
          user_id_1: userId1,
          user_id_2: userId2,
          initiated_by: user.id,
          message,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient.rpc('get_user_connections', {
        target_user_id: user.id,
      })

      if (error) throw error

      return new Response(JSON.stringify({ connections: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      const url = new URL(req.url)
      const connectionId = url.searchParams.get('id')
      const { action } = await req.json()

      const { data, error } = await supabaseClient
        .from('connections')
        .update({
          status: action === 'accept' ? 'accepted' : 'declined',
          accepted_at: action === 'accept' ? new Date().toISOString() : null,
        })
        .eq('id', connectionId)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
