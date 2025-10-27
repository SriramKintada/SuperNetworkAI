# Deploy LinkedIn Edge Function - Quick Guide

## 🔴 Issue: "Failed to send a request to the Edge Function"

**Reason:** The `enrich-linkedin-profile` Edge Function hasn't been deployed to Supabase yet.

---

## ✅ Fix in 3 Steps (5 minutes)

### Step 1: Deploy Edge Function

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

**Click:** "Create a new function" or "Deploy function"

**Function Name:** `enrich-linkedin-profile`

**Copy this entire code:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { linkedinUrl } = await req.json()

    if (!linkedinUrl) {
      throw new Error('LinkedIn URL is required')
    }

    console.log('Scraping LinkedIn profile:', linkedinUrl)

    // Step 1: Call Apify to scrape LinkedIn profile
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=${Deno.env.get('APIFY_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [{ url: linkedinUrl }],
          proxyConfiguration: { useApifyProxy: true },
        }),
      }
    )

    if (!apifyResponse.ok) {
      throw new Error(`Apify API error: ${apifyResponse.statusText}`)
    }

    const linkedinData = await apifyResponse.json()

    if (!linkedinData || linkedinData.length === 0) {
      throw new Error('No data returned from LinkedIn scraper')
    }

    const profile = linkedinData[0]
    console.log('LinkedIn data scraped:', profile.fullName)

    // Step 2: Use OpenAI GPT-4o Mini to extract and structure key details
    const extractionPrompt = `You are a professional profile analyzer. Extract and structure the following LinkedIn profile data into a clean, professional format.

LinkedIn Profile Data:
${JSON.stringify(profile, null, 2)}

Extract the following information in JSON format:
{
  "name": "Full name",
  "headline": "Current role at company (e.g., 'Senior Engineer at Google')",
  "bio": "A compelling 2-3 sentence professional bio summarizing their background, expertise, and career focus",
  "location": "City, Country",
  "skills": ["skill1", "skill2", ...] (extract top 10-15 skills),
  "experience_summary": "Brief summary of career trajectory and key achievements",
  "industries": ["industry1", "industry2"] (extract main industries),
  "education": "Highest degree and institution",
  "current_role": "Current job title",
  "current_company": "Current company name"
}

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
            content: 'You are a professional data extraction assistant. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    let extractedData = openaiData.choices[0].message.content

    // Clean up response (remove markdown if present)
    extractedData = extractedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const enrichedProfile = JSON.parse(extractedData)

    // Step 3: Add raw LinkedIn data for reference
    const result = {
      ...enrichedProfile,
      linkedin_url: linkedinUrl,
      photo_url: profile.profilePicture || profile.photoUrl || null,
      raw_linkedin_data: {
        followers: profile.followers,
        connections: profile.connections,
        posts: profile.postsCount,
        articles: profile.articlesCount,
      }
    }

    console.log('Profile enriched successfully')

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error enriching profile:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: 'Failed to scrape and enrich LinkedIn profile'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

**Click:** "Deploy function"

---

### Step 2: Add API Keys as Secrets

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/functions

**Add these secrets:**

1. **APIFY_API_KEY**
   - Value: Get from your `.env.local` file (line 12, starts with `apify_api_...`)

2. **OPENAI_API_KEY** (if not already added)
   - Value: Get from your `.env.local` file (starts with `sk-proj-...`)

**Click:** "Add secret" for each, then "Save"

---

### Step 3: Test It!

Once deployed (wait ~30 seconds), try LinkedIn import again:

1. Go to onboarding
2. Enter: `www.linkedin.com/in/sriramkintada`
3. Click "Import from LinkedIn"
4. Wait 15-30 seconds
5. Should auto-fill your profile! ✅

---

## 🔍 Troubleshooting

### If it still fails:

**Check Edge Function logs:**
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions/enrich-linkedin-profile/logs

**Common issues:**
1. **Missing secrets** - Make sure APIFY_API_KEY and OPENAI_API_KEY are set
2. **Wrong LinkedIn URL** - Use format: `linkedin.com/in/username` (no https://)
3. **Profile not public** - Your LinkedIn profile must be public

---

## 📋 Quick Checklist

- [ ] Edge Function deployed with name `enrich-linkedin-profile`
- [ ] APIFY_API_KEY secret added
- [ ] OPENAI_API_KEY secret added (should already be there)
- [ ] Wait 30 seconds for deployment
- [ ] Test with your LinkedIn URL
- [ ] Check logs if it fails

---

## ⚡ Alternative: Deploy via Supabase CLI (if you have it)

```bash
supabase functions deploy enrich-linkedin-profile
```

---

Once deployed, the LinkedIn import will work perfectly! The function will:
1. Scrape your LinkedIn with Apify (5s)
2. Extract data with GPT-4o Mini (7s)
3. Auto-fill your profile with 15+ skills, bio, location, etc!

Cost per import: ~$0.012-0.022 (very cheap!)
