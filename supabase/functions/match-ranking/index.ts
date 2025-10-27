import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query, matches } = await req.json()

    const prompt = `Rank these ${matches.length} profiles by compatibility with query: "${query}"

Profiles:
${matches.map((m: any, i: number) => `Profile ${i}: ${m.name} - ${m.headline}\n   Intent: ${m.intent_text}\n   Skills: ${m.skills?.join(', ')}`).join('\n\n')}

Return ONLY valid JSON array (no markdown):
[{"profile_index": 0, "match_score": 95, "explanation": "reason"}, ...]

Use profile_index (0, 1, 2...) to identify profiles, not IDs.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    const { choices } = await response.json()
    let responseText = choices[0].message.content
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const ranked = JSON.parse(responseText)

    const results = ranked.map((r: any) => ({
      profile: matches[r.profile_index],
      match_score: r.match_score / 100,
      explanation: r.explanation,
    })).filter((r: any) => r.profile !== undefined)

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
