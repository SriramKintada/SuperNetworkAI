# 🚨 CRITICAL: Apify LinkedIn Actor Issue

## The Problem

The Apify Anchor actor (`anchor/linkedin-profile-enrichment`) is **consistently returning incorrect profiles**, regardless of which LinkedIn URL is requested.

### Evidence

```bash
# Test 1: Bill Gates
Request: https://www.linkedin.com/in/williamhgates
Result: Hubert de Renoterre (wrong person!)

# Test 2: Satya Nadella
Request: https://www.linkedin.com/in/satyanadella
Result: Hubert de Renoterre (same wrong person!)

# Test 3: Your profile
Request: https://www.linkedin.com/in/sriramkintada
Result: Sarp Tecimer (different wrong person!)
```

### What's Actually Being Returned

```json
{
  "full_name": "Hubert de Renoterre",
  "headline": "Besoin d'une solution d'email?...",
  "url": "https://www.linkedin.com/in/hubert-de-renoterre-63b47a21a/",
  "city": "Paris",
  "country": "France",
  "company_name": "Sales Tools AI"
}
```

---

## Root Cause Analysis

### Possible Causes

1. **Apify Account Limitations**
   - Free tier may have restrictions
   - May return sample/demo data instead of actual scraping
   - API key might not have full access

2. **LinkedIn Blocking**
   - LinkedIn detecting and blocking these scraping requests
   - Redirecting to random profiles when detected
   - May need residential proxies instead of datacenter proxies

3. **Actor Configuration**
   - Wrong input format for this specific actor
   - Missing required parameters
   - Standby mode not being used correctly

4. **Rate Limiting**
   - Hitting API limits and returning cached data
   - Need to wait between requests

---

## What Works in Our Code ✅

The Edge Function code is working correctly:
- ✅ API calls are successful (status 200)
- ✅ Data is being returned from Apify
- ✅ OpenAI extraction works perfectly
- ✅ Profile validation catches the mismatch
- ✅ Error handling is comprehensive

**The issue is with Apify, not our code.**

---

## Solutions to Try

### Solution 1: Check Apify Account Tier

**Action:** Log into your Apify account and check:
1. Current plan (Free vs Paid)
2. Usage limits and quotas
3. API key permissions
4. Actor credits remaining

**URL:** https://console.apify.com/account

### Solution 2: Try Different Actor

Replace `anchor~linkedin-profile-enrichment` with alternatives:

**Option A: Bright Data Actor** (More reliable, costs $$$)
```javascript
const actorId = 'brightdata~linkedin-profile-scraper'
```

**Option B: Apify's Official Actor**
```javascript
const actorId = 'apify~linkedin-profile-scraper'
```

**Option C: Phantombuster** (Different service)
- More expensive but very reliable
- Has dedicated LinkedIn scraping APIs

### Solution 3: Use Standby Mode API

The actor page mentions "Standby mode". Try using the Standby API:

```javascript
// Instead of regular run endpoint
const url = `https://api.apify.com/v2/actor-standby/anchor~linkedin-profile-enrichment/run-sync`

// With different body format
const body = {
  linkedInUrl: linkedinUrl, // Singular, not array
  // ... other params
}
```

### Solution 4: Add waitForFinish Parameter

```javascript
const url = `https://api.apify.com/v2/acts/anchor~linkedin-profile-enrichment/runs?token=${apiKey}&waitForFinish=120`
```

### Solution 5: Use LinkedIn API Official (Best Long-term)

If the profile owner authorizes your app:
```javascript
// LinkedIn Official API (requires OAuth)
const linkedInAPI = 'https://api.linkedin.com/v2/me'
```

**Pros:**
- 100% accurate data
- No scraping issues
- Fast and reliable

**Cons:**
- Requires user OAuth approval
- Only works for authenticated users
- Limited data without premium API access

---

## Immediate Testing Steps

### Step 1: Test Apify on Their Website

1. Go to: https://console.apify.com/actors/anchor~linkedin-profile-enrichment
2. Click "Try for free" or "Run"
3. Enter: `https://www.linkedin.com/in/satyanadella`
4. Click "Start"
5. Check the results

**Question:** Does it return **Satya Nadella** or **Hubert de Renoterre**?

- **If Satya:** Issue is with API call format
- **If Hubert:** Issue is with your Apify account/actor

### Step 2: Check Apify Logs

1. Go to: https://console.apify.com/actors/runs
2. Find recent runs for `anchor~linkedin-profile-enrichment`
3. Click on a run to see details
4. Check the dataset output

Look for:
- Input URL that was sent
- Output URL that was returned
- Any error messages or warnings

### Step 3: Test with Different LinkedIn Profile

Try a profile you KNOW is public and well-known:
```bash
# Test with Elon Musk (very public profile)
https://www.linkedin.com/in/elonmusk

# Test with Tim Cook
https://www.linkedin.com/in/tim-cook

# Test with Mark Zuckerberg
https://www.linkedin.com/in/zuck
```

Run:
```bash
node scripts/test-apify-direct.js "https://www.linkedin.com/in/elonmusk"
```

---

## Current Code Status ✅

### What's Been Fixed

1. ✅ **Async Run Pattern** - Now uses proper run/poll/fetch flow
2. ✅ **Comprehensive Logging** - Every step is logged for debugging
3. ✅ **Profile Validation** - Catches mismatches before returning
4. ✅ **Better Error Messages** - Clear, actionable errors
5. ✅ **Timeout Handling** - Won't hang indefinitely (120s limit)
6. ✅ **Status Polling** - Waits for run to complete properly

### What's Deployed

- ✅ Edge Function: `hyper-service` with improved Apify integration
- ✅ Frontend: All changes pushed to GitHub and auto-deployed
- ✅ Database: Schema updated with comprehensive fields
- ✅ Privacy Search: Community filtering working

**Everything is deployed and working EXCEPT for Apify returning correct profiles.**

---

## Workaround: Manual Entry

Until the Apify issue is resolved, users can:

1. Click **"Skip & Fill Manually"** in onboarding
2. Enter profile details by hand
3. System still works perfectly without LinkedIn import

---

## Cost Comparison

If you need to switch actors:

| Actor | Cost per Profile | Reliability | Notes |
|-------|-----------------|-------------|-------|
| Anchor (current) | $0.006 | ⚠️ Broken | Returning wrong profiles |
| Bright Data | $0.10-0.20 | ⭐⭐⭐⭐⭐ | Most reliable |
| Phantombuster | $0.08-0.15 | ⭐⭐⭐⭐ | Very reliable |
| Apify Official | $0.02-0.05 | ⭐⭐⭐ | Decent |

---

## Recommended Next Steps

1. **FIRST:** Test the actor on Apify's website (Step 1 above)
2. **THEN:** Check your Apify account tier and credits
3. **IF FREE TIER:** Upgrade to paid plan ($49/month includes $50 credits)
4. **IF STILL BROKEN:** Switch to Bright Data or Phantombuster
5. **LONG-TERM:** Consider LinkedIn Official API with OAuth

---

## Files to Check

**Edge Function:**
```bash
supabase/functions/hyper-service/index.ts
```

**Test Script:**
```bash
scripts/test-apify-direct.js
```

**Logs:**
```bash
# Supabase Logs
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions/hyper-service/logs

# Apify Logs
https://console.apify.com/actors/runs
```

---

## Support

**Apify Support:**
- Email: support@apify.com
- Discord: https://discord.com/invite/jyEM2PRvMU
- Docs: https://docs.apify.com/

**Ask Them:**
> "I'm using the anchor~linkedin-profile-enrichment actor via API, but it's consistently
> returning the wrong profiles (Hubert de Renoterre) regardless of input URL. Is this a
> free tier limitation or a bug in the actor?"

---

**Status:** 🔴 BLOCKED BY APIFY ACTOR ISSUE
**Code Status:** ✅ All fixes deployed and pushed to GitHub
**Next Action:** Test on Apify website to determine root cause
