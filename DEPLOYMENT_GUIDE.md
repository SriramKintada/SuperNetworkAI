# SuperNetworkAI - Complete Deployment Guide

## 🎯 Overview

This guide will walk you through deploying SuperNetworkAI from scratch to production.

**Total Time:** ~30 minutes
**Prerequisites:** Node.js 18+, Supabase account, OpenAI API key

---

## 📋 Pre-Deployment Checklist

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. **Save these values:**
   - Project URL: `https://YOUR_PROJECT.supabase.co`
   - Anon/Public Key: `eyJ...` (from Settings > API)
   - Service Role Key: `eyJ...` (from Settings > API) - **KEEP SECRET**
   - Project Reference ID: `mpztkfmhgbbidrylngbw` (from URL)

### 2. Get API Keys

- **OpenAI API Key:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Anthropic API Key (optional):** [console.anthropic.com](https://console.anthropic.com) - We use GPT-4o Mini by default

### 3. Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (all platforms)
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## 🚀 Deployment Steps

### Step 1: Link Supabase Project

```bash
cd networking_ai
supabase link --project-ref YOUR_PROJECT_REF
```

Enter your database password when prompted (from Supabase Dashboard > Settings > Database).

### Step 2: Set Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_key

# OpenAI
OPENAI_API_KEY=sk-...your_openai_key
```

**IMPORTANT:** Never commit `.env.local` to git!

### Step 3: Deploy Database Migrations

```bash
supabase db push
```

This will create:
- All database tables (profiles, communities, connections, messages, etc.)
- Row-Level Security policies
- Vector embeddings table
- Helper functions

**Verify migrations:**
```bash
supabase db diff
```

Should show: "No schema differences detected"

### Step 4: Set Edge Function Secrets

```bash
supabase secrets set OPENAI_API_KEY=sk-...your_key
```

**Verify secrets:**
```bash
supabase secrets list
```

Should show: `OPENAI_API_KEY`

### Step 5: Deploy Edge Functions

**Option A: Deploy all at once (recommended)**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Option B: Deploy individually**
```bash
supabase functions deploy get-profile --no-verify-jwt
supabase functions deploy update-profile --no-verify-jwt
supabase functions deploy generate-embedding --no-verify-jwt
supabase functions deploy search-profiles --no-verify-jwt
supabase functions deploy match-ranking --no-verify-jwt
supabase functions deploy connections --no-verify-jwt
supabase functions deploy communities --no-verify-jwt
supabase functions deploy messages --no-verify-jwt
```

**Verify deployment:**
```bash
supabase functions list
```

Should show all 8 functions with status "active".

### Step 6: Test Database Connection

```bash
supabase db remote --help
```

Test a query:
```bash
supabase db remote exec "SELECT COUNT(*) FROM profiles;"
```

Should return: `0` (no profiles yet)

### Step 7: Start Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 8: Test Signup Flow

1. Go to `/signup`
2. Create test account
3. Complete onboarding
4. Verify profile created in Supabase Dashboard

---

## 🔍 Verification Tests

### Test 1: Authentication

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Test 2: Profile Creation

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/get-profile?user_id=USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Vector Search

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/search-profiles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "AI engineer", "limit": 10}'
```

### Test 4: Match Ranking

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/match-ranking \
  -H "Content-Type: application/json" \
  -d '{"query": "cofounder", "matches": [...]}'
```

---

## 📊 Monitoring & Logs

### View Edge Function Logs

```bash
# All functions
supabase functions logs

# Specific function
supabase functions logs search-profiles

# Follow logs (real-time)
supabase functions logs --tail
```

### View Database Logs

```bash
supabase logs postgres
```

### Monitor API Usage

- **Supabase Dashboard:** Project > Logs
- **OpenAI Dashboard:** [platform.openai.com/usage](https://platform.openai.com/usage)

---

## 🐛 Troubleshooting

### Issue: "RLS policy blocks query"

**Symptom:** User can't access their own profile

**Solution:**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Test with actual user token (not service role)
-- Go to Supabase Dashboard > SQL Editor
```

### Issue: "Vector dimension mismatch"

**Symptom:** Error: `different vector dimensions 1536 and X`

**Solution:**
```sql
-- Verify table definition
\d profile_embeddings

-- Should show: embedding vector(1536)
-- If not, run migration again:
supabase db reset
supabase db push
```

### Issue: "Edge Function timeout"

**Symptom:** Function takes >400s

**Solution:**
- Reduce batch size in search (limit: 20 → 10)
- Add pagination
- Cache results in match_scores table

### Issue: "Invalid JSON from GPT-4o Mini"

**Symptom:** `JSON.parse()` error in match-ranking

**Solution:**
Already handled in code:
```typescript
responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
```

### Issue: "Rate limit exceeded" (OpenAI)

**Solution:**
- Implement exponential backoff (already in generate-embeddings.js)
- Reduce batch size (10 → 5)
- Upgrade OpenAI tier

---

## 🚀 Production Deployment

### Deploy to Vercel

1. **Connect GitHub repo:**
   - Go to [vercel.com](https://vercel.com)
   - Import project
   - Connect repo

2. **Set environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   OPENAI_API_KEY (not needed in frontend)
   ```

3. **Deploy:**
   ```bash
   git push origin main
   ```

Vercel auto-deploys on push.

### Custom Domain Setup

1. **Vercel Dashboard > Domains**
2. Add domain: `supernetwork.ai`
3. Update DNS (wait 24-48h)
4. Update Supabase allowed domains:
   - Dashboard > Authentication > URL Configuration
   - Add: `https://supernetwork.ai`

---

## 📈 Post-Deployment Tasks

### 1. Generate Embeddings for Existing Users

```bash
node scripts/generate-embeddings.js
```

### 2. Set Up Analytics

- **Vercel Analytics:** Already enabled
- **PostHog (optional):** For product analytics
- **Sentry (optional):** For error tracking

### 3. Enable OAuth Providers

**Google OAuth:**
1. Supabase Dashboard > Authentication > Providers
2. Enable Google
3. Add credentials from Google Cloud Console

**LinkedIn OAuth:**
1. Create app: [linkedin.com/developers](https://www.linkedin.com/developers)
2. Add redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. Enable in Supabase Dashboard

### 4. Set Up Cron Jobs (Optional)

**Auto-delete expired match scores:**
```sql
-- Run daily at 2 AM
SELECT cron.schedule(
  'delete-expired-match-scores',
  '0 2 * * *',
  $$SELECT delete_expired_match_scores()$$
);
```

---

## 🎉 You're Done!

Your SuperNetworkAI backend is fully deployed and ready for users!

**Next Steps:**
- Invite beta users
- Monitor logs for errors
- Set up backup strategy
- Configure rate limiting

**Questions?** Check the [TDD](important_reference_files/SuperNetworkAI_TDD_Complete.md) or [AI Debugging Playbook](important_reference_files/The_AI_Agent_Debugging_Playbook.md).
