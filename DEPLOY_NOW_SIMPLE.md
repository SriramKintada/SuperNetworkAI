# 🚀 DEPLOY NOW - 3 Simple Steps (10 Minutes)

**No CLI needed!** Deploy everything via Supabase Dashboard.

---

## Step 1️⃣: Deploy Database (3 min)

### Go here: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/sql/new

### Copy-Paste This File:
1. Open: `supabase/migrations/ALL_MIGRATIONS.sql`
2. Select ALL (Ctrl+A)
3. Copy (Ctrl+C)
4. Paste into SQL Editor
5. Click **RUN** (bottom right)

### ✅ Success if you see: "Success. No rows returned"

---

## Step 2️⃣: Deploy Edge Functions (5 min)

### Go here: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

### Deploy These 8 Functions:

For each function below:
1. Click **Create a new function**
2. Name: (see function name below)
3. Copy code from file
4. Paste into editor
5. Click **Deploy**

#### 1. get-profile
- File: `supabase/functions/get-profile/index.ts`

#### 2. update-profile
- File: `supabase/functions/update-profile/index.ts`

#### 3. generate-embedding
- File: `supabase/functions/generate-embedding/index.ts`

#### 4. search-profiles
- File: `supabase/functions/search-profiles/index.ts`

#### 5. match-ranking
- File: `supabase/functions/match-ranking/index.ts`

#### 6. connections
- File: `supabase/functions/connections/index.ts`

#### 7. communities
- File: `supabase/functions/communities/index.ts`

#### 8. messages
- File: `supabase/functions/messages/index.ts`

---

## Step 3️⃣: Set API Key (1 min)

### Go here: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/functions

1. Click **Add secret**
2. Name: `OPENAI_API_KEY`
3. Value: Your OpenAI API key
4. Click **Save**

---

## ✅ Verify Deployment

### Check Tables (30 sec)

Go to SQL Editor and run:
```sql
SELECT COUNT(*) FROM profiles;
```

Should return: `0` (no profiles yet, but table exists)

### Check Functions (30 sec)

Go to: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

Should see 8 functions listed with "Active" status.

---

## 🎉 YOU'RE DONE!

### What Works Now:
- ✅ User signup/login
- ✅ Profile management
- ✅ Vector search (semantic)
- ✅ AI match ranking (GPT-4o Mini)
- ✅ Communities & connections
- ✅ Real-time messaging

### Test It:

1. **Create test user:**
   - Go to Authentication → Users
   - Click "Add user"
   - Email: test@example.com
   - Password: password123

2. **Check profile auto-created:**
   - Go to Table Editor → profiles
   - Should see 1 row

3. **Test Edge Function:**
   - Go to Edge Functions → get-profile
   - Click "Invoke"
   - Should return the profile

---

## 📱 Update Frontend

Add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://mpztkfmhgbbidrylngbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your anon key from:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/api

---

## 🆘 Need Help?

- **Migrations fail?** Run files individually in order (001, 002, 003, etc.)
- **Function won't deploy?** Check for TypeScript errors
- **Can't find files?** They're all in `supabase/` folder

---

**Total Time:** 10 minutes
**Difficulty:** Copy-paste
**CLI Needed:** NO! ✅

🎉 **Start deploying now!**
