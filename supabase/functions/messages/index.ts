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
      const { recipient_id, content } = await req.json()

      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id,
          content,
        })
        .select()
        .single()

      if (error) throw error

      // Create notification
      await supabaseClient.from('notifications').insert({
        user_id: recipient_id,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message`,
        related_user_id: user.id,
      })

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const otherUserId = url.searchParams.get('user_id')

      const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      return new Response(JSON.stringify({ messages: data }), {
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
