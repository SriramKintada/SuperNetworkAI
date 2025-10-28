import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query, limit = 20, communityId = null } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    console.log('Search request from user:', user.id)
    console.log('Community filter:', communityId || 'none (public search)')

    // Generate embedding for query
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    })

    const { data: embeddingData } = await embeddingResponse.json()
    const queryEmbedding = embeddingData[0].embedding

    // Vector similarity search
    const { data: matches, error } = await supabaseClient.rpc('match_profiles', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit * 3, // Get more results for filtering
    })

    if (error) throw error

    console.log('Initial matches found:', matches?.length || 0)

    // Apply privacy-aware filtering
    const filteredMatches = []

    for (const match of matches || []) {
      // Skip self
      if (match.user_id === user.id) continue

      // Check visibility settings
      const visibility = match.visibility || 'community_only'

      if (communityId) {
        // COMMUNITY SEARCH: Only show members of this community
        const { data: membership } = await supabaseClient
          .from('community_members')
          .select('id, visible_in_community')
          .eq('community_id', communityId)
          .eq('user_id', match.user_id)
          .eq('status', 'active')
          .single()

        if (!membership || !membership.visible_in_community) {
          console.log('Filtered out (not in community or hidden):', match.name)
          continue // Not in this community or hidden
        }

        // User is in community and visible
        filteredMatches.push(match)
      } else {
        // PUBLIC SEARCH: Apply privacy rules
        if (visibility === 'private') {
          console.log('Filtered out (private profile):', match.name)
          continue // Private profiles never appear in public search
        }

        if (visibility === 'community_only') {
          // Check if searcher shares ANY community with this profile
          const { data: sharedCommunities } = await supabaseClient
            .from('community_members')
            .select('community_id')
            .eq('user_id', user.id)
            .eq('status', 'active')

          if (!sharedCommunities || sharedCommunities.length === 0) {
            console.log('Filtered out (community_only, searcher has no communities):', match.name)
            continue
          }

          const userCommunityIds = sharedCommunities.map(c => c.community_id)

          const { data: profileCommunities } = await supabaseClient
            .from('community_members')
            .select('community_id')
            .eq('user_id', match.user_id)
            .eq('status', 'active')
            .in('community_id', userCommunityIds)

          if (!profileCommunities || profileCommunities.length === 0) {
            console.log('Filtered out (community_only, no shared communities):', match.name)
            continue // No shared communities
          }
        }

        // Check show_in_search flag
        if (match.show_in_search === false) {
          console.log('Filtered out (show_in_search=false):', match.name)
          continue
        }

        // Profile is visible
        filteredMatches.push(match)
      }

      if (filteredMatches.length >= limit) break
    }

    console.log('Filtered matches:', filteredMatches.length)

    return new Response(JSON.stringify({
      results: filteredMatches,
      total: filteredMatches.length,
      searchType: communityId ? 'community' : 'public'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Search error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
