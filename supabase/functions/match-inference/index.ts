import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { profileId, targetProfileId } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get both profiles
    const { data: userProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    const { data: targetProfile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', targetProfileId)
      .single()

    if (!userProfile || !targetProfile) {
      throw new Error('Profiles not found')
    }

    console.log('Generating match inference for:', userProfile.name, 'viewing', targetProfile.name)

    // Generate AI-based match inference
    const inferencePrompt = `You are an expert AI matchmaking assistant. Your task is to analyze why two professionals could be a valuable match and explain the connection potential.

USER'S PROFILE (the person searching):
Name: ${userProfile.name}
Role: ${userProfile.current_role} at ${userProfile.current_company || 'N/A'}
Bio: ${userProfile.bio || 'N/A'}
Intent: ${userProfile.intent_text || 'N/A'}
Skills: ${userProfile.skills?.join(', ') || 'N/A'}
Expertise: ${userProfile.expertise_areas?.join(', ') || 'N/A'}
Industries: ${userProfile.industries?.join(', ') || 'N/A'}
Location: ${userProfile.location || 'N/A'}

TARGET PROFILE (the person being viewed):
Name: ${targetProfile.name}
Role: ${targetProfile.current_role} at ${targetProfile.current_company || 'N/A'}
Bio: ${targetProfile.bio || 'N/A'}
Skills: ${targetProfile.skills?.join(', ') || 'N/A'}
Expertise: ${targetProfile.expertise_areas?.join(', ') || 'N/A'}
Industries: ${targetProfile.industries?.join(', ') || 'N/A'}
Experience Summary: ${targetProfile.experience_summary || 'N/A'}
Key Achievements: ${targetProfile.key_achievements?.join('; ') || 'N/A'}
All Roles: ${targetProfile.all_roles?.join(', ') || 'N/A'}
All Companies: ${targetProfile.all_companies?.join(', ') || 'N/A'}
Location: ${targetProfile.location || 'N/A'}

TASK:
Analyze how ${targetProfile.name} could be valuable to ${userProfile.name} based on ${userProfile.name}'s stated intent and background.

Generate a detailed match inference in JSON format:
{
  "match_score": 0-100 (how strong is this match),
  "match_category": "cofounder" | "advisor" | "client" | "investor" | "collaborator" | "mentor" | "peer",
  "headline": "One sentence explaining why this is a strong match (max 100 chars)",
  "key_strengths": [
    "Specific strength 1 with concrete evidence",
    "Specific strength 2 with concrete evidence",
    "Specific strength 3 with concrete evidence"
  ],
  "complementary_skills": [
    "Skill 1 that complements user's needs",
    "Skill 2 that complements user's needs"
  ],
  "shared_context": [
    "Shared industry/domain/interest 1",
    "Shared industry/domain/interest 2"
  ],
  "value_proposition": "2-3 sentence explanation of the unique value this person brings to the user based on their intent and background. Be specific and reference actual experience/achievements.",
  "next_steps": [
    "Actionable suggestion 1 for how to engage",
    "Actionable suggestion 2 for how to engage"
  ],
  "confidence_level": "high" | "medium" | "low"
}

INSTRUCTIONS:
- Be specific and reference actual skills, experience, companies, and achievements
- Focus on how the target profile can help the user achieve their stated intent
- Highlight complementary skills and expertise
- Mention shared context (industries, locations, communities) if relevant
- Provide actionable next steps for engagement
- Be honest about confidence level based on available information
- Use professional, encouraging tone

Return ONLY valid JSON, no markdown or extra text.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI matchmaking assistant specializing in professional networking and talent matching. Provide detailed, actionable insights based on comprehensive profile analysis.'
          },
          {
            role: 'user',
            content: inferencePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    let inference = openaiData.choices[0].message.content

    // Clean up response
    inference = inference.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const matchInference = JSON.parse(inference)

    console.log('Match inference generated successfully')
    console.log('Match score:', matchInference.match_score)
    console.log('Match category:', matchInference.match_category)

    // Save to database for caching
    await supabaseClient
      .from('match_scores')
      .upsert({
        user_id: userProfile.user_id,
        match_user_id: targetProfile.user_id,
        score: matchInference.match_score / 100,
        explanation: matchInference.value_proposition,
        metadata: matchInference,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })

    return new Response(JSON.stringify({
      ...matchInference,
      cached: false,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Match inference error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to generate match inference'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
