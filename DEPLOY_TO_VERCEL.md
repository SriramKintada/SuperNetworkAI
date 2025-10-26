# 🚀 Deploy SuperNetworkAI to Vercel + Production Auth Setup

Complete guide to deploy your app to production with GitHub and Vercel.

**Time:** 15 minutes

---

## 📋 Prerequisites

- ✅ Backend deployed to Supabase (all functions working)
- ✅ `.env.local` contains your API keys (NOT committed!)
- ✅ GitHub account
- ✅ Vercel account (free tier works!)

---

## Part 1: Prepare for Deployment (5 min)

### Step 1: Verify No Secrets in Code

I've already cleaned up all API keys from your code! ✅

**Verified clean files:**
- ✅ `scripts/test-deployment.js` - Uses environment variables
- ✅ All `.md` files - No API keys
- ✅ `.gitignore` - Blocks all `.env*` files

### Step 2: Initialize Git Repository

```bash
# If not already initialized
git init

# Add all files
git add .

# Check what will be committed (make sure .env.local is NOT listed!)
git status

# Should NOT see:
# - .env.local
# - .env
# - Any files with API keys

# Commit
git commit -m "Initial commit: SuperNetworkAI with complete backend"
```

### Step 3: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `supernetwork-ai` (or your choice)
3. **Visibility:** Private (recommended) or Public
4. **Don't** add README, .gitignore, or license (we already have them)
5. Click **"Create repository"**

### Step 4: Push to GitHub

```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/supernetwork-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Go to your GitHub repo - you should see all files EXCEPT `.env.local`!

---

## Part 2: Deploy to Vercel (5 min)

### Step 1: Connect GitHub to Vercel

1. **Go to:** https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select **GitHub**
4. Authorize Vercel (if first time)
5. Find your `supernetwork-ai` repository
6. Click **"Import"**

### Step 2: Configure Environment Variables

**CRITICAL:** Add these environment variables in Vercel:

1. In the Vercel import screen, scroll to **"Environment Variables"**

2. Add these variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://mpztkfmhgbbidrylngbw.supabase.co`
   - Environment: All (Production, Preview, Development)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: (Get from Supabase Dashboard → Settings → API)
   - Environment: All

   **Variable 3 (optional for scripts):**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: (Get from Supabase Dashboard → Settings → API)
   - Environment: Production only

3. Click **"Deploy"**

**Vercel will now build and deploy your app!** ⏱️ (~2 minutes)

### Step 3: Get Your Production URL

Once deployed:
- You'll see: **"Congratulations!"** 🎉
- Your app is live at: `https://supernetwork-ai.vercel.app`
- Or custom domain if you set one up

---

## Part 3: Configure Production Auth (5 min)

Now we need to tell Supabase about your production URL.

### Step 1: Update Supabase Auth URLs

1. **Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/url-configuration

2. **Update these settings:**

   **Site URL:**
   ```
   https://your-app-name.vercel.app
   ```
   (Use your actual Vercel URL)

   **Redirect URLs:** Add these (one per line):
   ```
   http://localhost:3000/**
   https://your-app-name.vercel.app/**
   https://your-app-name.vercel.app/auth/callback
   ```

3. Click **"Save"**

### Step 2: Enable Email Provider (if not done)

1. **Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/providers

2. **Email Provider:**
   - Toggle **ON**
   - **Confirm email:** ON (for production!)
   - **Secure email change:** ON
   - Click **Save**

3. **Optional: Enable OAuth Providers**

   For production, you might want:

   **Google OAuth:**
   - Toggle ON
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
   - Redirect URL: Use the one shown in Supabase

   **LinkedIn OAuth:**
   - Toggle ON
   - Client ID: (from LinkedIn Developers)
   - Client Secret: (from LinkedIn Developers)

### Step 3: Configure Email Templates (Optional but Recommended)

1. **Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/auth/templates

2. **Customize these templates:**
   - Confirm signup
   - Reset password
   - Magic link
   - Change email address

3. **Add your branding:**
   - Replace `{{ .SiteURL }}` with your actual URL
   - Add your logo URL
   - Customize colors

---

## Part 4: Test Production Deployment (5 min)

### Test 1: Visit Your App

**Go to:** https://your-app-name.vercel.app

Should see your landing page! ✅

### Test 2: Sign Up

1. Go to: https://your-app-name.vercel.app/signup
2. Create account:
   - Email: your-real-email@example.com
   - Password: (secure password)
3. Check your email for confirmation
4. Click confirmation link
5. Should redirect to app!

### Test 3: Verify Backend Connection

Check Vercel logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Go to **"Functions"** tab
4. Should see no errors

Check Supabase:
1. Go to Table Editor → profiles
2. Should see your new profile!

### Test 4: Test All Features

Go through each feature:
- ✅ Profile editing
- ✅ Search (once you have users)
- ✅ Connections
- ✅ Communities
- ✅ Messages

---

## 🎯 Production Checklist

After deployment:

- [ ] App deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Supabase auth configured with production URL
- [ ] Email confirmation enabled
- [ ] Test signup works
- [ ] Profile auto-created on signup
- [ ] All features work in production
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs

---

## 🔧 Continuous Deployment

Now every time you push to GitHub, Vercel auto-deploys!

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically deploys! 🚀
```

**Monitor deployment:**
- Vercel Dashboard shows build progress
- Get email on deploy success/failure
- Check logs in Vercel if issues

---

## 🌐 Add Custom Domain (Optional)

### Step 1: Buy Domain

Use any domain registrar:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

### Step 2: Add to Vercel

1. Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter domain: `supernetwork.ai`
4. Click **"Add"**

### Step 3: Configure DNS

Vercel shows DNS records to add:

**For root domain (supernetwork.ai):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Wait:** DNS propagation takes 24-48 hours

### Step 4: Update Supabase

Once domain works:
1. Go to Supabase Auth → URL Configuration
2. Update Site URL to: `https://supernetwork.ai`
3. Add redirect URL: `https://supernetwork.ai/**`

---

## 📊 Monitor Production

### Vercel Analytics

**Go to:** Vercel Dashboard → Your Project → **Analytics**

See:
- Page views
- Unique visitors
- Top pages
- Performance metrics

### Supabase Logs

**Go to:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/logs

Monitor:
- Edge Function logs
- Database logs
- Auth logs
- Realtime logs

### Error Tracking (Optional)

Add Sentry for error tracking:

1. **Install:**
```bash
npm install @sentry/nextjs
```

2. **Initialize:**
```bash
npx @sentry/wizard@latest -i nextjs
```

3. **Deploy:**
```bash
git add .
git commit -m "Add Sentry error tracking"
git push
```

---

## 🐛 Troubleshooting Production

### Issue: "Environment variable not found"
**Solution:**
- Check Vercel Dashboard → Settings → Environment Variables
- Make sure all variables are set for "Production"
- Redeploy: Deployments → Click "..." → Redeploy

### Issue: "CORS error" in production
**Solution:**
- Supabase Edge Functions already have CORS enabled
- Check browser console for actual error
- Verify Supabase URL is correct in Vercel env vars

### Issue: "Auth not working" in production
**Solution:**
- Check Supabase Auth → URL Configuration
- Production URL must be in Redirect URLs
- Make sure Site URL matches exactly

### Issue: "Database connection failed"
**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` in Vercel
- Check RLS policies in Supabase
- Test with actual user token, not service key

### Issue: Functions return 404 in production
**Solution:**
- Edge Functions must be deployed in Supabase (not Vercel)
- Check they're deployed: Supabase Dashboard → Edge Functions
- Verify function names match exactly

---

## 🎉 You're Live!

### What You Have Now:
- ✅ App deployed to Vercel
- ✅ Auto-deployment on git push
- ✅ Production auth working
- ✅ All backend features live
- ✅ Custom domain (optional)
- ✅ Analytics & monitoring

### Share Your App:
- Landing page: `https://your-app.vercel.app`
- Signup: `https://your-app.vercel.app/signup`
- Login: `https://your-app.vercel.app/login`

### Next Steps:
1. Invite beta users to test
2. Monitor logs for errors
3. Add more features
4. Scale as you grow!

---

## 📞 Quick Reference

**Vercel Dashboard:** https://vercel.com/dashboard
**Supabase Dashboard:** https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw
**GitHub Repo:** https://github.com/YOUR_USERNAME/supernetwork-ai

**Deploy command:**
```bash
git push origin main
```

**Check deployment status:**
```bash
vercel --prod
```

**View production logs:**
```bash
vercel logs --prod
```

---

**Status:** 🚀 PRODUCTION READY!

Your app is live and ready for users! 🎉
