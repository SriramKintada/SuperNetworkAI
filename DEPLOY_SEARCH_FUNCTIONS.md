# Deploy Search & Matching Edge Functions

**Status:** ❌ **NOT DEPLOYED**

The main search and matching features need these Edge Functions deployed to Supabase.

---

## 🎯 What These Functions Do

### 1. `search-profiles` - Natural Language Search
- Converts user query to vector embedding (OpenAI)
- Searches profiles using vector similarity (pgvector)
- Returns ranked matches based on semantic similarity

**Example queries:**
- "technical cofounder who knows AI"
- "designer looking for startups"
- "product manager with fintech experience"

### 2. `match-ranking` - AI-Powered Match Explanations
- Takes search results and query
- Uses GPT-4o Mini to rank and explain matches
- Provides personalized match scores and reasons

---

## 🚀 Deployment Steps

### Option 1: Deploy via Supabase Dashboard (Recommended)

#### Deploy `search-profiles` Function

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

**Click:** "Create a new function" or "Deploy function"

**Function Name:** `search-profiles`

**Copy this code:**

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

**Click:** "Deploy function"

---

#### Deploy `match-ranking` Function

**Function Name:** `match-ranking`

**Copy this code:**

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

**Click:** "Deploy function"

---

### Step 2: Verify API Keys

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/functions

**Make sure these secrets exist:**
- ✅ `OPENAI_API_KEY` (should already be there from LinkedIn function)
- ✅ `SUPABASE_URL` (auto-provided)
- ✅ `SUPABASE_ANON_KEY` (auto-provided)

---

### Option 2: Deploy via Supabase CLI (if installed)

```bash
# Deploy search function
supabase functions deploy search-profiles

# Deploy ranking function
supabase functions deploy match-ranking
```

---

## 🧪 Testing After Deployment

### Test Search Function

```bash
node scripts/test-search-and-matching.js
```

**Expected output:**
```
✅ search-profiles: Found X results
✅ match-ranking: Ranked X profiles with explanations
```

### Test in Browser

1. Go to app (http://localhost:3000/search or production URL)
2. Enter query: "technical cofounder who knows AI"
3. Click "Search"
4. Should see real results with match scores

---

## 📊 What This Enables

Once deployed, users can:

### 1. Natural Language Search ✅
```
"technical cofounder who knows RAG"
"designer looking for startups"
"product manager with fintech experience"
```

### 2. Semantic Matching ✅
- Understands context and meaning
- Not just keyword matching
- Uses vector embeddings for similarity

### 3. AI-Powered Explanations ✅
```
"Strong match: Sarah has 8 years of AI/ML experience and
is actively seeking a business cofounder. Her background
in RAG systems aligns perfectly with your needs."
```

---

## 🎯 Architecture

```
User Query
    ↓
[search-profiles Function]
    ↓ Generate embedding
[OpenAI text-embedding-3-small]
    ↓ Query vector
[PostgreSQL pgvector]
    ↓ Top matches
[match-ranking Function]
    ↓ Rank with AI
[GPT-4o Mini]
    ↓ Ranked results
Frontend Display
```

---

## 💰 Cost Estimate

**Per search:**
- Query embedding: ~$0.00001 (OpenAI)
- Vector search: Free (database)
- AI ranking: ~$0.001-0.003 (GPT-4o Mini)

**Total: ~$0.003 per search** ✅ Very affordable!

---

## ✅ Deployment Checklist

- [ ] Deploy `search-profiles` function
- [ ] Deploy `match-ranking` function
- [ ] Verify `OPENAI_API_KEY` secret exists
- [ ] Test with `node scripts/test-search-and-matching.js`
- [ ] Test in browser at `/search` page
- [ ] Verify AI explanations are generated

---

## 🔍 Current Status

**Database:**
- ✅ `match_profiles` RPC function exists
- ✅ pgvector extension enabled
- ✅ IVFFlat index on embeddings
- ✅ 3/3 profiles have embeddings (100% coverage)

**Edge Functions:**
- ❌ `search-profiles` - NOT DEPLOYED
- ❌ `match-ranking` - NOT DEPLOYED
- ✅ `hyper-service` (LinkedIn) - DEPLOYED

**Frontend:**
- ✅ Search page ready (`app/search/page.tsx`)
- ✅ Calls `search-profiles` function
- ✅ Displays results with match scores
- ✅ Natural language input field

**Missing:**
- 🔴 Deploy the 2 Edge Functions above

---

## 🚀 Once Deployed

The **core feature of the app will work**:
- Natural language search ✅
- Vector similarity matching ✅
- AI-powered match explanations ✅
- Semantic understanding ✅

This is the **main value proposition** of SuperNetworkAI!
