# 🚀 Deploy SuperNetworkAI Backend via Supabase Dashboard

**Deployment Time:** 10 minutes (no CLI needed!)

Since the Supabase CLI isn't installed, this guide walks you through deploying everything via the Supabase Dashboard - it's actually faster!

---

## ✅ Step 1: Deploy Database (3 minutes)

### Option A: Run All Migrations at Once (Recommended)

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw
   - Click **SQL Editor** in left sidebar

2. **Run the consolidated migration:**
   - Open file: `supabase/migrations/ALL_MIGRATIONS.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)
   - Paste into SQL Editor
   - Click **RUN** button (bottom right)

3. **Verify success:**
   - You should see: "Success. No rows returned"
   - Check **Table Editor** - you should see 9 tables

### Option B: Run Migrations Individually

If the consolidated file doesn't exist, run these files in order:

1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_functions_triggers.sql`
4. `004_vector_functions.sql`
5. `005_helper_functions.sql`
6. `006_match_scores_cache.sql`

---

## ✅ Step 2: Deploy Edge Functions (5 minutes)

### For Each Function:

1. **Go to Edge Functions:**
   - Dashboard → **Edge Functions** (left sidebar)
   - Click **Create a new function**

2. **Deploy these 8 functions:**

#### Function 1: get-profile
```typescript
// Copy contents from: supabase/functions/get-profile/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 2: update-profile
```typescript
// Copy contents from: supabase/functions/update-profile/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 3: generate-embedding
```typescript
// Copy contents from: supabase/functions/generate-embedding/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 4: search-profiles
```typescript
// Copy contents from: supabase/functions/search-profiles/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 5: match-ranking
```typescript
// Copy contents from: supabase/functions/match-ranking/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 6: connections
```typescript
// Copy contents from: supabase/functions/connections/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 7: communities
```typescript
// Copy contents from: supabase/functions/communities/index.ts
// Paste into function editor
// Click "Deploy"
```

#### Function 8: messages
```typescript
// Copy contents from: supabase/functions/messages/index.ts
// Paste into function editor
// Click "Deploy"
```

---

## ✅ Step 3: Set Environment Variables (1 minute)

1. **Go to Project Settings:**
   - Dashboard → **Settings** (left sidebar)
   - Click **Edge Functions**

2. **Add secrets:**
   - Click **Add secret**
   - Name: `OPENAI_API_KEY`
   - Value: `YOUR_OPENAI_API_KEY`
   - Click **Save**

---

## ✅ Step 4: Verify Deployment (1 minute)

### Check Database Tables
Run this in SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output:** 9 tables:
- communities
- community_members
- connections
- invite_codes
- match_scores
- messages
- notifications
- profile_embeddings
- profiles

### Check RLS Policies
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;
```

**Expected:** Each table should have 2-4 policies

### Check Edge Functions
- Dashboard → Edge Functions
- Should see 8 functions listed
- All should have status: "Active"

---

## ✅ Step 5: Test Your Backend

### Test 1: Create a Test User

1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Email: `test@supernetwork.ai`
4. Password: `testpassword123`
5. Click **Create user**

### Test 2: Check Profile Auto-Created

Run in SQL Editor:
```sql
SELECT * FROM profiles LIMIT 1;
```

**Expected:** Should see the test user's profile

### Test 3: Test Edge Function

Get the function URL:
- Dashboard → Edge Functions → get-profile
- Copy the **Function URL**

Test with cURL:
```bash
curl "https://mpztkfmhgbbidrylngbw.supabase.co/functions/v1/get-profile?user_id=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or use the built-in test feature:
- Dashboard → Edge Functions → get-profile
- Click **Invoke**
- Add query param: `user_id=YOUR_USER_ID`
- Click **Send**

---

## 🎉 Deployment Complete!

### What You Have Now:
- ✅ 9 database tables with RLS
- ✅ 8 Edge Functions deployed
- ✅ Vector search ready
- ✅ AI matching ready
- ✅ Real-time ready

### Next Steps:

1. **Update Frontend Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://mpztkfmhgbbidrylngbw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Test User Flows:**
   - Signup → Profile creation
   - Search → Results
   - Connect → Request sent
   - Message → Delivered

3. **Generate Embeddings:**
   - Once you have users, run: `node scripts/generate-embeddings.js`
   - Or wait for auto-generation on profile updates

---

## 🐛 Troubleshooting

### Issue: Migration fails
**Solution:** Run migrations one by one in order

### Issue: Edge Function not deploying
**Solution:** Check for syntax errors in TypeScript code

### Issue: RLS blocks queries
**Solution:** Check you're using the correct user token, not service key

### Issue: Vector search not working
**Solution:** Generate embeddings first using generate-embedding function

---

## 📊 Deployment Checklist

- [ ] All 9 tables created
- [ ] RLS enabled on all tables
- [ ] 3 database functions created
- [ ] 3 database triggers working
- [ ] 8 Edge Functions deployed
- [ ] OpenAI API key set
- [ ] Test user created
- [ ] Profile auto-created for test user
- [ ] At least one Edge Function tested successfully

---

## 🎯 Quick Reference

### Supabase Project Details
- **Project ID:** mpztkfmhgbbidrylngbw
- **Dashboard URL:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw
- **API URL:** https://mpztkfmhgbbidrylngbw.supabase.co

### Key URLs
- SQL Editor: Dashboard → SQL Editor
- Edge Functions: Dashboard → Edge Functions
- Table Editor: Dashboard → Table Editor
- Authentication: Dashboard → Authentication
- Logs: Dashboard → Logs

---

**Deployment Status:** Ready for manual deployment via dashboard!

**Estimated Time:** 10 minutes total

**No CLI Required:** Everything done via browser!
