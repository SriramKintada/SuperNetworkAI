# SuperNetworkAI - Architecture Decisions

**Date:** 2025-10-26
**Status:** Active

---

## AI/LLM Stack

### **Decision: Use GPT-4o Mini for All LLM Operations**

**Rationale:**
- Cost-effective: ~90% cheaper than GPT-4 Turbo
- Fast response times: Sub-second latency
- Sufficient capability for our use cases
- Better rate limits on free tier

**Use Cases:**

| Feature | Model | Purpose | Est. Cost |
|---------|-------|---------|-----------|
| **Match Ranking** | GPT-4o Mini | Re-rank top 20 search results | $0.15/1M input, $0.60/1M output |
| **Intent Extraction** | GPT-4o Mini | Extract structured intent from text | Same as above |
| **Profile Quality Check** | GPT-4o Mini | Validate profile completeness | Same as above |
| **Match Explanations** | GPT-4o Mini | Generate "why you match" text | Same as above |

**Implementation:**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// For all LLM calls
const response = await openai.chat.completions.create({
  model: 'gpt-4o-mini', // Always use this
  messages: [...],
  temperature: 0.7,
});
```

**DO NOT USE:**
- ❌ Claude Sonnet 4 (too expensive, $3/1M input)
- ❌ Claude Haiku (not available via OpenAI API)
- ❌ GPT-4 Turbo (unnecessary cost)
- ❌ GPT-3.5 Turbo (deprecated)

---

## Embeddings

### **Decision: Use text-embedding-3-small**

**Rationale:**
- 1536 dimensions (optimal for pgvector)
- $0.02/1M tokens (very cheap)
- High quality semantic search
- Fast generation (<100ms per profile)

**Implementation:**
```typescript
const embeddingResponse = await openai.embeddings.create({
  model: 'text-embedding-3-small', // Always use this
  input: profileText,
});

const embedding = embeddingResponse.data[0].embedding; // 1536 dimensions
```

**Database Schema:**
```sql
CREATE TABLE profile_embeddings (
  embedding VECTOR(1536) NOT NULL, -- Matches text-embedding-3-small
  -- ...
);
```

**DO NOT USE:**
- ❌ text-embedding-3-large (3072 dims, overkill)
- ❌ text-embedding-ada-002 (older model)
- ❌ Claude embeddings (not available)

---

## Database

### **Decision: Supabase PostgreSQL + pgvector**

**Rationale:**
- Built-in pgvector extension for vector search
- RLS for security
- Realtime subscriptions
- Generous free tier

**Configuration:**
- **Extension:** pgvector
- **Vector Dimensions:** 1536 (matches embeddings)
- **Index:** IVFFlat with lists=100 (tune as data grows)
- **Distance Metric:** Cosine similarity (`<=>`)

**Vector Search Pattern:**
```sql
SELECT * FROM match_profiles(
  query_embedding VECTOR(1536),
  match_threshold 0.6,
  match_count 20
);
```

---

## Caching Strategy

### **Decision: In-Database Caching (match_scores table)**

**Rationale:**
- Simpler than Redis for MVP
- TTL via expires_at column
- Automatic cleanup with cron job

**Implementation:**
```sql
CREATE TABLE match_scores (
  user_id UUID,
  match_user_id UUID,
  score DECIMAL(3,2),
  explanation JSONB,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE(user_id, match_user_id)
);
```

**Future:** Add Redis (Upstash) for high-frequency caching in Phase 4+

---

## Authentication

### **Decision: Supabase Auth**

**Rationale:**
- Integrated with PostgreSQL
- JWT-based
- RLS integration via auth.uid()
- OAuth providers ready

**Flow:**
1. User signs up → Supabase Auth creates user
2. Trigger auto-creates profile in profiles table
3. JWT token issued
4. Frontend stores token
5. All API calls use JWT for auth.uid()

**RLS Pattern:**
```sql
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
```

---

## API Architecture

### **Decision: Supabase Edge Functions (Deno)**

**Rationale:**
- Serverless, auto-scaling
- Close to database (low latency)
- TypeScript native
- Free tier: 500K requests/month

**Structure:**
```
supabase/functions/
├── search/              # Semantic search API
├── match-ranking/       # LLM re-ranking
├── profile-update/      # CRUD operations
└── generate-embedding/  # Embedding generation
```

**Standard Pattern:**
```typescript
import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_ANON_KEY'),
    { global: { headers: { Authorization: req.headers.get('Authorization') } } }
  );

  // Function logic
});
```

---

## Cost Optimization

### **Estimated Monthly Costs (1,000 active users)**

| Service | Usage | Cost |
|---------|-------|------|
| **Supabase** | 1K users, 10K searches | FREE (within limits) |
| **OpenAI Embeddings** | 1K profiles × 500 tokens | $0.01 |
| **GPT-4o Mini (Matching)** | 10K searches × 2K tokens | $3.00 |
| **GPT-4o Mini (Intent)** | 1K profiles × 100 tokens | $0.15 |
| **TOTAL** | | **~$3.16/month** |

**Scaling to 10K users:** ~$31/month

---

## Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **Search Latency** | <2s | pgvector IVFFlat index |
| **Embedding Generation** | <500ms | OpenAI API (fast) |
| **LLM Match Ranking** | <3s | Batch top 20 results |
| **Profile Load** | <200ms | Database indexes |
| **Auth Check** | <50ms | JWT validation |

---

## Security

### **Row-Level Security (RLS) Policies**

**Key Principles:**
1. **Always** enable RLS on public tables
2. **Always** use `auth.uid()` for user identification
3. **Never** expose service_role key to frontend
4. **Always** validate inputs in Edge Functions

**Visibility Levels:**
- `public` - Anyone can see
- `community_only` - Only community members
- `private` - Only user themselves

---

## Future Considerations

### **Phase 2+:**
- Add Redis for search result caching
- Implement rate limiting (Upstash)
- Add email notifications (Resend)

### **Phase 3+:**
- Optimize vector index (tune lists parameter)
- Add batch embedding generation
- Implement background jobs

### **Phase 4+:**
- A/B test match ranking prompts
- Fine-tune embedding model
- Add monitoring (Sentry, PostHog)

---

## References

- **OpenAI Models:** https://platform.openai.com/docs/models
- **pgvector Docs:** https://github.com/pgvector/pgvector
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Debugging Playbook:** See `important_reference_files/The_AI_Agent_Debugging_Playbook.md`

---

**Last Updated:** 2025-10-26
**Next Review:** After Phase 2 completion
