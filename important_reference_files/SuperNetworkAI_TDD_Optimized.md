# SuperNetworkAI - Technical Design Document (TDD)

**Version:** 2.0  
**Date:** October 26, 2025  
**Technical Lead:** Sriram Kintada  
**Status:** Implementation Ready

---

## TABLE OF CONTENTS

1. [System Architecture](#1-system-architecture)
2. [Database Design](#2-database-design)
3. [API Specifications](#3-api-specifications)
4. [Edge Functions](#4-edge-functions)
5. [AI/LLM Integration](#5-aillm-integration)
6. [Authentication & Security](#6-authentication--security)
7. [File Storage](#7-file-storage)
8. [Caching Strategy](#8-caching-strategy)
9. [Performance Optimization](#9-performance-optimization)
10. [Error Handling & Logging](#10-error-handling--logging)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Critical Debugging Playbook](#13-critical-debugging-playbook)

---

## 1. SYSTEM ARCHITECTURE

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT LAYER                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │ Next.js  │  │  Mobile  │  │  Admin   │         │
│  │ Web App  │  │ (Future) │  │  Panel   │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│            SUPABASE EDGE FUNCTIONS                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Search  │  │ Matching │  │LinkedIn │          │
│  │ Service  │  │ Service  │  │ Import  │          │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│              CORE SERVICES LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │PostgreSQL│  │ pgvector │  │  Redis   │         │
│  │(Supabase)│  │(Embeddings)│ │(Upstash) │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│           EXTERNAL SERVICES LAYER                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Claude  │  │  OpenAI  │  │  Apify   │         │
│  │(Matching)│  │(Embeddings)│ │(Scraping)│         │
│  └──────────┘  └──────────┘  └──────────┘         │
│  ┌──────────┐  ┌──────────┐                       │
│  │  Resend  │  │  Sentry  │                       │
│  │  (Email) │  │ (Errors) │                       │
│  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Backend:**
- **Database:** PostgreSQL 15+ (Supabase)
- **Vector DB:** pgvector extension (1536 dims)
- **Cache:** Redis via Upstash
- **Storage:** Supabase Storage (S3-compatible)
- **Runtime:** Deno (Edge Functions)

**AI/ML:**
- **LLM:** Claude Sonnet 4 (Anthropic) - matching, extraction
- **Embeddings:** OpenAI text-embedding-3-small (1536d)
- **Scraping:** Apify actors for LinkedIn

**Infrastructure:**
- **Email:** Resend (transactional)
- **Monitoring:** Sentry (errors), PostHog (analytics)
- **Auth:** Supabase Auth (JWT + OAuth)

**Development:**
- **Languages:** TypeScript, SQL
- **Testing:** Vitest, Supertest
- **CI/CD:** GitHub Actions

### 1.3 Data Flow

**User Search Flow:**
```
1. User enters query: "technical cofounder with RAG"
2. Frontend → Edge Function: /api/search
3. Edge Function → OpenAI: Generate query embedding
4. Edge Function → PostgreSQL: Vector similarity search (top 20)
5. Edge Function → Claude: Re-rank top 20 by compatibility
6. Edge Function → PostgreSQL: Cache match scores (24h TTL)
7. Edge Function → Frontend: Return top 8 matches + explanations
8. User clicks match → Log to search_logs table
```

**Profile Creation Flow:**
```
1. User signs up → Supabase Auth creates user
2. Database trigger → Auto-create profile row
3. User imports LinkedIn → Edge Function calls Apify
4. Apify scrapes data → Edge Function parses JSON
5. Edge Function → Claude: Extract structured intent
6. Edge Function → PostgreSQL: Update profile
7. Edge Function → OpenAI: Generate profile embedding
8. Edge Function → PostgreSQL: Store in profile_embeddings
```

---

## 2. DATABASE DESIGN

### 2.1 Schema Overview

**Core Tables:**
- `profiles` - User profiles with intent, skills, visibility
- `profile_embeddings` - Vector embeddings for semantic search
- `communities` - Community metadata, settings, limits
- `community_members` - User-community relationships
- `connections` - Connection requests between users
- `messages` - Direct messages between connections
- `match_scores` - Cached AI-generated match scores
- `notifications` - In-app notifications
- `search_logs` - Analytics for search queries
- `admin_actions` - Audit log for admin actions

### 2.2 Complete SQL Schema

#### profiles

```sql
CREATE TABLE profiles (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  headline TEXT, -- e.g., "AI Engineer at Stripe"
  bio TEXT, -- 500 char max
  location TEXT,
  
  -- Social Links
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  portfolio_url TEXT,
  
  -- Intent (CRITICAL for matching)
  intent_text TEXT NOT NULL, -- Free-form: "Looking for technical cofounder..."
  intent_structured JSONB, -- AI-extracted: {looking_for: ["cofounder"], skills_needed: ["RAG"]}
  
  -- Professional Info
  current_role TEXT,
  current_company TEXT,
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'executive')),
  
  -- Skills & Interests
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  
  -- Privacy Settings
  visibility TEXT CHECK (visibility IN ('public', 'private', 'community_only')) DEFAULT 'community_only',
  show_in_search BOOLEAN DEFAULT true,
  allow_connection_requests BOOLEAN DEFAULT true,
  
  -- Metadata
  profile_complete BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_visibility ON profiles(visibility);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX idx_profiles_search ON profiles(location, visibility) WHERE show_in_search = true;
```

#### profile_embeddings

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE profile_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Vector embedding (1536 dimensions)
  embedding VECTOR(1536) NOT NULL,
  
  -- Source text used for embedding
  embedding_text TEXT NOT NULL,
  embedding_text_hash TEXT NOT NULL, -- md5 hash for cache invalidation
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ CRITICAL: IVFFlat index for fast similarity search
-- lists = sqrt(total_rows) is recommended
CREATE INDEX idx_profile_embeddings_vector 
  ON profile_embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100); -- Tune based on data size (100 for <10K profiles, 1000 for >100K)

CREATE INDEX idx_profile_embeddings_profile_id ON profile_embeddings(profile_id);
```

**🔧 DEBUGGING TIP:** If vector search returns no results, check:
1. Index exists: `\d profile_embeddings`
2. Dimensions match: `SELECT vector_dims(embedding) FROM profile_embeddings LIMIT 1;` (should be 1536)
3. Rebuild index: `REINDEX INDEX idx_profile_embeddings_vector;`

#### communities

```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  
  -- Type & Access
  type TEXT CHECK (type IN ('public', 'private')) DEFAULT 'private',
  invite_code TEXT UNIQUE, -- For joining
  require_approval BOOLEAN DEFAULT false,
  
  -- Admin
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Pricing & Limits
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  member_limit INT DEFAULT 100,
  
  -- Settings
  settings JSONB DEFAULT '{
    "allow_public_profiles": false,
    "allow_external_connections": true,
    "moderation_enabled": false,
    "auto_approve_members": true
  }'::jsonb,
  
  -- Metadata
  member_count INT DEFAULT 0,
  active_member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_invite_code ON communities(invite_code) WHERE invite_code IS NOT NULL;
```

#### community_members

```sql
CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Role & Status
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active', 'pending', 'banned')) DEFAULT 'active',
  
  -- Privacy
  visible_in_community BOOLEAN DEFAULT true,
  
  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_active ON community_members(community_id, status) WHERE status = 'active';
```

#### connections

```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations (always store user1 < user2 for uniqueness)
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',
  
  -- Who initiated
  initiated_by UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_connections_user1 ON connections(user_id_1);
CREATE INDEX idx_connections_user2 ON connections(user_id_2);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_pending ON connections(user_id_2, status) WHERE status = 'pending';
```

#### match_scores (Cache)

```sql
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Match Quality
  score DECIMAL(3, 2) NOT NULL CHECK (score >= 0 AND score <= 1),
  
  -- AI Explanation
  explanation JSONB,
  
  -- Cache expiry
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
  
  UNIQUE(user_id, match_user_id)
);

CREATE INDEX idx_match_scores_user ON match_scores(user_id);
CREATE INDEX idx_match_scores_expires ON match_scores(expires_at);
```

#### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Content
  type TEXT CHECK (type IN (
    'connection_request', 
    'connection_accepted', 
    'new_message', 
    'new_match',
    'join_request_approved'
  )) NOT NULL,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  
  -- Related
  related_user_id UUID REFERENCES auth.users(id),
  related_community_id UUID REFERENCES communities(id),
  
  -- Status
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
```

#### search_logs (Analytics)

```sql
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  query TEXT NOT NULL,
  filters JSONB,
  results_count INT NOT NULL,
  top_result_id UUID REFERENCES profiles(id),
  clicked_result_id UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at DESC);
```

### 2.3 Database Functions & Triggers

#### Auto-create profile on signup

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**🔧 DEBUGGING TIP:** If profile not created after signup:
- Check trigger exists: `\d auth.users`
- Check function logs: `SELECT * FROM pg_stat_user_functions WHERE funcname = 'handle_new_user';`
- Test manually: `SELECT public.handle_new_user();`

#### Update community member count

```sql
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER community_member_count_trigger
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();
```

#### Update timestamps

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER communities_updated_at BEFORE UPDATE ON communities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

#### Normalize connection users (ensure user_id_1 < user_id_2)

```sql
CREATE OR REPLACE FUNCTION public.normalize_connection_users()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id_1 > NEW.user_id_2 THEN
    -- Swap
    DECLARE temp_id UUID;
    BEGIN
      temp_id := NEW.user_id_1;
      NEW.user_id_1 := NEW.user_id_2;
      NEW.user_id_2 := temp_id;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_connection_users_trigger
  BEFORE INSERT ON connections
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_connection_users();
```

### 2.4 Row-Level Security (RLS) Policies

⚠️ **CRITICAL:** RLS policies are the #1 source of silent failures. Always test with actual user tokens, not admin role.

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;
```

**Profiles RLS:**

```sql
-- Users can ALWAYS read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can read profiles based on visibility
CREATE POLICY profiles_select_visibility ON profiles
  FOR SELECT
  USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (
      visibility = 'community_only'
      AND EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.community_id IN (
          SELECT community_id FROM community_members
          WHERE user_id = profiles.user_id
          AND status = 'active'
        )
      )
    )
  );

-- Users can UPDATE/DELETE their own profile
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY profiles_delete_own ON profiles FOR DELETE USING (user_id = auth.uid());
CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (user_id = auth.uid());
```

**🔧 DEBUGGING TIP:** If user can't see own profile:
```sql
-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM profiles WHERE user_id = 'user-uuid-here';

-- Check auth.uid()
SELECT auth.uid(); -- Should return user UUID

-- Check policy
\d profiles; -- Look for POLICIES section
```

**Communities RLS:**

```sql
-- Anyone can read public communities
CREATE POLICY communities_select_public ON communities
  FOR SELECT
  USING (type = 'public');

-- Members can read their communities
CREATE POLICY communities_select_member ON communities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
    )
  );

-- Admin can update/delete own community
CREATE POLICY communities_update_admin ON communities
  FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY communities_delete_admin ON communities
  FOR DELETE
  USING (created_by = auth.uid());
```

**Connections RLS:**

```sql
-- Users can see connections they're part of
CREATE POLICY connections_select_own ON connections
  FOR SELECT
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- Users can create connections
CREATE POLICY connections_insert ON connections
  FOR INSERT
  WITH CHECK (initiated_by = auth.uid());

-- Users can update connections they're part of
CREATE POLICY connections_update_own ON connections
  FOR UPDATE
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());
```

---

## 3. API SPECIFICATIONS

### 3.1 API Design Principles

- **Base URL:** `https://[project].supabase.co/functions/v1`
- **Auth:** Bearer token (JWT) in `Authorization` header
- **Format:** JSON request/response
- **Rate Limit:** 100 req/min per user, 1000/hour per IP
- **Pagination:** `limit` (default 20, max 100), `offset` (default 0)

**Error Response Format:**
```json
{
  "error": {
    "message": "Profile not found",
    "code": "PROFILE_NOT_FOUND",
    "status": 404
  }
}
```

### 3.2 Core API Endpoints

#### POST /api/search

**Purpose:** Semantic search for profiles using natural language query.

**Request:**
```json
{
  "query": "technical cofounder with RAG systems",
  "filters": {
    "location": "Bangalore",
    "skills": ["Python", "RAG"],
    "looking_for": ["cofounder"],
    "communities": ["uuid1", "uuid2"],
    "experience_level": ["senior", "lead"]
  },
  "limit": 20,
  "offset": 0
}
```

**Response:**
```json
{
  "results": [
    {
      "profile": {
        "id": "uuid",
        "name": "Jane Smith",
        "headline": "ML Engineer",
        "location": "Bangalore",
        "photo_url": "https://...",
        "intent_text": "Looking to cofound AI startup...",
        "skills": ["Python", "RAG", "LangChain"]
      },
      "match_score": 0.92,
      "match_explanation": {
        "reasons": [
          "Strong skills overlap (Python, RAG)",
          "Similar intent (looking for cofounder)",
          "Same location (Bangalore)"
        ],
        "details": {
          "skills_overlap": 0.85,
          "intent_similarity": 0.90,
          "location_match": true
        }
      },
      "mutual_connections": 3
    }
  ],
  "total": 127,
  "limit": 20,
  "offset": 0
}
```

**Implementation:** See Edge Function section.

#### POST /api/connections/request

**Purpose:** Send connection request to another user.

**Request:**
```json
{
  "target_user_id": "uuid",
  "message": "Hi! I'd love to discuss potential cofounder collaboration."
}
```

**Response:**
```json
{
  "connection": {
    "id": "uuid",
    "status": "pending",
    "initiated_by": "uuid",
    "requested_at": "2025-10-26T10:00:00Z"
  }
}
```

#### PUT /api/connections/:connectionId/respond

**Purpose:** Accept or decline connection request.

**Request:**
```json
{
  "action": "accept" // or "decline"
}
```

**Response:**
```json
{
  "connection": {
    "id": "uuid",
    "status": "accepted",
    "accepted_at": "2025-10-26T10:05:00Z"
  }
}
```

#### POST /api/profiles/:userId/linkedin-import

**Purpose:** Import LinkedIn profile data.

**Request:**
```json
{
  "linkedin_url": "https://linkedin.com/in/johndoe"
}
```

**Response:**
```json
{
  "status": "processing",
  "task_id": "uuid",
  "estimated_time": 15
}
```

#### GET /api/profiles/:userId/linkedin-import/:taskId

**Purpose:** Check import status.

**Response:**
```json
{
  "status": "completed",
  "data": {
    "name": "John Doe",
    "headline": "AI Engineer at Stripe",
    "location": "Bangalore",
    "experience": [...],
    "skills": ["Python", "RAG", "Machine Learning"]
  }
}
```

---

## 4. EDGE FUNCTIONS

### 4.1 Edge Function Structure

All Edge Functions run on Deno runtime (TypeScript). Deployed to Supabase Edge.

**Directory Structure:**
```
supabase/
  functions/
    search/
      index.ts
    match-ranking/
      index.ts
    linkedin-import/
      index.ts
    generate-embedding/
      index.ts
    _shared/
      cors.ts
      auth.ts
      supabase.ts
```

### 4.2 Search Function (Core)

**File:** `supabase/functions/search/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get request body
    const { query, filters, limit = 20, offset = 0 } = await req.json()

    // 2. Initialize clients
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

    // 3. Generate embedding for query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })
    const queryEmbedding = embeddingResponse.data[0].embedding

    // 4. Vector similarity search (top 20)
    const { data: semanticMatches, error: searchError } = await supabaseClient
      .rpc('match_profiles', {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: 20,
      })

    if (searchError) throw searchError

    // 5. Apply filters
    let filteredMatches = semanticMatches
    if (filters) {
      filteredMatches = semanticMatches.filter((match: any) => {
        if (filters.location && match.location !== filters.location) return false
        if (filters.skills && !filters.skills.some((s: string) => match.skills.includes(s))) return false
        return true
      })
    }

    // 6. Call match-ranking Edge Function for LLM re-ranking
    const rankingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/match-ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization')!,
      },
      body: JSON.stringify({
        query,
        matches: filteredMatches.slice(0, 20),
      }),
    })

    const { rankedMatches } = await rankingResponse.json()

    // 7. Return top 8
    return new Response(
      JSON.stringify({
        results: rankedMatches.slice(0, 8),
        total: filteredMatches.length,
        limit,
        offset,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Search error:', error)
    return new Response(
      JSON.stringify({ error: { message: error.message, code: 'SEARCH_ERROR' } }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

**🔧 DEBUGGING TIP:** If search returns 0 results:
- Check embedding generation: `console.log('Query embedding:', queryEmbedding.length)` (should be 1536)
- Check RPC exists: `SELECT * FROM pg_proc WHERE proname = 'match_profiles';`
- Lower threshold: Change `match_threshold: 0.6` to `0.4`

### 4.3 Match Ranking Function

**File:** `supabase/functions/match-ranking/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.9.1'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, matches } = await req.json()

    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY'),
    })

    // Prepare prompt
    const prompt = `You are an expert networking matchmaker. Rank these ${matches.length} profiles by compatibility with the searcher's query.

Query: "${query}"

Profiles:
${matches.map((m: any, i: number) => `
${i + 1}. ${m.name} - ${m.headline}
   Intent: ${m.intent_text}
   Skills: ${m.skills.join(', ')}
   Location: ${m.location}
`).join('\n')}

Consider:
1. Intent alignment (does their intent match the query?)
2. Skill overlap (complementary skills?)
3. Experience level (compatible stages?)
4. Mutual benefit (two-way match?)

For the top 8 matches, provide:
- match_score: integer 0-100
- explanation: 1-2 sentences

Output ONLY valid JSON array. No markdown. Example:
[{"profile_id": "uuid", "match_score": 95, "explanation": "..."}, ...]`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    // Parse response
    let responseText = message.content[0].text
    // Strip markdown if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    const rankedMatches = JSON.parse(responseText)

    // Merge with original profile data
    const results = rankedMatches.map((ranked: any) => {
      const profile = matches.find((m: any) => m.id === ranked.profile_id)
      return {
        profile,
        match_score: ranked.match_score / 100,
        match_explanation: {
          reasons: [ranked.explanation],
          details: {}
        }
      }
    })

    return new Response(
      JSON.stringify({ rankedMatches: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Ranking error:', error)
    return new Response(
      JSON.stringify({ error: { message: error.message, code: 'RANKING_ERROR' } }),
      { status: 500, headers: corsHeaders }
    )
  }
})
```

**🔧 DEBUGGING TIP:** If LLM returns invalid JSON:
- Log raw response: `console.log('Raw Claude response:', responseText)`
- Check for markdown: `if (responseText.includes('```')) { /* strip */ }`
- Add retry logic with exponential backoff

### 4.4 Database Function for Vector Search

**File:** Run in Supabase SQL Editor

```sql
CREATE OR REPLACE FUNCTION match_profiles(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  photo_url TEXT,
  intent_text TEXT,
  skills TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.name,
    p.headline,
    p.bio,
    p.location,
    p.photo_url,
    p.intent_text,
    p.skills,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM profile_embeddings pe
  JOIN profiles p ON p.id = pe.profile_id
  WHERE 
    1 - (pe.embedding <=> query_embedding) > match_threshold
    AND p.show_in_search = true
    AND p.visibility IN ('public', 'community_only')
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**🔧 DEBUGGING TIP:** Test function manually:
```sql
SELECT * FROM match_profiles(
  '[0.1, 0.2, ...]'::vector(1536),
  0.6,
  10
);
```

---

## 5. AI/LLM INTEGRATION

### 5.1 LLM Usage Summary

| USE CASE | MODEL | INPUT | OUTPUT | COST |
|----------|-------|-------|--------|------|
| Intent extraction | Claude Haiku | Intent text (500 chars) | Structured JSON | $0.25/1M tokens |
| Match ranking | Claude Sonnet 4 | Query + 20 profiles | Ranked list with explanations | $3/1M input, $15/1M output |
| Profile embedding | OpenAI text-embedding-3-small | Profile text (~500 tokens) | 1536-dim vector | $0.02/1M tokens |
| Profile quality check | Claude Haiku | Profile data | Quality score + suggestions | $0.25/1M tokens |

### 5.2 Prompt Templates

#### Intent Extraction Prompt

```typescript
const INTENT_EXTRACTION_PROMPT = `You are an AI assistant that extracts structured networking intent from user descriptions.

Extract the following fields in JSON format:
- looking_for: array of strings (e.g., ["cofounder", "advisor", "client", "teammate", "investor"])
- skills_needed: array of specific technical skills mentioned
- role_type: string (e.g., "technical", "business", "design", "marketing")
- experience_preference: string (e.g., "junior", "mid", "senior", "any")
- additional_context: any other important requirements

User's intent: "${intentText}"

Output ONLY valid JSON. No markdown. No explanations.

Example output:
{"looking_for": ["cofounder"], "skills_needed": ["RAG", "Python"], "role_type": "technical", "experience_preference": "senior", "additional_context": "Has built 0-1 products"}
`
```

**Implementation:**
```typescript
async function extractIntent(intentText: string): Promise<any> {
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  
  const message = await anthropic.messages.create({
    model: 'claude-haiku-20250305',
    max_tokens: 500,
    messages: [{ role: 'user', content: INTENT_EXTRACTION_PROMPT.replace('${intentText}', intentText) }]
  })
  
  let responseText = message.content[0].text
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  
  return JSON.parse(responseText)
}
```

### 5.3 Embedding Generation

```typescript
async function generateProfileEmbedding(profile: any): Promise<number[]> {
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  
  // Construct embedding text
  const embeddingText = `
    ${profile.name}
    ${profile.headline}
    ${profile.bio}
    ${profile.intent_text}
    Skills: ${profile.skills.join(', ')}
    Interests: ${profile.interests.join(', ')}
  `.trim()
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: embeddingText,
  })
  
  return response.data[0].embedding
}
```

**🔧 DEBUGGING TIP:** If embedding generation fails:
- Check input length: `console.log('Input length:', embeddingText.length)` (should be <8K chars)
- Check rate limits: Look for `x-ratelimit-remaining` in response headers
- Implement retry with exponential backoff (3 attempts)

### 5.4 Cost Optimization

**Strategy 1: Cache LLM responses**
```typescript
// Cache match rankings for 24 hours
const cacheKey = `match_rank:${userId}:${md5(query)}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const ranked = await rankMatches(query, profiles)
await redis.setex(cacheKey, 86400, JSON.stringify(ranked))
```

**Strategy 2: Batch processing**
```typescript
// Instead of 5 separate API calls:
await claude.analyze(profile1)
await claude.analyze(profile2)
// ...

// Batch into 1 call:
await claude.analyzeMultiple([profile1, profile2, profile3, profile4, profile5])
```

**Strategy 3: Use cheaper models for simple tasks**
- Intent extraction: Haiku ($0.25/MTok vs $3/MTok Sonnet)
- Profile quality: Haiku
- Match ranking: Sonnet (keep for quality)

---

## 6. AUTHENTICATION & SECURITY

### 6.1 Supabase Auth Setup

**Signup Flow:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecurePass123!',
  options: {
    data: {
      name: 'John Doe'
    }
  }
})
```

**Login Flow:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'SecurePass123!'
})
```

**Token Refresh:**
```typescript
const { data, error } = await supabase.auth.refreshSession()
```

### 6.2 Security Best Practices

**1. Never expose service_role key in frontend**
```typescript
// ❌ WRONG
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ✅ CORRECT
const supabase = createClient(SUPABASE_URL, ANON_KEY)
```

**2. Always use RLS policies**
```sql
-- Every table must have RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

**3. Validate all inputs**
```typescript
// Sanitize user inputs
function sanitizeInput(input: string): string {
  return input.trim().substring(0, 500) // Max 500 chars
}

// Validate email
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

**4. Rate limit API endpoints**
```typescript
// Use Upstash Rate Limiter
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req per 10 sec
})

const { success } = await ratelimit.limit(userId)
if (!success) {
  return new Response('Too many requests', { status: 429 })
}
```

---

## 7. FILE STORAGE

### 7.1 Supabase Storage Buckets

**Setup:**
```sql
-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('profiles', 'profiles', true),
  ('communities', 'communities', true);

-- Storage policies
CREATE POLICY "Users can upload their profile photo"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profiles');
```

**Upload Profile Photo:**
```typescript
async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`
  const filePath = `profiles/${fileName}`

  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('profiles')
    .getPublicUrl(filePath)

  return publicUrl
}
```

---

## 8. CACHING STRATEGY

### 8.1 Redis Cache (Upstash)

**Setup:**
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL'),
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN'),
})
```

**Cache Patterns:**

**1. Search Results (1 hour TTL)**
```typescript
const cacheKey = `search:${md5(query + JSON.stringify(filters))}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const results = await searchProfiles(query, filters)
await redis.setex(cacheKey, 3600, JSON.stringify(results))
return results
```

**2. Match Scores (24 hour TTL)**
```typescript
const cacheKey = `match:${userId}:${targetUserId}`
const cached = await redis.get(cacheKey)
if (cached) return parseFloat(cached)

const score = await calculateMatchScore(userId, targetUserId)
await redis.setex(cacheKey, 86400, score.toString())
return score
```

**3. Profile Embeddings (Permanent, invalidate on update)**
```typescript
const cacheKey = `embedding:${profileId}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const embedding = await generateEmbedding(profile)
await redis.set(cacheKey, JSON.stringify(embedding)) // No expiry
return embedding
```

**Cache Invalidation:**
```typescript
// On profile update
await redis.del(`embedding:${profileId}`)
await redis.del(`profile:${profileId}`)

// On search
// Search cache auto-expires after 1 hour
```

---

## 9. PERFORMANCE OPTIMIZATION

### 9.1 Database Optimization

**1. Use EXPLAIN ANALYZE**
```sql
EXPLAIN ANALYZE
SELECT * FROM profiles
WHERE location = 'Bangalore'
AND show_in_search = true
ORDER BY last_active_at DESC
LIMIT 20;
```

**2. Add appropriate indexes**
```sql
-- Composite index for common query
CREATE INDEX idx_profiles_location_active 
  ON profiles(location, last_active_at DESC) 
  WHERE show_in_search = true;
```

**3. Use partial indexes**
```sql
-- Only index visible profiles
CREATE INDEX idx_profiles_visible 
  ON profiles(id) 
  WHERE show_in_search = true AND visibility != 'private';
```

**4. Connection pooling**
Supabase uses PgBouncer by default (max 15 connections per pool).

### 9.2 API Optimization

**1. Batch database queries**
```typescript
// ❌ WRONG: N+1 query problem
for (const userId of userIds) {
  const profile = await supabase.from('profiles').select('*').eq('user_id', userId).single()
}

// ✅ CORRECT: Single query
const profiles = await supabase.from('profiles').select('*').in('user_id', userIds)
```

**2. Limit data returned**
```typescript
// Only select needed columns
const { data } = await supabase
  .from('profiles')
  .select('id, name, headline, photo_url') // Not SELECT *
  .limit(20)
```

**3. Use pagination**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .range(offset, offset + limit - 1)
```

### 9.3 Frontend Optimization

**1. Lazy load images**
```tsx
<Image 
  src={profile.photo_url} 
  alt={profile.name}
  loading="lazy"
  width={100}
  height={100}
/>
```

**2. Debounce search input**
```typescript
const debouncedSearch = debounce(async (query: string) => {
  const results = await searchProfiles(query)
  setResults(results)
}, 500) // Wait 500ms after user stops typing
```

**3. Use React Query for caching**
```typescript
const { data, isLoading } = useQuery(
  ['profile', userId],
  () => fetchProfile(userId),
  { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
)
```

---

## 10. ERROR HANDLING & LOGGING

### 10.1 Sentry Setup

```typescript
import * as Sentry from 'https://deno.land/x/sentry/index.ts'

Sentry.init({
  dsn: Deno.env.get('SENTRY_DSN'),
  environment: Deno.env.get('ENVIRONMENT') || 'development',
  tracesSampleRate: 1.0,
})
```

**Capture Errors:**
```typescript
try {
  await searchProfiles(query)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      function: 'search',
      user_id: userId,
    },
    extra: {
      query,
      filters,
    },
  })
  throw error
}
```

### 10.2 Structured Logging

```typescript
function log(level: string, message: string, context?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  }
  console.log(JSON.stringify(logEntry))
}

// Usage
log('info', 'Search query executed', { query, results_count: 12 })
log('error', 'OpenAI API failed', { error: error.message })
```

### 10.3 Error Response Patterns

```typescript
// Standard error response
function errorResponse(message: string, code: string, status: number) {
  return new Response(
    JSON.stringify({
      error: {
        message,
        code,
        status,
        timestamp: new Date().toISOString(),
      }
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Usage
return errorResponse('Profile not found', 'PROFILE_NOT_FOUND', 404)
```

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest'
import { extractIntent } from './intent-extraction'

describe('Intent Extraction', () => {
  it('should extract looking_for correctly', async () => {
    const intent = "Looking for technical cofounder with RAG expertise"
    const result = await extractIntent(intent)
    
    expect(result.looking_for).toContain('cofounder')
    expect(result.skills_needed).toContain('RAG')
    expect(result.role_type).toBe('technical')
  })

  it('should handle empty intent gracefully', async () => {
    const intent = ""
    const result = await extractIntent(intent)
    
    expect(result.looking_for).toEqual([])
  })
})
```

### 11.2 Integration Tests (Edge Functions)

```typescript
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

Deno.test('Search function returns results', async () => {
  const response = await fetch('http://localhost:54321/functions/v1/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
    },
    body: JSON.stringify({
      query: 'technical cofounder',
      limit: 10,
    }),
  })

  const data = await response.json()
  assertEquals(response.status, 200)
  assertEquals(data.results.length > 0, true)
})
```

### 11.3 E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('user can search and view profile', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'TestPass123!')
  await page.click('button[type="submit"]')

  // Search
  await page.goto('/search')
  await page.fill('[name="query"]', 'technical cofounder RAG')
  await page.click('button[type="submit"]')

  // Verify results
  await expect(page.locator('.search-result')).toHaveCount(8)
  
  // Click first result
  await page.click('.search-result:first-child')
  
  // Verify profile page
  await expect(page.locator('h1')).toContainText('Jane Smith')
})
```

---

## 12. DEPLOYMENT GUIDE

### 12.1 Environment Variables

**Required:**
```bash
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx # Server-side only

# OpenAI
OPENAI_API_KEY=sk-xxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Apify
APIFY_API_TOKEN=apify_api_xxx

# Resend
RESEND_API_KEY=re_xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# Environment
ENVIRONMENT=production # or development
```

### 12.2 Supabase Setup

**1. Create project:**
```bash
npx supabase init
npx supabase login
npx supabase link --project-ref your-project-ref
```

**2. Run migrations:**
```bash
npx supabase db push
```

**3. Deploy Edge Functions:**
```bash
npx supabase functions deploy search
npx supabase functions deploy match-ranking
npx supabase functions deploy linkedin-import
npx supabase functions deploy generate-embedding
```

**4. Set secrets:**
```bash
npx supabase secrets set OPENAI_API_KEY=sk-xxx
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
npx supabase secrets set APIFY_API_TOKEN=apify_api_xxx
```

### 12.3 Frontend Deployment (Vercel)

**1. Install Vercel CLI:**
```bash
npm i -g vercel
```

**2. Deploy:**
```bash
vercel --prod
```

**3. Set environment variables in Vercel dashboard**

### 12.4 Database Backups

**Automated backups (Supabase Pro):**
- Daily backups retained for 7 days
- Manual backups via Supabase dashboard

**Manual backup:**
```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

---

## 13. CRITICAL DEBUGGING PLAYBOOK

*Based on "The AI Agent Debugging Playbook for Full-Stack Applications"*

### Error #1: Profile Embedding Generation Fails

**Symptoms:**
- User onboarding stuck at "Processing..." >30 seconds
- Console error: `OpenAI API timeout` or `Rate limit exceeded`

**Root Causes:**
- OpenAI API timeout
- Rate limit hit (3 req/min on free tier)
- Invalid API key

**Debug Steps:**
```typescript
// 1. Log API response
console.log('OpenAI Response:', embeddingResponse)
console.log('Status:', embeddingResponse.status)
console.log('Rate Limit:', embeddingResponse.headers['x-ratelimit-remaining'])

// 2. Verify API key
const testKey = await fetch('https://api.openai.com/v1/models', {
  headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
})
console.log('API Key Valid:', testKey.ok)

// 3. Check input length
console.log('Input length:', profileText.length) // Should be <8K tokens
```

**Solutions:**

1. **Implement retry with exponential backoff:**
```typescript
async function generateEmbeddingWithRetry(text: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })
      return embedding.data[0].embedding
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(r => setTimeout(r, 2 ** i * 1000)) // 1s, 2s, 4s
    }
  }
}
```

2. **Cache embeddings:**
```sql
SELECT embedding FROM profile_embeddings 
WHERE profile_id = $1 AND embedding_text_hash = md5($2);
```

3. **Use smaller input:**
```typescript
const embeddingText = profile.name + ' ' + profile.headline + ' ' + profile.intent_text
const truncated = embeddingText.substring(0, 2000) // Keep under 2K chars
```

**Prevention:**
- Set up Sentry alert for `OPENAI_API_ERROR`
- Monitor quota in OpenAI dashboard
- Add health check: Test OpenAI connection on startup

---

### Error #2: Vector Search Returns Zero Results

**Symptoms:**
- User searches, sees "No matches found"
- Same query works in pgAdmin but not in app

**Root Causes:**
- Missing ivfflat index
- Similarity threshold too high
- Vector dimension mismatch

**Debug Steps:**
```sql
-- 1. Check if embeddings exist
SELECT COUNT(*) FROM profile_embeddings WHERE profile_id = 'user-id';

-- 2. Test raw similarity query
SELECT 
  p.name,
  pe.embedding <=> '[0.1, 0.2, ...]'::vector AS similarity
FROM profile_embeddings pe
JOIN profiles p ON p.id = pe.profile_id
ORDER BY similarity ASC
LIMIT 10;

-- 3. Check index exists
\d profile_embeddings; -- Should show ivfflat index

-- 4. Verify dimensions
SELECT vector_dims(embedding) FROM profile_embeddings LIMIT 1; -- Should be 1536
```

**Solutions:**

1. **Lower similarity threshold:**
```typescript
// Before: 0.8 (too strict)
const matches = await supabase.rpc('match_profiles', {
  query_embedding: embedding,
  match_threshold: 0.6, // Lowered to 0.6
  match_count: 20
})
```

2. **Regenerate all embeddings:**
```typescript
const profiles = await supabase.from('profiles').select('*')
for (const profile of profiles) {
  const text = `${profile.name} ${profile.headline} ${profile.bio} ${profile.intent_text}`
  const embedding = await generateEmbedding(text)
  await supabase.from('profile_embeddings').upsert({
    profile_id: profile.id,
    embedding,
    embedding_text: text,
    embedding_text_hash: md5(text)
  })
}
```

3. **Rebuild index:**
```sql
REINDEX INDEX idx_profile_embeddings_vector;
```

**Prevention:**
- Monitor "zero results" rate (alert if >10%)
- Test with golden dataset (known query-profile pairs)
- Log similarity scores: `console.log('Top 5 scores:', scores)`

---

### Error #3: LLM Returns Invalid JSON

**Symptoms:**
- Match ranking fails: `Unexpected token < in JSON`
- Claude response contains markdown: ` ```json ... ``` `

**Root Causes:**
- LLM returns markdown-wrapped JSON
- Extra whitespace breaks JSON.parse()
- LLM hallucinates non-JSON text

**Debug Steps:**
```typescript
// 1. Log raw response
console.log('Raw Claude Response:', claudeResponse.content[0].text)

// 2. Check for markdown
const hasMarkdown = response.includes('```')
console.log('Contains Markdown:', hasMarkdown)

// 3. Try parsing
try {
  JSON.parse(response)
} catch (error) {
  console.error('JSON Parse Error:', error.message)
  console.error('Problematic Text:', response.substring(0, 200))
}
```

**Solutions:**

1. **Strip markdown before parsing:**
```typescript
function parseJSONResponse(responseText: string) {
  // Remove markdown code blocks
  let cleaned = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
  
  try {
    return JSON.parse(cleaned)
  } catch (error) {
    console.error('Failed to parse JSON:', cleaned)
    throw new Error(`Invalid JSON response: ${error.message}`)
  }
}
```

2. **Improve prompt:**
```typescript
const prompt = `
CRITICAL: Your response must be ONLY valid JSON. No markdown. No explanations. No code blocks.

Start your response with { and end with }. Nothing else.

Example valid response:
{"match_score": 95, "explanation": "Strong skills overlap"}

Now, analyze this profile and respond ONLY with JSON:
${profileData}
`
```

3. **Add fallback model:**
```typescript
async function rankMatches(profiles: any[]) {
  try {
    return await rankWithClaude(profiles)
  } catch (error) {
    console.warn('Claude failed, trying GPT-4:', error)
    return await rankWithGPT4(profiles)
  }
}
```

**Prevention:**
- Add JSON schema validation
- Test prompts with 10+ samples
- Set up Sentry alert for `JSON_PARSE_ERROR`

---

### Error #4: Supabase RLS Blocks Own Data

**Symptoms:**
- User can't see own profile after signup
- Query returns empty array (should return data)
- Works in dashboard (admin) but not in app

**Root Causes:**
- RLS policy too restrictive
- Invalid/expired JWT token
- Policy logic error (AND vs OR)

**Debug Steps:**
```sql
-- 1. Check policies
\d profiles; -- Look for POLICIES section

-- 2. Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM profiles WHERE user_id = 'user-uuid-here';

-- 3. Check auth.uid()
SELECT auth.uid(); -- Should match user UUID

-- 4. Test policy logic
SELECT * FROM profiles WHERE (
  user_id = auth.uid() OR
  visibility = 'public'
);
```

**Solutions:**

1. **Fix RLS policy:**
```sql
-- Before (wrong):
CREATE POLICY profiles_select ON profiles FOR SELECT
USING (visibility = 'public');

-- After (correct):
CREATE POLICY profiles_select ON profiles FOR SELECT
USING (
  user_id = auth.uid() OR -- Can ALWAYS see own profile
  visibility = 'public'
);
```

2. **Debug auth token:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
console.log('User ID:', session?.user?.id)
console.log('Token expires:', session?.expires_at)

// Refresh if expired
if (session?.expires_at && Date.now() > session.expires_at * 1000) {
  await supabase.auth.refreshSession()
}
```

3. **Test with actual user token:**
```typescript
// Use anon key (not service key)
const supabase = createClient(SUPABASE_URL, ANON_KEY)
await supabase.auth.signInWithPassword({ email, password })

const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)

console.log('Data:', data) // Should return user's profile
console.log('Error:', error) // Should be null
```

**Prevention:**
- Always test RLS with non-admin users
- Use Supabase "View as" feature (impersonate)
- Add E2E tests for RLS scenarios

---

### Error #5: LinkedIn Scraping Fails

**Symptoms:**
- User pastes URL, gets "Failed to import"
- Apify returns empty or error

**Root Causes:**
- LinkedIn blocked Apify's IP
- Invalid URL format
- Private/non-existent profile

**Debug Steps:**
```typescript
// 1. Check Apify logs
console.log('Apify Run ID:', apifyRunId)
// Visit: https://console.apify.com/actors/runs/{runId}

// 2. Validate URL
const isValid = (url: string) => {
  return url.includes('linkedin.com/in/') && !url.includes('/company/')
}
console.log('Valid URL:', isValid(userInput))

// 3. Test with known URL
const testURL = 'https://www.linkedin.com/in/williamhgates/'
const testResult = await scrapeLinkedIn(testURL)
console.log('Test Result:', testResult)
```

**Solutions:**

1. **Fallback to manual form:**
```typescript
try {
  const profile = await scrapeLinkedIn(linkedinURL)
  return profile
} catch (error) {
  console.error('LinkedIn scraping failed:', error)
  
  return {
    error: true,
    message: 'LinkedIn import failed. Please fill your profile manually.',
    fallback: 'manual_form'
  }
}
```

2. **Use OAuth (long-term):**
```typescript
// LinkedIn OAuth API (official, more reliable)
const linkedInAuth = await fetch('https://www.linkedin.com/oauth/v2/authorization', {
  // Request scopes: r_basicprofile, r_emailaddress
})
```

3. **Retry with different account:**
```typescript
const APIFY_ACCOUNTS = [ACCOUNT_1, ACCOUNT_2, ACCOUNT_3]
let result = null
for (const account of APIFY_ACCOUNTS) {
  try {
    result = await scrapeWithAccount(account, url)
    break
  } catch (error) {
    continue
  }
}
```

**Prevention:**
- Add URL validation before calling Apify
- Monitor success rate (alert if <80%)
- Always have manual form available

---

### Performance: Slow Search (>5 seconds)

**Diagnosis:**
```sql
-- Enable slow query log
EXPLAIN ANALYZE
SELECT * FROM profile_embeddings
WHERE embedding <=> '[...]'::vector
ORDER BY embedding <=> '[...]'::vector
LIMIT 20;
```

**Solutions:**

1. **Add indexes:**
```sql
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_experience ON profiles(experience_level);
```

2. **Cache popular searches:**
```typescript
const cacheKey = `search:${md5(query)}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const results = await searchProfiles(query)
await redis.setex(cacheKey, 3600, JSON.stringify(results))
```

3. **Limit LLM re-ranking:**
```typescript
// Re-rank top 20 (not 50)
const ranked = await rankWithClaude(matches.slice(0, 20))
```

---

### Performance: High AI Costs (>$100/day)

**Diagnosis:**
- Check OpenAI dashboard: Token usage
- Check Claude dashboard: API calls

**Solutions:**

1. **Cache LLM responses:**
```typescript
const cacheKey = `match_rank:${searcherId}:${queryHash}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const ranked = await rankWithClaude(profiles)
await redis.setex(cacheKey, 86400, JSON.stringify(ranked)) // 24h
```

2. **Reduce max_tokens:**
```typescript
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 500, // Reduced from 1000
  messages: [{ role: 'user', content: prompt }]
})
```

3. **Use cheaper models:**
```typescript
// Intent extraction: Haiku ($0.25/MTok)
await claude.messages.create({ model: 'claude-haiku-20250305', ... })

// Match ranking: Sonnet ($3/MTok)
await claude.messages.create({ model: 'claude-sonnet-4-20250514', ... })
```

4. **Batch processing:**
```typescript
// Instead of 5 separate calls:
for (const profile of profiles) {
  await claude.analyze(profile)
}

// Batch into 1 call:
await claude.analyzeMultiple(profiles)
```

---

## 14. MONITORING & ALERTS

**Set up alerts for:**
- API error rate >5% → Slack (Sentry)
- Search latency P95 >3s → Email (PostHog)
- AI cost >$100/day → Slack (OpenAI webhook)
- Database connections >80% → Email (Supabase)
- User signups drop >50% → Email (PostHog)

**Dashboard metrics:**
- Signups/day (trend)
- Searches/day (trend)
- Connection requests/day (trend)
- Avg match quality (gauge)
- D7 retention (%)
- API error rate (%)
- P95 latency (ms)

---

## 15. QUICK REFERENCE

### Key Endpoints
- `POST /api/search` - Semantic search
- `POST /api/connections/request` - Request connection
- `PUT /api/connections/:id/respond` - Accept/decline
- `POST /api/profiles/:id/linkedin-import` - Import LinkedIn

### Database Tables
- `profiles` - User profiles
- `profile_embeddings` - 1536d vectors
- `communities` - Community metadata
- `community_members` - User-community links
- `connections` - Connection requests
- `match_scores` - Cached AI matches

### Tech Stack
- **Backend:** Supabase (PostgreSQL + pgvector)
- **Cache:** Redis (Upstash)
- **AI:** Claude Sonnet 4, OpenAI embeddings
- **Frontend:** Next.js + Vercel
- **Monitoring:** Sentry + PostHog

---

**Document Version:** 2.0 (Optimized)  
**Last Updated:** October 26, 2025  
**Next Review:** November 10, 2025

---

*This TDD is a living document. Report issues or suggest improvements via GitHub.*

**END OF TDD**
