# Pre-Flight Checklist for SuperNetworkAI Backend Build

Complete these steps before starting Phase 1:

## ✅ Environment Setup

### 1. Supabase Project Setup
- [ ] Create Supabase project at https://supabase.com/dashboard
- [ ] Copy Project URL (Settings → API)
- [ ] Copy `anon` public key (Settings → API)
- [ ] Copy `service_role` secret key (Settings → API)
- [ ] Install Supabase CLI: `npm install -g supabase` or `brew install supabase/tap/supabase`
- [ ] Login to Supabase CLI: `supabase login`
- [ ] Link project: `supabase link --project-ref YOUR_PROJECT_REF`

### 2. API Keys Setup
- [ ] **OpenAI API Key**: Get from https://platform.openai.com/api-keys
  - Used for: Vector embeddings (text-embedding-3-small)
  - Format: `sk-proj-[long string]`

- [ ] **Anthropic API Key**: Get from https://console.anthropic.com/
  - Used for: AI matching with Claude Sonnet 4
  - Need to obtain this key

- [ ] **Resend API Key** (Optional for Phase 5): Get from https://resend.com/
  - Used for: Email notifications

- [ ] **Apify API Key** (Optional for Phase 6): Get from https://apify.com/
  - Used for: LinkedIn profile import

### 3. Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in all required variables in `.env.local`:
  ```bash
  cp .env.example .env.local
  # Then edit .env.local with your actual keys
  ```
- [ ] Verify `.env.local` is in `.gitignore` (NEVER commit this file!)

### 4. Development Tools
- [ ] Node.js v18+ installed: `node --version`
- [ ] npm/pnpm/yarn installed
- [ ] Supabase CLI installed: `supabase --version`
- [ ] Git installed (for migrations)

## 📋 Verification Steps

Run these commands to verify setup:

```bash
# 1. Check Supabase CLI
supabase --version

# 2. Check project link
supabase status

# 3. Check frontend runs
npm run dev

# 4. Verify environment variables loaded
# (In your browser console at localhost:3000)
# Open DevTools → Console → Type:
# process.env.NEXT_PUBLIC_SUPABASE_URL
```

## 🚀 Ready to Build?

Once all items are checked, you're ready to start **Phase 1: Foundation - Database Schema + Auth**.

### Phase 1 Will Create:
1. Database schema (8 core tables)
2. Row-Level Security (RLS) policies
3. Database functions and triggers
4. Authentication flow (signup/login)

**Estimated Time**: ~2 hours

### Type "READY" when all checklist items are complete!

---

## 🆘 Troubleshooting

**Issue**: Supabase CLI not found
- **Solution**: Install with `npm install -g supabase` or `brew install supabase/tap/supabase`

**Issue**: "Project not linked"
- **Solution**: Run `supabase link --project-ref YOUR_PROJECT_REF`
- Find project ref in Supabase Dashboard → Settings → General

**Issue**: ".env.local not loading"
- **Solution**: Restart dev server (`npm run dev`)
- Make sure file is named `.env.local` (not `.env`)

**Issue**: "OpenAI API key invalid"
- **Solution**: The key you provided appears truncated. Get full key from OpenAI dashboard
- Format should be: `sk-proj-[long string]`
