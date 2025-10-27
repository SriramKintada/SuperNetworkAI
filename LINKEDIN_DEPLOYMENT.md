# LinkedIn Integration Deployment Guide

## ✅ Completed
- ✅ Created Edge Function: `enrich-linkedin-profile`
- ✅ Added LinkedIn import UI to onboarding (Step 0)
- ✅ Updated profile schema to handle LinkedIn data
- ✅ All changes committed and pushed to GitHub

## 🚀 Deployment Steps

### 1. Deploy Edge Function to Supabase

Go to Supabase Dashboard:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/functions

**Option A: Via Dashboard (Easiest)**
1. Click "New Edge Function"
2. Name it: `enrich-linkedin-profile`
3. Copy and paste contents from: `supabase/functions/enrich-linkedin-profile/index.ts`
4. Click "Deploy Function"

**Option B: Via Supabase CLI** (if you have it installed)
```bash
supabase functions deploy enrich-linkedin-profile
```

### 2. Add APIFY_API_KEY Secret to Supabase

Go to Supabase Edge Functions Secrets:
https://supabase.com/dashboard/project/mpztkfmhgbbidrylngbw/settings/functions

Add new secret:
- **Name:** `APIFY_API_KEY`
- **Value:** Get from your `.env.local` file (starts with `apify_api_...`)

Click "Add secret" and "Save"

### 3. Verify Existing Secrets

Make sure these secrets are already set (from Phase 2-6 deployment):
- ✅ `OPENAI_API_KEY` (for GPT-4o Mini and embeddings)
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

If any are missing, add them from your `.env.local` file.

### 4. Test the Integration

After deployment:
1. Wait ~2 minutes for Vercel to redeploy the frontend
2. Log out and log in with Google OAuth
3. You'll see the new Step 0: LinkedIn Import
4. Enter a LinkedIn URL (e.g., `https://linkedin.com/in/yourprofile`)
5. Click "Import from LinkedIn"
6. Wait 15-30 seconds for:
   - Apify to scrape the profile
   - OpenAI to extract structured data
   - Form to auto-populate
7. Proceed through remaining steps
8. Profile should be created with all LinkedIn data + embeddings

## 🔍 How It Works

### Flow:
1. **User enters LinkedIn URL** → Frontend
2. **Edge Function receives request** → `enrich-linkedin-profile`
3. **Apify scrapes LinkedIn** → Apify Actor: `apimaestro~linkedin-profile-detail`
4. **OpenAI extracts data** → GPT-4o Mini structures the raw HTML into clean JSON
5. **Return to frontend** → Auto-populate form fields
6. **User completes onboarding** → Save enriched profile
7. **Generate embeddings** → Include skills, location, bio in vector

### Data Extracted:
- Name
- Current role + company (headline)
- Professional bio (AI-generated summary)
- Skills (top 10-15)
- Location
- Industries
- Education summary
- LinkedIn URL (for reference)

### Database Fields Populated:
- `headline` - "Senior Engineer at Google"
- `bio` - AI-generated professional summary
- `location` - "San Francisco, CA"
- `skills` - ["Python", "React", "Machine Learning", ...]
- `linkedin_url` - Original LinkedIn URL
- `intent_text` - Goals/intents from onboarding
- All data embedded for semantic search

## 🐛 Troubleshooting

**"Failed to import LinkedIn profile"**
- Check that APIFY_API_KEY is set in Supabase secrets
- Verify LinkedIn URL is a valid public profile URL
- Check Supabase Edge Function logs for errors

**"Embedding generation failed"**
- Non-blocking - profile still created
- Check OPENAI_API_KEY is set
- Embeddings can be regenerated later

**LinkedIn URL format**
- Must be public profile: `linkedin.com/in/username`
- Not company pages: `linkedin.com/company/...`
- Not posts or other LinkedIn URLs

## 📊 Costs

**Per LinkedIn Import:**
- Apify: ~$0.01-0.02 per profile scrape
- OpenAI GPT-4o Mini: ~$0.002 per extraction
- OpenAI Embeddings: ~$0.0001 per profile
- **Total: ~$0.012-0.022 per import**

Very cost-effective for the value provided!

## ✨ Next Steps

Once deployed and tested:
1. Users can import LinkedIn profiles during onboarding
2. Or skip and fill manually
3. All data gets embedded for AI-powered search
4. Semantic search will include skills, location, experience
5. Much richer matching than manual input alone
