# ✅ Verify & Test Your Backend (5 Minutes)

Your backend is deployed! Now let's verify everything works and connect your frontend.

---

## Step 1: Verify Database (1 min)

### Go to SQL Editor:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/sql/new

### Run this query:
```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### ✅ Expected Result: 9 tables
- communities
- community_members
- connections
- invite_codes
- match_scores
- messages
- notifications
- profile_embeddings
- profiles

### Check RLS is enabled:
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### ✅ Expected: All tables show `rowsecurity = true`

---

## Step 2: Test Edge Functions (2 min)

### Go to Edge Functions:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

### ✅ Should see 8 functions with "Active" status:
- ✅ get-profile
- ✅ update-profile
- ✅ generate-embedding
- ✅ search-profiles
- ✅ match-ranking
- ✅ connections
- ✅ communities
- ✅ messages

### Quick Test: Click any function → "Logs" tab
Should show "Function deployed successfully"

---

## Step 3: Connect Frontend (2 min)

### Update `.env.local`:

Create or update this file in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mpztkfmhgbbidrylngbw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY_HERE>

# Note: Service role key should NOT be in frontend, only in backend scripts
# SUPABASE_SERVICE_ROLE_KEY=<KEEP_SECRET>

# OpenAI (already set in Supabase secrets - don't need here)
```

### Get your Anon Key:
1. Go to: https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/api
2. Copy the `anon` `public` key
3. Paste into `.env.local`

### Restart your dev server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 4: Test Complete User Flow (5 min)

### Test 1: User Signup ✅

1. Go to: http://localhost:3000/signup
2. Create account:
   - Email: test@example.com
   - Password: password123
3. Complete onboarding
4. **Check:** Profile auto-created

### Verify in Supabase:
```sql
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
```

Should see your new profile!

---

### Test 2: Profile Management ✅

1. Go to: http://localhost:3000/profile/me
2. Click "Edit Profile"
3. Update:
   - Headline: "AI Engineer"
   - Skills: ["Python", "RAG", "LLMs"]
   - Intent: "Looking for technical cofounder to build AI SaaS"
4. Click "Save"

### Verify in Supabase:
```sql
SELECT name, headline, skills, intent_text
FROM profiles
WHERE email = 'test@example.com';
```

Should show your updates!

---

### Test 3: Generate Embedding ✅

Run this in SQL Editor:
```sql
-- Get your profile ID
SELECT id FROM profiles WHERE email = 'test@example.com';
```

Then test the embedding function:
1. Go to Edge Functions → generate-embedding
2. Click "Invoke"
3. Body:
```json
{
  "profileId": "YOUR_PROFILE_ID_HERE"
}
```
4. Click "Send"

### Verify:
```sql
SELECT COUNT(*) FROM profile_embeddings;
```

Should return: `1` (your embedding)

---

### Test 4: Search (Without Users Yet) ✅

Since you only have 1 user, search won't return much. Let's create a few test users first:

### Create Test Users (SQL):
```sql
-- Insert test profiles (these will be searchable)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'alice@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'bob@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW()),
  (gen_random_uuid(), 'charlie@example.com', crypt('password', gen_salt('bf')), NOW(), NOW(), NOW());

-- Their profiles will be auto-created by trigger
-- Now update them manually:
UPDATE profiles SET
  name = 'Alice Johnson',
  headline = 'AI Engineer at OpenAI',
  intent_text = 'Looking for cofounder to build AI-powered SaaS for developers',
  skills = ARRAY['Python', 'RAG', 'LLMs', 'Vector DBs'],
  bio = 'Built RAG systems at scale. 5 years experience in AI/ML.',
  show_in_search = true,
  visibility = 'public'
WHERE email = 'alice@example.com';

UPDATE profiles SET
  name = 'Bob Smith',
  headline = 'Full-stack Developer',
  intent_text = 'Looking for advisor with AI expertise to help scale my startup',
  skills = ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS'],
  bio = 'Founder of 2 startups. Expert in web development.',
  show_in_search = true,
  visibility = 'public'
WHERE email = 'bob@example.com';

UPDATE profiles SET
  name = 'Charlie Davis',
  headline = 'Product Manager at Stripe',
  intent_text = 'Looking for technical cofounder to build fintech startup',
  skills = ARRAY['Product Management', 'Go-to-Market', 'User Research'],
  bio = 'PM at Stripe. Led 3 product launches.',
  show_in_search = true,
  visibility = 'public'
WHERE email = 'charlie@example.com';
```

### Generate embeddings for test users:

For each test profile, call the generate-embedding function:
1. Get profile IDs:
```sql
SELECT id, name FROM profiles WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com');
```

2. For each ID, invoke generate-embedding function (as in Test 3)

**OR** use the batch script:
```bash
node scripts/generate-embeddings.js
```

---

### Test 5: Search with Results ✅

Now try searching:

1. Go to: http://localhost:3000/search
2. Search: "technical cofounder with AI experience"
3. Should see: Alice (high match) and Charlie (medium match)

### Or test via Edge Function:
1. Go to Edge Functions → search-profiles
2. Click "Invoke"
3. Body:
```json
{
  "query": "technical cofounder with AI experience",
  "limit": 10
}
```
4. Should return profiles sorted by similarity

---

### Test 6: AI Match Ranking ✅

1. Search for profiles (as above)
2. Results should show:
   - Match score (e.g., 92%)
   - Explanation (e.g., "Strong technical background...")

### Test via Function:
1. Go to Edge Functions → match-ranking
2. Body:
```json
{
  "query": "technical cofounder",
  "matches": [
    {
      "id": "alice-profile-id",
      "name": "Alice Johnson",
      "headline": "AI Engineer at OpenAI",
      "intent_text": "Looking for cofounder...",
      "skills": ["Python", "RAG"]
    }
  ]
}
```
3. Should return match score and explanation

---

### Test 7: Connections ✅

1. Go to: http://localhost:3000/search
2. Find Alice's profile
3. Click "Connect"
4. Write message: "Hi Alice! I'd love to connect and discuss potential collaboration."
5. Click "Send"

### Verify:
```sql
SELECT * FROM connections ORDER BY created_at DESC LIMIT 1;
```

Should show your connection request!

---

### Test 8: Communities ✅

1. Go to: http://localhost:3000/communities
2. Click "Create Community"
3. Fill in:
   - Name: "AI Builders"
   - Description: "Community for AI entrepreneurs"
   - Type: Public
4. Click "Create"
5. Should see invite code generated

### Verify:
```sql
SELECT c.name, ic.code
FROM communities c
LEFT JOIN invite_codes ic ON ic.community_id = c.id
ORDER BY c.created_at DESC
LIMIT 1;
```

Should show your community and invite code!

---

### Test 9: Messages ✅

First, accept the connection (switch to Alice's account or do it manually):
```sql
-- Accept connection
UPDATE connections
SET status = 'accepted', accepted_at = NOW()
WHERE status = 'pending'
LIMIT 1;
```

Then:
1. Go to: http://localhost:3000/messages
2. Click on Alice's conversation
3. Type message: "Hey Alice! How's it going?"
4. Press Send
5. Should appear instantly (real-time!)

---

## Step 5: Verify Real-time (1 min)

### Test Real-time Messages:

1. Open two browser windows:
   - Window 1: Your account
   - Window 2: Alice's account (or use incognito mode)

2. Send message from Window 1
3. **Should appear instantly in Window 2** (no refresh!)

### Test Real-time Notifications:

1. Send connection request to another user
2. That user should see notification appear instantly

---

## ✅ Deployment Checklist

Mark these off as you test:

- [ ] Database tables created (9 tables)
- [ ] RLS enabled on all tables
- [ ] Edge Functions deployed (8 functions)
- [ ] OpenAI API key set
- [ ] Frontend connected (.env.local updated)
- [ ] User signup works
- [ ] Profile auto-created on signup
- [ ] Profile editing works
- [ ] Embeddings generate successfully
- [ ] Search returns results
- [ ] AI match ranking shows scores
- [ ] Connection requests work
- [ ] Communities can be created
- [ ] Messages send successfully
- [ ] Real-time updates work

---

## 🎉 All Tests Pass?

### You now have:
- ✅ Full backend deployed
- ✅ Frontend connected
- ✅ User flows working
- ✅ Search & matching working
- ✅ Real-time working

---

## 🚀 Next Steps

### 1. Add More Test Users
Run the SQL above to add Alice, Bob, Charlie for testing.

### 2. Generate Embeddings
```bash
node scripts/generate-embeddings.js
```

### 3. Test All Features
Go through each user flow to ensure everything works.

### 4. Enable OAuth (Optional)
- Go to Authentication → Providers
- Enable Google/LinkedIn
- Add OAuth credentials

### 5. Deploy Frontend to Vercel
```bash
git add .
git commit -m "Connect backend"
git push origin main
```

Then Vercel auto-deploys!

---

## 🐛 Troubleshooting

### Search returns no results
**Solution:** Generate embeddings first (Test 3)

### "Unauthorized" errors
**Solution:** Check `.env.local` has correct anon key

### Real-time not working
**Solution:** Check Supabase Realtime is enabled (Dashboard → Settings → API)

### Connection requests fail
**Solution:** Check RLS policies (both users must be visible to each other)

---

## 📊 Monitor Your Backend

### View Logs:
- Edge Functions → Any function → Logs tab
- See all requests in real-time

### View Database:
- Table Editor → See all data
- SQL Editor → Run custom queries

### Check API Usage:
- Settings → Usage
- Monitor requests, storage, bandwidth

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for troubleshooting!

🎉 **Your backend is LIVE!**
