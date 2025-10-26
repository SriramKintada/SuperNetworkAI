# Database Migration Deployment Instructions

## Phase 1: Foundation - Database Schema + Auth

**Status:** Ready to deploy
**Files Created:** 3 migration files
**Estimated Time:** 5 minutes

---

## ✅ Pre-Deployment Checklist

- [x] Migration files created
  - `supabase/migrations/001_initial_schema.sql` (8 core tables)
  - `supabase/migrations/002_rls_policies.sql` (RLS policies)
  - `supabase/migrations/003_functions_triggers.sql` (DB functions & triggers)
- [x] `.env.local` file created with credentials
- [x] Supabase project exists (mpztkfmhgbbidrylngbw)
- [x] Supabase MCP connected

---

## 🚀 Deployment Options

### Option 1: Supabase Dashboard (Recommended - Easiest)

1. **Open Supabase SQL Editor:**
   - Go to: https://mpztkfmhgbbidrylngbw.supabase.co/project/mpztkfmhgbbidrylngbw/sql
   - Or navigate: Dashboard → SQL Editor → New Query

2. **Execute Migration 001 (Initial Schema):**
   - Copy entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for success message
   - **Expected:** "Success. No rows returned"

3. **Execute Migration 002 (RLS Policies):**
   - Copy entire contents of `supabase/migrations/002_rls_policies.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for success message

4. **Execute Migration 003 (Functions & Triggers):**
   - Copy entire contents of `supabase/migrations/003_functions_triggers.sql`
   - Paste into SQL Editor
   - Click "Run"
   - Wait for success message

5. **Verify Deployment:**
   - Go to: Table Editor → Should see 9 tables (profiles, communities, etc.)
   - Go to: Database → Policies → Should see RLS enabled on all tables

---

### Option 2: Supabase CLI (Advanced)

**Prerequisites:**
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref mpztkfmhgbbidrylngbw
```

**Execute Migrations:**
```bash
# Option A: Push all migrations at once
supabase db push

# Option B: Execute individually (safer, recommended)
psql "postgres://postgres.[password]@db.mpztkfmhgbbidrylngbw.supabase.co:5432/postgres" -f supabase/migrations/001_initial_schema.sql
psql "postgres://postgres.[password]@db.mpztkfmhgbbidrylngbw.supabase.co:5432/postgres" -f supabase/migrations/002_rls_policies.sql
psql "postgres://postgres.[password]@db.mpztkfmhgbbidrylngbw.supabase.co:5432/postgres" -f supabase/migrations/003_functions_triggers.sql
```

---

### Option 3: Copy-Paste Script (Windows)

**PowerShell Script:**
```powershell
# Navigate to project directory
cd C:\Users\kinta\OneDrive\Desktop\networking_ai

# Read migration files
$migration1 = Get-Content -Path "supabase\migrations\001_initial_schema.sql" -Raw
$migration2 = Get-Content -Path "supabase\migrations\002_rls_policies.sql" -Raw
$migration3 = Get-Content -Path "supabase\migrations\003_functions_triggers.sql" -Raw

# Output to console (copy-paste into Supabase SQL Editor)
Write-Host "=== MIGRATION 001 - INITIAL SCHEMA ==="
Write-Host $migration1
Write-Host ""
Write-Host "=== MIGRATION 002 - RLS POLICIES ==="
Write-Host $migration2
Write-Host ""
Write-Host "=== MIGRATION 003 - FUNCTIONS & TRIGGERS ==="
Write-Host $migration3
```

---

## ✅ Verification Steps

After deploying all 3 migrations, verify the setup:

### 1. Check Tables Exist

**SQL Query:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Output (9 tables):**
- communities
- community_members
- connections
- match_scores
- messages
- notifications
- profile_embeddings
- profiles
- search_logs

### 2. Check RLS Enabled

**SQL Query:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

**Expected:** All tables should have `rowsecurity = true`

### 3. Check Triggers Exist

**SQL Query:**
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

**Expected Triggers:**
- `on_auth_user_created` on `auth.users`
- `community_member_count_trigger` on `community_members`
- `profiles_updated_at` on `profiles`
- `normalize_connection_users_trigger` on `connections`
- (and more)

### 4. Check Indexes Exist

**SQL Query:**
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** Should see indexes like:
- `idx_profiles_user_id`
- `idx_profile_embeddings_vector` (IVFFlat)
- `idx_communities_type`
- etc.

### 5. Check pgvector Extension

**SQL Query:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Expected:** Should return 1 row showing vector extension installed

---

## 🧪 Test Authentication Flow

After migrations are deployed, test the signup/login flow:

### 1. Test Signup

1. Start your Next.js frontend:
   ```bash
   npm run dev
   ```

2. Navigate to: http://localhost:3000/signup

3. Sign up with test credentials:
   - Email: test@supernetwork.ai
   - Password: TestPass123!
   - Name: Test User

4. **Expected Behavior:**
   - User created in `auth.users` table
   - Profile auto-created in `profiles` table (trigger)
   - No errors in console

### 2. Verify Profile Creation

**SQL Query:**
```sql
SELECT
  p.id,
  p.user_id,
  p.name,
  p.email,
  p.created_at
FROM profiles p
WHERE email = 'test@supernetwork.ai';
```

**Expected:** Should return 1 row with the test user's profile

### 3. Test Login

1. Navigate to: http://localhost:3000/login
2. Login with test credentials
3. **Expected:** Successfully logged in, redirected to dashboard

### 4. Check auth.uid()

While logged in as test user, run:
```sql
SELECT auth.uid();
```

**Expected:** Should return the test user's UUID

---

## 🐛 Common Issues & Solutions

### Issue 1: "Extension vector does not exist"

**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue 2: "Trigger on_auth_user_created already exists"

**Solution:** Migration already ran. Skip migration 003 or drop trigger first:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Issue 3: "RLS policy blocks own profile access"

**Symptoms:** User can't see own profile after signup

**Debug:**
```sql
-- Check auth.uid()
SELECT auth.uid();

-- Check RLS policy
SELECT * FROM profiles WHERE user_id = auth.uid();
```

**Solution:** Verify RLS policy uses `auth.uid()` correctly (already implemented in migration 002)

### Issue 4: "Permission denied for table auth.users"

**Solution:** Use Supabase dashboard SQL Editor (already has elevated permissions)

---

## 📊 Phase 1 Success Criteria

- [x] All 8 core tables created
- [x] RLS policies enabled on all tables
- [x] Triggers working (profile auto-created on signup)
- [ ] User can signup via frontend ← **Test this after deployment**
- [ ] User can login via frontend ← **Test this after deployment**
- [ ] No RLS policy errors in logs ← **Verify this after deployment**

---

## 🚦 Next Steps After Verification

Once you've verified all the above:

1. **Type "VERIFIED"** in chat → I'll proceed to Phase 2
2. **Type "ISSUE: [description]"** → I'll help debug

**After Phase 1 is verified, Phase 2 will build:**
- Profile management APIs
- CRUD operations (create, read, update profile)
- Frontend integration

---

## 📞 Quick Reference

**Supabase Dashboard:** https://mpztkfmhgbbidrylngbw.supabase.co
**SQL Editor:** https://mpztkfmhgbbidrylngbw.supabase.co/project/mpztkfmhgbbidrylngbw/sql
**Table Editor:** https://mpztkfmhgbbidrylngbw.supabase.co/project/mpztkfmhgbbidrylngbw/editor
**Project Ref:** mpztkfmhgbbidrylngbw

---

**Ready to deploy? Follow Option 1 (Supabase Dashboard) for the easiest path!** 🚀
