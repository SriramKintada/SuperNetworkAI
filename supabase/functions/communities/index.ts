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

    const url = new URL(req.url)
    const communityId = url.pathname.split('/').pop()

    // GET /communities - List all communities
    if (req.method === 'GET' && !communityId) {
      const { data, error } = await supabaseClient
        .from('communities')
        .select('*, member_count')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ communities: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /communities/:id - Get community details
    if (req.method === 'GET' && communityId) {
      const { data, error } = await supabaseClient
        .from('communities')
        .select('*, community_members(*)')
        .eq('id', communityId)
        .single()

      if (error) throw error

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /communities - Create community
    if (req.method === 'POST' && !communityId) {
      const { name, description, type, logo_url } = await req.json()

      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      const { data: community, error: communityError } = await supabaseClient
        .from('communities')
        .insert({
          name,
          description,
          type,
          logo_url,
          created_by: user.id,
        })
        .select()
        .single()

      if (communityError) throw communityError

      // Add creator as admin member
      const { error: memberError } = await supabaseClient
        .from('community_members')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      // Create invite code
      const { data: invite } = await supabaseClient
        .from('invite_codes')
        .insert({
          community_id: community.id,
          code: inviteCode,
          created_by: user.id,
          max_uses: null, // unlimited
        })
        .select()
        .single()

      return new Response(JSON.stringify({ community, invite_code: invite.code }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /communities/:id/join - Join community with invite code
    if (req.method === 'POST' && communityId && url.searchParams.has('action') && url.searchParams.get('action') === 'join') {
      const { invite_code } = await req.json()

      // Verify invite code
      const { data: invite, error: inviteError } = await supabaseClient
        .from('invite_codes')
        .select('*')
        .eq('code', invite_code)
        .eq('community_id', communityId)
        .single()

      if (inviteError || !invite) throw new Error('Invalid invite code')

      // Check if expired
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        throw new Error('Invite code expired')
      }

      // Check if max uses reached
      if (invite.max_uses && invite.uses_count >= invite.max_uses) {
        throw new Error('Invite code max uses reached')
      }

      // Check if already member
      const { data: existingMember } = await supabaseClient
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single()

      if (existingMember) throw new Error('Already a member')

      // Add member
      const { data: member, error: memberError } = await supabaseClient
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member',
        })
        .select()
        .single()

      if (memberError) throw memberError

      // Increment invite uses
      await supabaseClient
        .from('invite_codes')
        .update({ uses_count: invite.uses_count + 1 })
        .eq('id', invite.id)

      return new Response(JSON.stringify({ success: true, member }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE /communities/:id/members/:userId - Leave community
    if (req.method === 'DELETE' && communityId) {
      const { error } = await supabaseClient
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid request')
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
