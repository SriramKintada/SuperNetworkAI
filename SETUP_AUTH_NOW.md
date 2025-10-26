# 🔐 Setup Authentication (3 Minutes)

Everything is deployed! Now let's enable authentication so users can sign up and use your app.

---

## Step 1: Enable Email Auth (1 min)

### Go to Authentication Settings:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/providers

### Enable Email Provider:
1. Find **"Email"** in the list
2. Toggle it **ON** (should already be on)
3. **Confirm email:** Toggle OFF (for development)
   - This lets you test without verifying emails
4. Click **Save**

---

## Step 2: Configure Auth Settings (1 min)

### Go to Auth Configuration:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/url-configuration

### Add Site URL:
1. **Site URL:** `http://localhost:3000`
2. **Redirect URLs:** Add these:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
3. Click **Save**

---

## Step 3: Create Supabase Client in Frontend (1 min)

### Create this file: `lib/supabase.ts`

Already exists? Skip this step!

If not, create it:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## ✅ That's It! Auth is Ready!

Now let's test it:

---

## 🧪 Test Authentication

### Option 1: Test via Frontend (Recommended)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to signup:**
   http://localhost:3000/signup

3. **Create test account:**
   - Email: test@supernetwork.ai
   - Password: password123
   - Click "Sign Up"

4. **Should redirect to onboarding!**
   - If it works: ✅ Auth is working!
   - If error: See troubleshooting below

---

### Option 2: Test via Supabase Dashboard

1. **Go to Authentication → Users:**
   https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/users

2. **Click "Add user"**
   - Email: test@supernetwork.ai
   - Password: password123
   - Auto-confirm user: YES
   - Click "Create user"

3. **Check profiles table:**
   - Go to Table Editor → profiles
   - Should see 1 row (profile auto-created!)

---

## 🎉 Success Indicators

After creating a user, you should see:

1. **In Authentication → Users:**
   - 1 user with status "Confirmed"

2. **In Table Editor → profiles:**
   - 1 profile row with the user's email

3. **In your frontend:**
   - User can log in at `/login`
   - User can view profile at `/profile/me`

---

## 🐛 Troubleshooting

### Error: "Email not confirmed"
**Solution:**
- Go to Auth Settings
- Disable "Confirm email"
- Or manually confirm user in dashboard

### Error: "Invalid login credentials"
**Solution:**
- Make sure password is at least 6 characters
- Check user exists in Authentication → Users

### Error: "Profile not found"
**Solution:**
- Check trigger is working
- Manually create profile:
```sql
-- Get user ID
SELECT id FROM auth.users WHERE email = 'test@supernetwork.ai';

-- Create profile (if doesn't exist)
INSERT INTO profiles (user_id, name, email)
VALUES ('USER_ID_HERE', 'Test User', 'test@supernetwork.ai');
```

### Functions still return 401/403
**Solution:**
- User needs to be logged in
- Frontend needs to send auth token
- Check `lib/supabase.ts` exists and is imported

---

## 🔧 Update Frontend to Use Auth

Make sure your frontend pages use the Supabase client:

### Example: Login Page

```typescript
import { supabase } from '@/lib/supabase'

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    console.error('Login error:', error)
    return
  }

  // Redirect to dashboard
  router.push('/dashboard')
}
```

### Example: Signup Page

```typescript
import { supabase } from '@/lib/supabase'

async function handleSignup(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    console.error('Signup error:', error)
    return
  }

  // Redirect to onboarding
  router.push('/onboarding')
}
```

### Example: Protected Page

```typescript
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function ProfilePage() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  if (!user) return <div>Loading...</div>

  return <div>Welcome, {user.email}!</div>
}
```

---

## ✅ Deployment Checklist (Updated)

- [x] Database tables created (9 tables)
- [x] RLS enabled on all tables
- [x] Edge Functions deployed (8 functions)
- [x] OpenAI API key set
- [x] Email auth enabled ✅ **JUST DID THIS**
- [x] Site URL configured ✅ **JUST DID THIS**
- [ ] Test user created
- [ ] User can sign up via frontend
- [ ] User can log in via frontend
- [ ] Profile auto-created on signup
- [ ] All user flows working

---

## 🚀 Next: Test Complete User Flow

Once auth is working, test these:

### 1. Signup Flow
- Go to `/signup`
- Create account
- Complete onboarding
- Check profile created

### 2. Login Flow
- Go to `/login`
- Log in with test account
- Should see dashboard

### 3. Profile Management
- Go to `/profile/me`
- Edit profile
- Save changes
- Verify in database

### 4. Search
- Go to `/search`
- Search for profiles
- Should see results (once you have more users)

### 5. Connections
- Search for another user
- Click "Connect"
- Send request
- Check in database

### 6. Communities
- Go to `/communities`
- Create community
- Get invite code
- Join community

### 7. Messages
- Connect with another user
- Go to `/messages`
- Send message
- Should appear instantly (real-time!)

---

## 🎉 You're Almost Done!

After setting up auth (3 minutes), your entire backend will be live and working!

**Next steps:**
1. Enable email auth (above)
2. Create test user
3. Test all features
4. Deploy to production!

---

**Status:** Backend ✅ Deployed | Auth ⏳ Setting up now | Frontend ⏳ Ready to test
