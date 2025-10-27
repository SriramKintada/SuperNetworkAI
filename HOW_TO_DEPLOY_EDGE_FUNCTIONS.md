# How to Deploy Edge Functions - SuperNetworkAI

**Your Error:** "Entrypoint path does not exist"

**Root Cause:** Supabase CLI is not installed or configured on your system.

---

## ✅ Solution: Deploy via Supabase Dashboard (Easiest)

Since you don't have Supabase CLI installed, the **fastest and easiest way** is to deploy directly through the Supabase Dashboard web interface.

---

## 🚀 Step-by-Step: Deploy via Dashboard

### Deploy `search-profiles` Function

#### Step 1: Go to Functions Page

**URL:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

#### Step 2: Create New Function

Click: **"Create a new function"** or **"New function"**

#### Step 3: Configure Function

**Function name:** `search-profiles`

**Click:** "Continue"

#### Step 4: Paste Code

In the code editor, **delete everything** and paste this:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { query, limit = 20 } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

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
      match_count: limit,
    })

    if (error) throw error

    return new Response(JSON.stringify({ results: matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

#### Step 5: Deploy

Click: **"Deploy function"**

Wait ~30 seconds for deployment to complete.

---

### Deploy `match-ranking` Function

#### Step 1: Create Another Function

Go back to: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

Click: **"Create a new function"** again

#### Step 2: Configure Function

**Function name:** `match-ranking`

**Click:** "Continue"

#### Step 3: Paste Code

In the code editor, paste this:

```typescript
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
${matches.map((m: any, i: number) => `${i + 1}. ${m.name} - ${m.headline}
   Intent: ${m.intent_text}
   Skills: ${m.skills?.join(', ')}`).join('\n\n')}

Return ONLY valid JSON array (no markdown):
[{"profile_id": "uuid", "match_score": 95, "explanation": "reason"}, ...]`

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
      profile: matches.find((m: any) => m.id === r.profile_id),
      match_score: r.match_score / 100,
      explanation: r.explanation,
    }))

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
```

#### Step 4: Deploy

Click: **"Deploy function"**

Wait ~30 seconds.

---

### Verify API Keys (Important!)

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/functions

**Check these secrets exist:**
- ✅ `OPENAI_API_KEY` (should be there from `hyper-service`)
- ✅ `SUPABASE_URL` (auto-provided)
- ✅ `SUPABASE_ANON_KEY` (auto-provided)

If `OPENAI_API_KEY` is missing, add it:
1. Click "Add new secret"
2. Name: `OPENAI_API_KEY`
3. Value: Your OpenAI API key from `.env.local`
4. Click "Add secret"

---

## 🧪 Test After Deployment

### Test Script

```bash
node scripts/test-search-and-matching.js
```

**Expected output:**
```
✅ search-profiles: Found X results
✅ match-ranking: Ranked X profiles with explanations
```

### Test in Browser

1. Go to your app: http://localhost:3000/search (or your production URL)
2. Enter query: **"technical cofounder who knows AI"**
3. Click **"Search"**
4. Should see real results! ✅

---

## 📋 Deployment Checklist

- [ ] Deploy `search-profiles` via dashboard
- [ ] Deploy `match-ranking` via dashboard
- [ ] Verify `OPENAI_API_KEY` exists in secrets
- [ ] Run test script: `node scripts/test-search-and-matching.js`
- [ ] Test search in browser at `/search` page
- [ ] Verify results appear with match scores

---

## 🔧 Alternative: Deploy via Supabase CLI

If you want to use CLI in the future, here's how to set it up:

### Install Supabase CLI

**Windows (PowerShell):**
```powershell
scoop install supabase
```

**Or via npm:**
```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Initialize Project (First Time Only)

```bash
supabase init
```

This creates `config.toml` which you need.

### Link to Your Project

```bash
supabase link --project-ref mpztkfmhgbbidrylngbw
```

### Deploy Functions

```bash
# Deploy individual function
supabase functions deploy search-profiles

# Deploy all functions
supabase functions deploy
```

---

## ❓ Why CLI Failed

**Error:** "Entrypoint path does not exist"

**Reasons:**
1. ❌ Supabase CLI not installed (`where supabase` returned nothing)
2. ❌ No `config.toml` file in `supabase/` directory
3. ❌ Project not linked to Supabase

**Solution:** Use the **dashboard method above** - it's faster and doesn't require CLI setup.

---

## ✅ Files Already Exist (Good News!)

Your function files are already in the correct location:

```
✅ supabase/functions/search-profiles/index.ts
✅ supabase/functions/match-ranking/index.ts
```

The code is complete and ready. You just need to deploy it via the dashboard!

---

## 🎯 Next Steps

1. **Deploy via Dashboard** (10 minutes)
   - Follow steps above
   - Copy/paste code
   - Click deploy

2. **Test** (2 minutes)
   - Run test script
   - Try search in browser

3. **Done!** 🎉
   - Natural language search will work
   - AI match explanations will appear
   - Core features will be live

---

## 💡 Pro Tip

**Dashboard deployment is actually easier** than CLI for one-time deployments:
- No installation needed ✅
- No config files needed ✅
- Visual editor with syntax highlighting ✅
- Instant logs and monitoring ✅
- One-click deploy ✅

Save CLI for when you're doing frequent deployments during development.

---

## 🚀 After Deployment

Once both functions are deployed, your app's **core value proposition will work**:

✅ **Natural language search**
- "technical cofounder who knows AI"
- "designer looking for startups"

✅ **AI-powered matching**
- Match scores (0-100%)
- Personalized explanations

✅ **Semantic understanding**
- Vector similarity search
- Context-aware matching

**Cost per search:** ~$0.003 (very affordable!)

---

## 📞 Need Help?

If deployment fails:
1. Check function logs in dashboard
2. Verify `OPENAI_API_KEY` secret exists
3. Ensure `match_profiles` RPC function exists in database
4. Run: `node scripts/test-search-and-matching.js` for detailed diagnostics

Good luck! The dashboard method should work perfectly. 🚀
