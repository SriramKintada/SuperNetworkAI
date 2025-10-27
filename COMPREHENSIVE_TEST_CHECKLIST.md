# Comprehensive Application Test Checklist

**Date:** 2025-10-27
**Purpose:** Final check before production deployment

---

## 🏠 Landing Page (`/`)

### Components to Test:
- [ ] Header navigation links
- [ ] Hero section CTA buttons
- [ ] "Get Started" button → redirects to /signup
- [ ] "Learn More" button → scrolls to features
- [ ] Footer links
- [ ] Responsive design (mobile/desktop)

### Expected Behavior:
- Navigation should work smoothly
- CTAs should redirect correctly
- No console errors

---

## 🔐 Authentication Pages

### `/login`
- [ ] Email input field
- [ ] Password input field
- [ ] "Sign in with Google" button
- [ ] "Sign up" link → redirects to /signup
- [ ] Form validation
- [ ] Error messages display correctly
- [ ] Successful login → redirects to /dashboard

### `/signup`
- [ ] Email input field
- [ ] Password input field
- [ ] Confirm password field
- [ ] "Sign up with Google" button
- [ ] "Log in" link → redirects to /login
- [ ] Form validation
- [ ] Error messages display correctly
- [ ] Successful signup → redirects to /onboarding

### Database Check:
- [ ] User created in auth.users table
- [ ] Profile created in profiles table

---

## 📝 Onboarding (`/onboarding`)

### Step 0: LinkedIn Import
- [ ] LinkedIn URL input field
- [ ] "Import from LinkedIn" button
- [ ] "Skip & Fill Manually" button
- [ ] Loading state during import
- [ ] Error message if import fails
- [ ] Success: auto-fills form and advances to Step 1

### API Call Check:
- [ ] Calls `hyper-service` Edge Function
- [ ] Returns profile data (bio, title, company, skills, location)
- [ ] Apify scraping works
- [ ] GPT-4o Mini extraction works

### Step 1: Profile Setup
- [ ] Professional Title input
- [ ] Company input
- [ ] Bio textarea
- [ ] "Previous" button
- [ ] "Next" button
- [ ] Data persists between steps

### Step 2: Goals & Interests
- [ ] Goal checkboxes (6 options)
- [ ] "Previous" button
- [ ] "Next" button
- [ ] Selected goals persist

### Step 3: Communities
- [ ] Community checkboxes (6 options)
- [ ] "Previous" button
- [ ] "Next" button
- [ ] Selected communities persist

### Step 4: Preferences
- [ ] Email notifications toggle
- [ ] "Previous" button
- [ ] "Complete Onboarding" button
- [ ] Loading state during save

### Database Check:
- [ ] Profile saved to profiles table with all fields
- [ ] Embedding generated and saved to profile_embeddings
- [ ] Vector dimensions = 1536
- [ ] Community memberships saved to community_members

### API Call Check:
- [ ] Profile creation successful
- [ ] Embedding generation called
- [ ] Redirect to /dashboard after completion

---

## 🏡 Dashboard (`/dashboard`)

### Components to Test:
- [ ] Sidebar navigation
- [ ] Welcome message with user name
- [ ] Profile summary card
- [ ] Recent matches section
- [ ] "View All Matches" button → /search
- [ ] Communities section
- [ ] "Browse Communities" button → /communities
- [ ] Recent activity feed
- [ ] Quick actions buttons

### Database Check:
- [ ] Loads user profile from profiles table
- [ ] Shows correct user data
- [ ] Displays real communities from community_members

---

## 🔍 Search Page (`/search`)

### Components to Test:
- [ ] Search input field
- [ ] Search button
- [ ] Enter key triggers search
- [ ] Loading state during search
- [ ] Results display with match cards
- [ ] Match score display (0-100%)
- [ ] "Connect" button on each card
- [ ] "Pass" button on each card
- [ ] Filter section
- [ ] Goal filter buttons
- [ ] Empty state message (no results)

### API Call Check:
- [ ] Calls `search-profiles` Edge Function
- [ ] Returns results with similarity scores
- [ ] Query converted to embedding (OpenAI)
- [ ] Vector search via match_profiles RPC
- [ ] Results display correctly

### Test Queries:
- [ ] "technical cofounder who knows AI" → should return AI engineer
- [ ] "designer looking for startups" → should return designer
- [ ] "fintech founder" → should return fintech CEO

### Database Check:
- [ ] Vector search working
- [ ] Results come from profiles table
- [ ] Match scores calculated correctly

---

## 🏘️ Communities Pages

### `/communities` (Browse)
- [ ] Search communities input
- [ ] Search functionality works
- [ ] Community type filter (All/Public/Private)
- [ ] Intent filter buttons
- [ ] Community cards display
- [ ] "Create Community" button → /communities/create
- [ ] "Join with Invite Code" button → /communities/join
- [ ] "View" button on each card → /communities/[id]

### Database Check:
- [ ] Currently uses MOCK DATA ⚠️
- [ ] Should load from communities table
- [ ] Should check membership from community_members

### `/communities/create`
- [ ] Community name input
- [ ] Description textarea
- [ ] Public/Private radio buttons
- [ ] "Generate Code" button (for private)
- [ ] Invite code display
- [ ] "Copy to Clipboard" button
- [ ] "Create Community" button
- [ ] Loading state during creation
- [ ] Success: redirects to /communities/[new-id]

### API Call Check:
- [ ] Saves to communities table
- [ ] Stores invite_code for private communities
- [ ] Adds creator as admin to community_members
- [ ] Redirects after success

### `/communities/join`
- [ ] Invite code input
- [ ] "Join Community" button
- [ ] Error message for invalid code
- [ ] Success message
- [ ] Redirect to community page after join

### `/communities/[id]`
- [ ] Community name and description display
- [ ] Member count
- [ ] "Join" or "Leave" button
- [ ] Members list
- [ ] Posts/activity feed
- [ ] Settings button (for admins)

---

## ⚙️ Settings Pages

### `/settings/profile`
- [ ] Name input
- [ ] Email display (read-only)
- [ ] Bio textarea
- [ ] Title input
- [ ] Company input
- [ ] Location input
- [ ] Skills input (tags)
- [ ] LinkedIn URL input
- [ ] Photo upload
- [ ] "Save Changes" button
- [ ] Success/error messages

### Database Check:
- [ ] Loads from profiles table
- [ ] Saves to profiles table
- [ ] Updates embeddings if bio/skills change

### `/settings/privacy`
- [ ] Profile visibility dropdown (Public/Community-Only/Private)
- [ ] Show in search toggle
- [ ] Messaging preferences toggles
- [ ] Communities list display
- [ ] "Save Privacy Settings" button
- [ ] Success/error messages

### Database Check:
- [ ] Loads visibility from profiles table
- [ ] Loads communities from community_members
- [ ] Saves to profiles table
- [ ] Settings persist after reload

### `/settings/communities`
- [ ] Joined communities list
- [ ] "Leave" button on each community
- [ ] Confirmation dialog
- [ ] Updates after leave action

---

## 👤 Profile Pages

### `/profile/[id]`
- [ ] User name display
- [ ] Headline display
- [ ] Bio display
- [ ] Skills display
- [ ] Location display
- [ ] Intent display
- [ ] "Connect" button
- [ ] "Message" button
- [ ] Communities list
- [ ] Respects privacy settings

### Database Check:
- [ ] Loads from profiles table
- [ ] Shows correct user data
- [ ] Hides data based on privacy settings

---

## 📨 Messages Page (`/messages`)

### Components to Test:
- [ ] Conversation list
- [ ] Search conversations
- [ ] New message button
- [ ] Message thread display
- [ ] Message input
- [ ] Send button
- [ ] Real-time updates

### Status: ⚠️ NOT IMPLEMENTED YET

---

## 🔗 Connections Page (`/connections`)

### Components to Test:
- [ ] Connections list
- [ ] Search connections
- [ ] Filter by status
- [ ] "Message" button
- [ ] "View Profile" button

### Status: ⚠️ PARTIALLY IMPLEMENTED

---

## 🛠️ Admin Pages (`/admin`)

### Status: ⚠️ NOT TESTED YET

---

## 🔌 API & Database Checks

### Edge Functions:
- [ ] hyper-service (LinkedIn import) - WORKING ✅
- [ ] search-profiles (Vector search) - WORKING ✅
- [ ] match-ranking (AI ranking) - WORKING ✅
- [ ] super-api - BROKEN (ignore) ⚠️

### Database Tables:
- [ ] profiles - accessible and working
- [ ] profile_embeddings - accessible and working
- [ ] communities - accessible and working
- [ ] community_members - accessible and working
- [ ] connections - exists
- [ ] messages - exists

### Vector Database:
- [ ] pgvector extension enabled
- [ ] IVFFlat index created
- [ ] match_profiles RPC function working
- [ ] Embeddings coverage: 100%
- [ ] Similarity search working

### Authentication:
- [ ] Supabase Auth configured
- [ ] Google OAuth working
- [ ] JWT tokens generated
- [ ] Session persistence

---

## 🎨 UI/UX Checks

### Responsive Design:
- [ ] Mobile view (< 768px)
- [ ] Tablet view (768px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Sidebar behavior on mobile
- [ ] Navigation menu responsive

### Accessibility:
- [ ] Keyboard navigation
- [ ] Focus states visible
- [ ] Color contrast sufficient
- [ ] Screen reader friendly

### Performance:
- [ ] Page load time < 3s
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images optimized

---

## 🚨 Known Issues

1. **Communities page uses mock data** ⚠️
   - Should connect to database
   - Need to load from communities table
   - Need to check membership

2. **super-api function broken** ⚠️
   - Not in codebase
   - Has error
   - Can be ignored or deleted

3. **Messages not implemented** ⚠️
   - UI exists
   - No backend yet

---

## ✅ Priority Fixes Before Push

### Critical (Must Fix):
1. Connect communities page to database
2. Test authentication flow end-to-end
3. Verify all database connections

### High Priority:
4. Test onboarding with real data
5. Test search with multiple queries
6. Verify settings pages save correctly

### Medium Priority:
7. Test all navigation links
8. Verify responsive design
9. Check error handling

### Low Priority:
10. Test admin pages
11. Implement messages
12. Fix super-api or remove

---

## 📝 Test Script Commands

```bash
# Test Edge Functions
node scripts/test-edge-functions.js

# Test search flow
node scripts/test-full-search-flow.js

# Check profile data
node scripts/check-profile-data.js

# Test embeddings
node scripts/test-embeddings-storage.js

# Generate missing embeddings
node scripts/generate-missing-embeddings.js
```

---

## 🎯 Final Checklist Before GitHub Push

- [ ] All critical bugs fixed
- [ ] All Edge Functions deployed
- [ ] Database connections verified
- [ ] Vector DB working
- [ ] No console errors
- [ ] All test scripts passing
- [ ] Documentation updated
- [ ] Commit message prepared
- [ ] Ready to push!
