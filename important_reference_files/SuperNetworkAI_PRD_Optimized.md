# SuperNetworkAI - Product Requirements Document

**Version:** 2.0  
**Date:** October 26, 2025  
**Product Owner:** Sriram Kintada  
**Status:** Implementation Ready

---

## CONTENTS

1. [Approvals](#approvals)
2. [Abstract](#abstract)
3. [Business Objectives](#business-objectives)
4. [KPIs](#kpis)
5. [Success Criteria](#success-criteria)
6. [User Journeys](#user-journeys)
7. [Scenarios](#scenarios)
8. [User Flow](#user-flow)
9. [Functional Requirements](#functional-requirements)
10. [Model Requirements](#model-requirements)
11. [Data Requirements](#data-requirements)
12. [Prompt Requirements](#prompt-requirements)
13. [Testing & Measurement](#testing--measurement)
14. [Risks & Mitigations](#risks--mitigations)
15. [Costs](#costs)
16. [Assumptions & Dependencies](#assumptions--dependencies)
17. [Compliance/Privacy/Legal](#complianceprivacylegal)
18. [GTM/Rollout Plan](#gtmrollout-plan)
19. [Technical Debugging Guide](#technical-debugging-guide)

---

## 👍 Approvals

| ROLE | TEAMMATE | REVIEWED | STATUS |
|------|----------|----------|--------|
| Product | Sriram Kintada | 10/26/25 | Approved |
| Engineering | TBD | - | Pending |
| UX | TBD | - | Pending |
| Legal | TBD | - | Pending |

---

## 📝 Abstract

**SuperNetworkAI** is an AI-powered B2B2C networking platform enabling private communities to match members based on skills, intent, and compatibility. Unlike LinkedIn's backward-looking resume approach, SuperNetworkAI focuses on **forward-looking intent** - what people are looking for right now (cofounders, clients, advisors, teammates).

**Core Innovation:** Community-first privacy model where each community (100x Engineers, IISER Pune, YC batches) operates as a private network with granular member visibility controls.

**Value Proposition:**
- **For Members:** Find cofounders/collaborators without DMing 50 people. Natural language search ("technical cofounder who knows RAG systems"). AI-generated match explanations. 3-minute onboarding using LinkedIn + free-text intent.
- **For Communities:** Increase member engagement and retention. Provide tangible networking value. Analytics on member needs. Private, branded networking space.

**Market Opportunity:**
- TAM: 50M+ professionals in online communities globally
- SAM: 5M professionals in tech/startup communities
- SOM: 100K professionals in Indian startup/research communities (initial focus)

**Business Model:**
- Freemium: Free up to 100 members per community
- Pro: $49/month for unlimited members + analytics
- Enterprise: Custom pricing for white-label, SSO, API access

---

## 🎯 Business Objectives

### Primary Objectives

1. **Validate Problem-Solution Fit** - Pilot with 3 communities in first 2 weeks. Achieve 50% profile completion rate. 30% of users make at least 1 connection.

2. **Achieve Product-Market Fit** - 40% D7 retention (users return after 1 week). NPS ≥ 40. 70% of connections rate match quality as "Good" or "Excellent".

3. **Build Scalable Growth Engine** - Communities invite other communities (viral loop). Each community brings 50-500 members. Organic growth through word-of-mouth.

4. **Generate Revenue** - 10 paying communities by Month 3. $5K MRR by Month 6. 5% freemium-to-paid conversion rate.

### Secondary Objectives

- Position as "anti-LinkedIn" for privacy-conscious communities
- Build reputation as AI-first networking tool
- Establish partnerships with accelerators, universities, cohort programs

---

## 📊 KPIs

### North Star Metric
**Meaningful Connections Made Per Week**
- Definition: User clicks "Request Intro" and reports positive outcome within 7 days
- Target: 100 connections/week by Month 2

### Product KPIs

| GOAL | METRIC | TARGET | QUESTION |
|------|--------|--------|----------|
| User Acquisition | Communities onboarded | 10 by Month 1 | How many communities join? |
| User Activation | Profile completion rate | 60% | Do users complete onboarding? |
| User Engagement | Weekly active users | 40% | Do users search/view profiles weekly? |
| Connection Quality | Match quality rating | 4.0/5.0 avg | Are matches relevant? |
| User Retention | D7 retention | 40% | Do users return after 1 week? |
| Revenue | Paying communities | 10 by Month 3 | Do communities convert to paid? |
| Network Effect | Invites per community | 2 invites/community | Do communities invite others? |

### Technical KPIs

| METRIC | TARGET | MEASUREMENT |
|--------|--------|-------------|
| Search latency (P95) | <3 seconds | API logs |
| AI match accuracy | >80% (user ratings) | Feedback surveys |
| Profile import success | >85% (LinkedIn scraping) | Error tracking |
| API uptime | 99.5% | Monitoring dashboard |

---

## 🏆 Success Criteria

### Launch Success (Week 2)
- 3 pilot communities live (100x Engineers, IISER Pune, AI Research Club)
- 300 users signed up
- 150 completed profiles (50% completion rate)
- 50 connection requests made
- 0 critical bugs

### Product-Market Fit (Month 3)
- 50 communities, 10,000 users
- 40% D7 retention
- NPS ≥ 40
- 5 paying communities ($245 MRR)
- 100+ positive testimonials

### Scale Success (Month 6)
- 150 communities, 50,000 users
- $5K MRR
- Profitable unit economics
- 70% match quality rating
- Featured in 3+ publications

---

## 🚶‍♀️ User Journeys

### Journey 1: Community Admin Sets Up Private Network

**Persona:** Rajesh, 100x Engineers cohort lead, wants to help members find cofounders without public exposure.

**Journey:**
1. Signs up as admin, creates "100x Engineers C5" community
2. Invites 200 cohort members via email/Slack
3. Customizes community settings (visibility: private, domain: @100xengineers.com)
4. Monitors analytics dashboard (signups, searches, connections)
5. Receives weekly report: "15 new connections this week"

**Outcome:** Members actively network, Rajesh gets praised for providing value beyond just Discord access.

---

### Journey 2: Founder Finds Technical Cofounder

**Persona:** Priya, solo founder building AI SaaS, needs technical cofounder who knows RAG systems.

**Journey:**
1. Joins 100x community, completes profile in 3 minutes (LinkedIn import + intent)
2. Searches: "Looking for technical cofounder who knows RAG and vector databases"
3. Gets 8 matches ranked by AI with compatibility explanations
4. Reviews Amit's profile: "95% match - Both in AI SaaS, Amit wants to cofound, knows RAG + pgvector"
5. Requests intro, gets Amit's contact after mutual approval
6. Books call within 24 hours

**Outcome:** Priya finds cofounder in 2 days vs. 2 months of cold outreach.

---

### Journey 3: Researcher Discovers Collaboration Opportunities

**Persona:** Dr. Singh, IISER professor, wants to find industry partners for photo-battery research.

**Journey:**
1. IISER admin creates private network for faculty/students
2. Dr. Singh creates profile: "Working on photo-batteries, looking for commercialization partners"
3. Searches: "Entrepreneurs interested in deep tech energy solutions"
4. Finds 3 matches in 100x community (cross-community search)
5. Connects with Vikram (energy startup founder) for pilot project

**Outcome:** Research-to-startup bridge created, potential licensing deal.

---

## 📖 Scenarios

### Scenario 1: Onboarding
**Given:** New user invited by community admin  
**When:** User clicks invite link  
**Then:** User signs up, imports LinkedIn (or fills manually), describes intent in free text, AI extracts structured data, profile created in 3 minutes

### Scenario 2: Natural Language Search
**Given:** User wants to find specific type of person  
**When:** User types "Technical cofounder who knows RAG systems"  
**Then:** System generates embedding, searches vector database, returns top 20 semantic matches, LLM re-ranks by compatibility, shows top 8 with explanations

### Scenario 3: Connection Request
**Given:** User finds relevant match  
**When:** User clicks "Request Intro"  
**Then:** Request sent to match, both users get email notification, if approved, contact info shared, both added to "My Connections"

### Scenario 4: Privacy Controls
**Given:** User wants to limit visibility  
**When:** User sets profile to "Community Only"  
**Then:** Profile only visible to members of user's communities, not in public search, not visible to other communities

### Scenario 5: Community Analytics
**Given:** Admin wants to track engagement  
**When:** Admin opens dashboard  
**Then:** Sees signups, active users, searches, connections, top skills requested, member satisfaction scores

---

## 🕹️ User Flow

### Happy Path: Find & Connect

```
1. User signs up → 2. Imports LinkedIn → 3. Describes intent → 4. Profile created
   ↓
5. Searches "technical cofounder RAG" → 6. Views 8 AI-ranked matches → 7. Opens Amit's profile
   ↓
8. Reads compatibility: "95% match - both AI SaaS, Amit wants cofounder" → 9. Clicks "Request Intro"
   ↓
10. Amit approves → 11. Contact info shared → 12. Both book call
```

### Alternative Flows

**Flow A: LinkedIn Import Fails**
- User pastes URL → Scraper fails → Show manual form → User fills 7 fields → Profile created

**Flow B: No Matches Found**
- User searches → 0 results → Show "No matches yet" + invite link → User invites others

**Flow C: Connection Request Declined**
- User requests intro → Match declines → User notified with reason → Suggest other matches

---

## 🧰 Functional Requirements

### Feature 1: User Authentication & Onboarding

| SUB-FEATURE | USER STORY | ACCEPTANCE CRITERIA |
|-------------|------------|---------------------|
| Email Signup | As a new user, I want to sign up with email so I can create my profile | Email validated, password ≥8 chars, confirmation email sent, user redirected to onboarding |
| LinkedIn Import | As a user, I want to import my LinkedIn profile so I can save time | User pastes LinkedIn URL, Apify scrapes data, AI extracts name/headline/experience, pre-fills form fields |
| Intent Capture | As a user, I want to describe what I'm looking for in free text so AI understands my needs | Free-text field (500 char max), AI extracts structured intent (looking_for, skills_needed, role_type), stored in profile |
| Profile Completion | As a user, I want to know my profile progress so I can complete it | Progress bar shows 7 steps (name, photo, headline, skills, intent, location, links), 100% = profile_complete flag set |

### Feature 2: Semantic Search & Matching

| SUB-FEATURE | USER STORY | ACCEPTANCE CRITERIA |
|-------------|------------|---------------------|
| Natural Language Search | As a user, I want to search using plain English so I find relevant people | User types query, system generates embedding, searches pgvector (cosine similarity >0.6), returns top 20 |
| AI Re-Ranking | As a user, I want matches ranked by compatibility so I see best fits first | LLM analyzes top 20, scores by intent alignment + skill overlap + experience level, returns top 8 with scores |
| Match Explanations | As a user, I want to know why someone is a match so I can decide to connect | Each match shows AI-generated explanation: "95% match - both in AI SaaS, Amit wants cofounder, knows RAG + pgvector" |
| Filters | As a user, I want to filter by location/experience so I narrow results | Sidebar filters: location, experience level, skills, applied to top 20 before LLM ranking |

### Feature 3: Connection Management

| SUB-FEATURE | USER STORY | ACCEPTANCE CRITERIA |
|-------------|------------|---------------------|
| Request Intro | As a user, I want to request intro so I can connect with matches | User clicks button, modal shows, user adds optional message (200 char), request sent to match, email notification |
| Approve/Decline | As a user, I want to approve/decline requests so I control who sees my contact info | User gets notification, clicks approve → contact info shared, clicks decline → user notified with reason |
| My Connections | As a user, I want to see all my connections so I can manage relationships | List view shows photo, name, headline, connection date, last interaction, "Message" button |

### Feature 4: Privacy Controls

| SUB-FEATURE | USER STORY | ACCEPTANCE CRITERIA |
|-------------|------------|---------------------|
| Visibility Settings | As a user, I want to control who sees my profile so I maintain privacy | Settings: Public (anyone), Community Only (my communities), Private (no one), applied to search results + profile views |
| Contact Info Protection | As a user, I want contact info hidden until approved so I avoid spam | Email/phone only shown after connection approval, LinkedIn/Twitter visible if public link provided |
| Community Membership | As a user, I want to join multiple communities so I network across groups | User can join up to 5 communities, each with separate visibility settings, search within or across communities |

### Feature 5: Community Admin Dashboard

| SUB-FEATURE | USER STORY | ACCEPTANCE CRITERIA |
|-------------|------------|---------------------|
| Community Setup | As an admin, I want to create community so members can network | Admin creates community, sets name/domain/visibility, generates invite link, customizes branding (logo, colors) |
| Member Management | As an admin, I want to invite/remove members so I control access | Bulk invite via CSV/email list, remove members (soft delete), view member list with status (active, pending, inactive) |
| Analytics Dashboard | As an admin, I want to see engagement metrics so I track value | Charts show: signups/week, active users, searches/week, connections/week, top skills requested, NPS score |

---

## 📐 Model Requirements

| SPECIFICATION | REQUIREMENT | RATIONALE |
|---------------|------------|-----------|
| Primary LLM | Claude Sonnet 4 (Anthropic) | Best at intent extraction, match ranking, explanation generation. JSON reliability. 200K context for batch processing. |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) | Cost-effective ($0.02/1M tokens), fast (50ms latency), high quality for semantic search. |
| Context Window | 8K tokens (profile analysis), 200K (batch processing) | Single profile analysis fits in 8K. Batch ranking 50 profiles needs 200K. |
| Latency Target | P95 <3 seconds (end-to-end search) | Embedding: 50ms, vector search: 200ms, LLM ranking: 2s, UI render: 750ms = 3s total |
| Fallback Model | Claude Haiku (fast), GPT-4 Turbo (backup) | If Sonnet unavailable, use Haiku for speed or GPT-4 for quality. |
| Fine-Tuning | Not required initially | Pre-trained models sufficient. May fine-tune Sonnet on match quality feedback after 10K connections. |

---

## 🧮 Data Requirements

### Profile Data Collection

**Onboarding Data:**
- Name, email, photo (required)
- LinkedIn URL (optional, enables import)
- Intent text (required, 500 char max)
- Current role, company, experience level (optional)
- Skills (min 3, max 20), interests (max 10)
- Location, social links (optional)

**Derived Data (AI-Generated):**
- Structured intent: `{looking_for: ["cofounder"], skills_needed: ["RAG", "Python"], role_type: "technical"}`
- Profile embedding (1536 dims) generated from: `name + headline + bio + intent_text + skills + interests`
- Embedding updated on profile edit (debounced 5 min to avoid API spam)

### Search Query Data

**Input:**
- Natural language query (e.g., "technical cofounder who knows RAG")
- Filters: location, experience level, skills
- User context: current profile, communities, past searches

**Output:**
- Top 20 semantic matches (vector similarity >0.6)
- LLM re-ranked top 8 with scores (0-100) and explanations
- Logged for analytics: query text, num_results, avg_match_score, user_id, timestamp

### Connection Data

**Request Metadata:**
- Requester profile, target profile, request message, timestamp
- Status: pending, approved, declined, expired (7 days)
- Decline reason (if provided): "Not looking for this", "Already connected", "Timing not right"

**Connection Record:**
- Both user IDs, connection date, channel (in-app, email, external)
- Follow-up actions: meeting_scheduled, partnership_formed, no_response
- Quality rating (1-5 stars, optional feedback)

### Data Retention

- Profiles: Retained until user deletes account + 30 days
- Embeddings: Regenerated on profile edit, old versions discarded
- Search logs: Retained 90 days (analytics), then aggregated/anonymized
- Connection requests: Retained 7 days if pending, 1 year if approved/declined
- User activity: Last 180 days detailed, >180 days aggregated

---

## 💬 Prompt Requirements

### Prompt 1: Intent Extraction (Onboarding)

**Purpose:** Convert free-text intent into structured JSON for matching.

**Input:**
```
User's intent text: "I'm building an AI SaaS product and looking for a technical cofounder who knows RAG systems, vector databases, and has experience with Python and TypeScript. Ideally someone who has built 0-1 products before."
```

**System Prompt:**
```
You are an AI assistant that extracts structured networking intent from user descriptions.

Extract the following fields in JSON format:
- looking_for: array of strings (e.g., ["cofounder", "advisor", "client", "teammate", "investor"])
- skills_needed: array of specific technical skills mentioned
- role_type: string (e.g., "technical", "business", "design", "marketing")
- experience_preference: string (e.g., "junior", "mid", "senior", "any")
- additional_context: any other important requirements

Output ONLY valid JSON. No markdown. No explanations.
```

**Output Format:**
```json
{
  "looking_for": ["cofounder"],
  "skills_needed": ["RAG", "vector databases", "Python", "TypeScript"],
  "role_type": "technical",
  "experience_preference": "senior",
  "additional_context": "Has built 0-1 products before"
}
```

**Accuracy Target:** 85% of extracted intents match human evaluation (tested on 100 samples).

---

### Prompt 2: Match Ranking & Explanation

**Purpose:** Rank top 20 semantic matches by compatibility and generate explanations.

**Input:**
```
Searcher profile: {name, headline, intent_text, intent_structured, skills, experience_level}
Search query: "technical cofounder who knows RAG"
Top 20 matches: [{profile_id, name, headline, intent_text, skills, similarity_score}, ...]
```

**System Prompt:**
```
You are an expert networking matchmaker. Rank these 20 profiles by compatibility with the searcher's query and intent.

Consider:
1. Intent alignment: Does match's intent align with searcher's needs?
2. Skill overlap: Do they have complementary skills?
3. Experience level: Are they at compatible career stages?
4. Mutual benefit: Could this be a two-way match?

For each of the top 8 matches, provide:
- match_score: integer 0-100 (higher = better match)
- explanation: 1-2 sentences explaining why they're compatible

Output ONLY valid JSON array. No markdown.
```

**Output Format:**
```json
[
  {
    "profile_id": "uuid",
    "match_score": 95,
    "explanation": "Amit is a senior engineer with RAG and pgvector experience, actively seeking to cofound an AI SaaS startup. Your technical needs align perfectly with his skillset."
  },
  ...
]
```

**Accuracy Target:** 70% of top 3 matches rated "relevant" or "very relevant" by users.

---

### Prompt 3: Profile Quality Check

**Purpose:** Identify incomplete or low-quality profiles to prompt users to improve.

**Input:**
```
Profile: {name, headline, bio, intent_text, skills, photo_url}
```

**System Prompt:**
```
Evaluate this networking profile for quality and completeness.

Check for:
1. Headline: Is it descriptive and professional?
2. Intent: Is it specific and actionable?
3. Skills: Are there at least 5 relevant skills?
4. Bio: Is it present and >100 characters?

Provide:
- quality_score: integer 0-100
- issues: array of strings (missing elements)
- suggestions: array of specific improvements

Output ONLY valid JSON.
```

**Output Format:**
```json
{
  "quality_score": 65,
  "issues": ["Bio too short", "Intent vague"],
  "suggestions": [
    "Add more details to bio (current: 45 chars, recommended: 150+)",
    "Make intent more specific: mention exact role type and skills needed"
  ]
}
```

---

## 🧪 Testing & Measurement

### Offline Evaluation

**Golden Dataset:**
- 100 manually curated search queries with expected top 5 matches
- Scenarios: cofounder search, technical hire, advisor lookup, client discovery
- Diversity: junior to executive, multiple industries, various locations

**Metrics:**
- Precision@5: Are top 5 matches relevant?
- Recall@20: Are all relevant matches in top 20?
- Match score correlation: Do AI scores align with human ratings?

**Pass Threshold:** 70% Precision@5, 80% Recall@20, 0.6+ Pearson correlation

**Testing Cadence:** Run weekly on new model deployments, regression test on prod data monthly

---

### Online A/B Testing

**Experiment 1: Embedding Model**
- A: OpenAI text-embedding-3-small (current)
- B: Cohere embed-english-v3.0
- Metric: Match quality rating (user feedback)
- Traffic split: 90/10 (A/B)
- Duration: 2 weeks
- Decision: If B improves rating by >5%, switch

**Experiment 2: LLM Re-Ranking**
- A: Claude Sonnet (current)
- B: GPT-4 Turbo
- Metric: Connection conversion rate (requests sent after viewing match)
- Traffic split: 50/50
- Duration: 1 week
- Decision: If B improves conversion by >10%, switch

**Experiment 3: Match Count**
- A: Show top 8 matches (current)
- B: Show top 12 matches
- Metric: Time to first connection request
- Traffic split: 50/50
- Duration: 1 week
- Decision: If B reduces time by >20%, adopt

---

### Live Performance Tracking

**Real-Time Dashboards (PostHog):**
- Searches per day (target: 500+ by Month 2)
- Connection requests per day (target: 100+ by Month 2)
- Average match quality rating (target: 4.0/5.0)
- Search-to-request conversion (target: 15%)

**Alerting (Sentry + Custom):**
- API error rate >5% → Slack alert
- Search latency P95 >5s → Email alert
- Match quality rating <3.5 for 3 consecutive days → Escalate
- AI cost >$100/day → Slack alert

---

### User Feedback Collection

**In-App Surveys:**
- Post-search: "Were these matches relevant?" (Yes/No + comment)
- Post-connection: "Rate match quality" (1-5 stars + feedback)
- Weekly NPS: "How likely to recommend?" (0-10 + reason)

**Quarterly Deep Dives:**
- 10 user interviews (5 power users, 5 churned users)
- Questions: What worked? What frustrated you? What's missing?
- Synthesize themes, prioritize roadmap

---

## ⚠️ Risks & Mitigations

| RISK | IMPACT | PROBABILITY | MITIGATION |
|------|--------|-------------|------------|
| **Low user adoption** | High | Medium | Seed with 3 high-quality communities (100x, IISER, AI Club). Offer free Pro for first 3 months. |
| **Poor match quality (AI failure)** | High | Medium | Maintain golden dataset. A/B test models. Human-in-loop for first 1K matches. |
| **Privacy breach (data leak)** | Critical | Low | Implement Row-Level Security. Encrypt sensitive fields. Regular security audits. |
| **Community admin churn** | Medium | Medium | Provide excellent admin experience. Weekly engagement reports. Dedicated support. |
| **API cost explosion (AI)** | Medium | High | Cache LLM responses (24h TTL). Reduce max_tokens. Rate limit searches (10/hour free, unlimited Pro). |
| **LinkedIn scraper blocked** | Medium | High | Fallback to manual form. Add OAuth option. Use multiple Apify accounts. |
| **Cold start problem (no users)** | High | High | Manually onboard first 50 users per community. Admin invites via Slack/email. |
| **Scale bottleneck (database)** | Medium | Low | Index critical columns. Use connection pooling. Vertical scaling (upgrade Supabase tier). |

---

## 💰 Costs

### Development Costs

**One-Time:**
- Supabase setup + initial database design: $0 (free tier)
- Frontend development (Next.js): 40 hours @ $0 (Sriram)
- Backend development (Edge Functions): 30 hours @ $0 (Sriram)
- AI integration + testing: 20 hours @ $0 (Sriram)
- Design (Figma + implementation): 10 hours @ $0 (Sriram)
- **Total Development: $0** (solo founder, sweat equity)

**Recurring (Monthly):**
- Supabase (Pro tier): $25/month (after free tier)
- OpenAI (embeddings): ~$50/month (assuming 10K profiles + 5K searches)
- Claude API (matching): ~$100/month (assuming 5K searches, 20 profiles ranked each)
- Upstash Redis: $10/month (cache layer)
- Resend (emails): $20/month (up to 10K emails)
- Domain + hosting: $15/month
- **Total Operational (early stage): ~$220/month**

### Operational Costs (At Scale)

**Month 3 (10K users, 500 searches/day):**
- Supabase Pro: $25
- OpenAI: $150 (30K embeddings, 15K searches)
- Claude: $300 (15K searches × 20 profiles)
- Upstash: $10
- Resend: $20
- **Total: ~$505/month** | Revenue: ~$245 (5 paying communities) | **Net: -$260**

**Month 6 (50K users, 2K searches/day):**
- Supabase Team: $599
- OpenAI: $600 (150K embeddings, 60K searches)
- Claude: $1,200 (60K searches)
- Upstash Pro: $20
- Resend: $80
- **Total: ~$2,499/month** | Revenue: ~$5,000 (20 paying communities × 2 tiers) | **Net: +$2,501** (profitable!)

### Unit Economics

**Per Community (Pro - $49/month):**
- AI cost per active user: ~$2/month (10 searches/month)
- Average community size: 150 users
- Cost per community: $300/month (AI) + $50 (infra) = $350/month
- **Margin: -$301/month** (❌ unprofitable at Pro tier)

**Revised Pricing (after analysis):**
- Pro: $199/month (up to 300 members) → Margin: -$151
- Enterprise: $499/month (unlimited + white-label) → Margin: +$149 ✅

**Assumption:** We need Enterprise tier adoption for profitability, or reduce AI cost via caching.

---

## 🔗 Assumptions & Dependencies

### Assumptions

1. **User Behavior:**
   - Users will spend 3 minutes to complete profile (not 30 seconds)
   - Users will search before connecting (not browse randomly)
   - Users prefer privacy over public exposure (community-only default)
   - Users will provide honest feedback on match quality

2. **Community Dynamics:**
   - Communities have active admins who onboard members
   - Community size: 50-500 members (sweet spot for networking)
   - Communities will invite other communities (viral loop)

3. **Technical:**
   - OpenAI embeddings remain stable (no breaking API changes)
   - Claude Sonnet performance is sufficient (no need for Opus)
   - Supabase can scale to 100K users on Pro/Team tier
   - LinkedIn scraping remains feasible (Apify workarounds)

4. **Market:**
   - Cohort-based communities continue to grow (100x, YC, Reforge)
   - Privacy concerns drive adoption of community-only platforms
   - Users willing to pay $49/month for quality networking

5. **Business:**
   - 5% freemium-to-paid conversion rate is achievable
   - Enterprise customers exist (universities, accelerators)
   - Word-of-mouth is primary growth driver (not paid ads)

### Dependencies

**External Services:**
- Supabase: Database, auth, storage, edge functions
- OpenAI: Embeddings API
- Anthropic: Claude API (intent extraction, matching)
- Apify: LinkedIn scraping
- Resend: Transactional emails
- Upstash: Redis cache

**Internal:**
- Sriram's availability (solo founder, 100x cohort, IISER classes)
- Access to pilot communities (100x, IISER, AI Research Club)
- Time to iterate based on feedback (weekly sprints)

**Partnerships:**
- 100x Engineers (Sanjay Bhatia - warm intro)
- IISER Pune (E-Cell, AI Research Club - Sriram is founder)
- Other accelerators/cohorts (to be developed)

---

## 🔒 Compliance/Privacy/Legal

### Data Privacy Compliance

**GDPR (EU Users):**
- Right to access: Users can download all their data (JSON export)
- Right to erasure: Users can delete profile (30-day retention, then purged)
- Right to portability: Export profile + connections as JSON
- Consent: Clear ToS and Privacy Policy during signup (checkbox required)
- Data minimization: Only collect necessary data (no tracking pixels)

**CCPA (California Users):**
- Right to know: Show users what data we collect (Privacy Dashboard)
- Right to delete: Allow profile deletion (soft delete + 30-day grace period)
- Do not sell: We never sell user data to third parties (stated in Privacy Policy)

**India (Personal Data Protection Bill - pending):**
- Data localization: Store Indian users' data in AWS Mumbai region (Supabase)
- Consent: Clear privacy policy in English (Hindi translation planned)
- Data retention: Delete after 30 days of account closure

### Terms of Service

**Key Clauses:**
- Platform is for professional networking only (no dating, no spam, no harassment)
- Users own their profile data, we have license to process it for matching
- We can ban users who violate ToS (spam, harassment, fake profiles)
- No guarantee of finding matches (best effort service)
- Pricing can change with 30-day notice
- We're not liable for connections gone wrong (users connect at own risk)
- Dispute resolution: Arbitration in Bangalore, India

### Security Measures

**Data Protection:**
- Passwords hashed with bcrypt (Supabase Auth)
- API keys stored in environment variables (not in code)
- Row-Level Security (RLS) enforced on all tables
- Contact info only shared after mutual approval
- HTTPS enforced (TLS 1.3)

**Access Control:**
- User can only edit own profile
- User can only see profiles in own communities (unless public)
- Admin can only manage own community
- No superuser access (Supabase RLS prevents)

**Monitoring:**
- Sentry for error tracking
- Supabase logs for API access
- PostHog for user behavior (anonymous)
- Weekly security audits (manual review)

### Compliance Checklist

- [ ] Privacy Policy written (GDPR + CCPA compliant) → Legal review needed
- [ ] Terms of Service written (reviewed by lawyer) → Pending
- [ ] Cookie consent banner (EU users) → Implement in Week 2
- [ ] Data processing agreement (for enterprise customers) → Template ready
- [ ] Security audit (before accepting payments) → Schedule for Month 2
- [ ] PCI DSS compliance (use Stripe for payments, no card storage)

---

## 📣 GTM/Rollout Plan

### Phase 1: Private Beta (Week 1-2)

**Goal:** Validate problem-solution fit with 3 pilot communities.

**Activities:**
1. **Seed Communities:**
   - 100x Engineers C5 (Sanjay Bhatia - warm intro, 150 members)
   - IISER Pune (E-Cell + AI Research Club, 200 members)
   - Smaller cohort (TBD, 50 members)

2. **Onboarding:**
   - Personal Slack/WhatsApp message to each member
   - "Help me test this tool" (social capital, not sales pitch)
   - Offer: Free Pro access for 3 months (even after public launch)

3. **Engagement:**
   - Daily check-ins in community Slack channels
   - Answer questions within 1 hour
   - Weekly feedback call with 5 power users

**Success Metrics:**
- 300 signups (75% invite acceptance rate)
- 150 completed profiles (50% completion rate)
- 50 connection requests (1 request per 6 users)
- 10 positive testimonials

---

### Phase 2: Expand to 10 Communities (Week 3-4)

**Goal:** Prove viral loop - communities invite other communities.

**Activities:**
1. **Community Referrals:**
   - Ask admins of pilot communities: "Which other communities should we add?"
   - Offer: $50 Amazon gift card for successful referral (admin gets paid community)

2. **Targeted Outreach:**
   - Identify 20 cohort-based communities (YC batches, Reforge, On Deck, GDG)
   - Cold email to admins: "Built for communities like yours"
   - Offer: Free setup + 1 month Pro

3. **Product Improvements:**
   - Fix top 5 bugs reported in beta
   - Ship 2 most-requested features (e.g., mobile responsiveness, better filters)

**Success Metrics:**
- 10 communities live (7 referrals + 3 cold outreach)
- 2,000 users total
- 40% D7 retention
- 5 communities willing to pay $49/month (social proof)

---

### Phase 3: Public Launch (Month 2)

**Goal:** Generate awareness, drive organic signups.

**Activities:**
1. **Content Marketing:**
   - Launch blog post: "Why LinkedIn Doesn't Work for Private Communities"
   - Product Hunt launch (target: Top 5 Product of the Day)
   - LinkedIn posts from Sriram (3x per week) with user testimonials

2. **PR Outreach:**
   - Pitch to TechCrunch, YourStory, Inc42 (India startup press)
   - Angle: "Anti-LinkedIn for privacy-conscious professionals"
   - Target: 1 publication feature

3. **Community Webinars:**
   - Host 2 webinars: "How to Build a Networked Community"
   - Invite admins from target communities
   - Demo SuperNetworkAI at end (not sales pitch, just showcase)

**Success Metrics:**
- 50 communities, 10,000 users
- 5,000 website visitors/month (organic)
- 10 paying communities ($490 MRR)
- NPS ≥ 40

---

### Phase 4: Scale (Month 3-6)

**Goal:** Reach profitability, expand to 150 communities.

**Activities:**
1. **Sales Outreach:**
   - Hire 1 part-time SDR (contract) to email 500 community admins
   - Target: Universities, accelerators, corporate programs
   - Pitch: "Increase member engagement by 3x with AI-powered networking"

2. **Product-Led Growth:**
   - Invite-only signups (users can only join via community invite)
   - Each community gets custom invite page (branded)
   - Track which communities drive most invites (reward top referrers)

3. **Pricing Optimization:**
   - A/B test: $49 vs. $99 vs. $199 for Pro tier
   - Introduce Enterprise tier ($499/month, unlimited + white-label)
   - Offer annual discount (2 months free)

**Success Metrics:**
- 150 communities, 50,000 users
- $5K MRR (20 paying communities)
- 70% gross margin (profitable unit economics)
- 50% retention rate (communities don't churn)

---

## 🔧 Technical Debugging Guide

*Based on "The AI Agent Debugging Playbook for Full-Stack Applications"*

### Critical Error Patterns & Solutions

#### Error 1: Profile Embedding Generation Fails

**Symptoms:**
- User onboarding stuck at "Processing..." for >30 seconds
- Error in console: `OpenAI API timeout` or `Rate limit exceeded`

**Root Cause:**
- OpenAI API timeout (>30s)
- Rate limit hit (3 requests/min on free tier)
- Invalid API key or network issue

**Debug Steps:**
```javascript
// 1. Check API response
console.log('OpenAI Response:', embedding_response);
console.log('Status:', embedding_response.status);
console.log('Rate Limit Remaining:', embedding_response.headers['x-ratelimit-remaining']);

// 2. Verify API key
const testKey = await fetch('https://api.openai.com/v1/models', {
  headers: { 'Authorization': `Bearer ${OPENAI_KEY}` }
});
console.log('API Key Valid:', testKey.ok);

// 3. Check request payload
console.log('Input Text Length:', profile_text.length); // Should be <8K tokens
```

**Solutions:**
1. **Implement retry with exponential backoff:**
   ```javascript
   async function generateEmbeddingWithRetry(text, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         const embedding = await openai.embeddings.create({
           model: 'text-embedding-3-small',
           input: text,
         });
         return embedding.data[0].embedding;
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(r => setTimeout(r, 2 ** i * 1000)); // 1s, 2s, 4s
       }
     }
   }
   ```

2. **Cache embeddings if text hasn't changed:**
   ```sql
   -- Check if embedding exists for same text
   SELECT embedding FROM profile_embeddings 
   WHERE profile_id = $1 AND embedding_text_hash = md5($2);
   ```

3. **Use smaller model or reduce input size:**
   - Truncate profile text to 2000 chars (keeps cost low)
   - Use `text-embedding-3-small` instead of `large` (same quality, faster)

**Prevention:**
- Set up Sentry alert: `API_TIMEOUT` or `RATE_LIMIT_EXCEEDED`
- Monitor OpenAI dashboard for quota usage
- Add health check endpoint that tests OpenAI connection

---

#### Error 2: Semantic Search Returns No Results

**Symptoms:**
- User searches, sees "No matches found" (but matches should exist)
- Same query returns results in pgAdmin but not in app

**Root Cause:**
- Embedding not indexed (missing ivfflat index)
- Similarity threshold too high (>0.8)
- Vector dimension mismatch (1536 vs 768)

**Debug Steps:**
```sql
-- 1. Check if embedding exists
SELECT COUNT(*) FROM profile_embeddings WHERE profile_id = 'user-id';

-- 2. Test raw similarity query
SELECT 
  p.name,
  pe.embedding <=> '[0.1, 0.2, ...]'::vector AS similarity
FROM profile_embeddings pe
JOIN profiles p ON p.id = pe.profile_id
ORDER BY similarity ASC
LIMIT 10;

-- 3. Check index exists
\d profile_embeddings; -- Should show: ivfflat index on embedding

-- 4. Check dimensions
SELECT vector_dims(embedding) FROM profile_embeddings LIMIT 1; -- Should be 1536
```

**Solutions:**
1. **Lower similarity threshold:**
   ```javascript
   // Before: similarity < 0.8 (too strict)
   // After: similarity < 0.6 (more lenient)
   const matches = await supabase.rpc('match_profiles', {
     query_embedding: embedding,
     match_threshold: 0.6, // LOWERED
     match_count: 20
   });
   ```

2. **Regenerate embeddings for all profiles:**
   ```javascript
   // Edge function: regenerate_all_embeddings
   const profiles = await supabase.from('profiles').select('*');
   for (const profile of profiles) {
     const text = `${profile.name} ${profile.headline} ${profile.bio} ${profile.intent_text}`;
     const embedding = await generateEmbedding(text);
     await supabase.from('profile_embeddings').upsert({
       profile_id: profile.id,
       embedding,
       embedding_text: text
     });
   }
   ```

3. **Rebuild index:**
   ```sql
   REINDEX INDEX profile_embeddings_embedding_idx;
   ```

**Prevention:**
- Add monitoring: "Zero results" searches (alert if >10% of searches)
- Test with known query-profile pairs (golden dataset)
- Log similarity scores for debugging: `console.log('Top 5 similarities:', scores)`

---

#### Error 3: LLM Returns Invalid JSON

**Symptoms:**
- Match ranking fails with error: `Unexpected token < in JSON`
- Claude response contains markdown: ` ```json ... ``` `

**Root Cause:**
- LLM returns markdown-wrapped JSON despite prompt instructions
- Extra whitespace or newlines break JSON.parse()
- LLM hallucinates non-JSON text

**Debug Steps:**
```javascript
// 1. Log raw LLM response
console.log('Raw Claude Response:', claude_response.content[0].text);

// 2. Check for markdown
const hasMarkdown = response.includes('```');
console.log('Contains Markdown:', hasMarkdown);

// 3. Try parsing
try {
  JSON.parse(response);
} catch (error) {
  console.error('JSON Parse Error:', error.message);
  console.error('Problematic Text:', response.substring(0, 200));
}
```

**Solutions:**
1. **Strip markdown before parsing:**
   ```javascript
   function parseJSONResponse(responseText) {
     // Remove markdown code blocks
     let cleaned = responseText
       .replace(/```json\n?/g, '')
       .replace(/```\n?/g, '')
       .trim();
     
     // Remove leading/trailing whitespace
     cleaned = cleaned.trim();
     
     // Parse
     try {
       return JSON.parse(cleaned);
     } catch (error) {
       console.error('Failed to parse JSON:', cleaned);
       throw new Error(`Invalid JSON response: ${error.message}`);
     }
   }
   ```

2. **Improve prompt to force valid JSON:**
   ```javascript
   const prompt = `
   CRITICAL: Your response must be ONLY valid JSON. No markdown. No explanations. No code blocks.
   
   Start your response with { and end with }. Nothing else.
   
   Example valid response:
   {"match_score": 95, "explanation": "..."}
   
   Now, analyze this profile and respond ONLY with JSON:
   ${profile_data}
   `;
   ```

3. **Add fallback model:**
   ```javascript
   async function rankMatches(profiles) {
     try {
       return await rankWithClaude(profiles);
     } catch (error) {
       console.warn('Claude failed, trying GPT-4:', error);
       return await rankWithGPT4(profiles); // Fallback
     }
   }
   ```

**Prevention:**
- Add JSON schema validation before saving results
- Test prompts with 10+ samples before deploying
- Set up alert: `JSON_PARSE_ERROR` in Sentry

---

#### Error 4: LinkedIn Scraping Fails

**Symptoms:**
- User pastes LinkedIn URL, gets "Failed to import profile"
- Apify actor returns empty result or error

**Root Cause:**
- LinkedIn blocked Apify's IP (anti-bot measures)
- Invalid URL format (e.g., `/company/` instead of `/in/`)
- User profile is private or doesn't exist

**Debug Steps:**
```javascript
// 1. Check Apify logs
console.log('Apify Run ID:', apify_run_id);
// Visit: https://console.apify.com/actors/runs/{run_id}

// 2. Validate URL format
const isValidLinkedInURL = (url) => {
  return url.includes('linkedin.com/in/') && !url.includes('/company/');
};
console.log('Valid URL:', isValidLinkedInURL(user_input));

// 3. Test with known working URL
const testURL = 'https://www.linkedin.com/in/williamhgates/';
const testResult = await scrapeLinkedIn(testURL);
console.log('Test Result:', testResult);
```

**Solutions:**
1. **Show helpful error + fallback to manual form:**
   ```javascript
   try {
     const profile = await scrapeLinkedIn(linkedinURL);
     return profile;
   } catch (error) {
     console.error('LinkedIn scraping failed:', error);
     
     // Show user-friendly error
     return {
       error: true,
       message: 'LinkedIn import failed. Please fill your profile manually.',
       fallback: 'manual_form'
     };
   }
   ```

2. **Use OAuth instead of URL scraping (long-term):**
   - Integrate LinkedIn OAuth API (official, more reliable)
   - Request scopes: `r_basicprofile`, `r_emailaddress`
   - Exchange token for profile data

3. **Retry with different Apify account:**
   - Rotate between 3 Apify accounts (less likely to be blocked)
   - Use residential proxies (Apify option)

**Prevention:**
- Add URL validation before calling Apify
- Monitor scraping success rate (alert if <80%)
- Have manual form as always-available fallback

---

#### Error 5: Supabase RLS Policy Blocks User's Own Data

**Symptoms:**
- User can't see their own profile after signup
- API returns empty array for query that should return data
- Works in Supabase dashboard (admin) but not in app (user)

**Root Cause:**
- Row-Level Security (RLS) policy too restrictive
- Policy uses `auth.uid()` but user token is invalid/expired
- Policy logic error (e.g., `AND` instead of `OR`)

**Debug Steps:**
```sql
-- 1. Check RLS policies
\d profiles; -- Look for POLICIES section

-- 2. Test query as authenticated user
SET ROLE authenticated;
SET request.jwt.claims.sub = 'user-uuid-here';
SELECT * FROM profiles WHERE user_id = 'user-uuid-here';

-- 3. Check auth.uid() returns correct UUID
SELECT auth.uid(); -- Should match user's ID

-- 4. Test policy logic
SELECT * FROM profiles WHERE (
  user_id = auth.uid() OR -- Can see own profile
  visibility = 'public' -- Can see public profiles
);
```

**Solutions:**
1. **Fix RLS policy to explicitly allow `user_id = auth.uid()`:**
   ```sql
   -- Before (wrong):
   CREATE POLICY profiles_select ON profiles FOR SELECT
   USING (visibility = 'public');
   
   -- After (correct):
   CREATE POLICY profiles_select ON profiles FOR SELECT
   USING (
     user_id = auth.uid() OR -- User can ALWAYS see own profile
     visibility = 'public' OR
     EXISTS (
       SELECT 1 FROM community_members cm
       WHERE cm.community_id = profiles.community_id
       AND cm.user_id = auth.uid()
     )
   );
   ```

2. **Debug auth token in app:**
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('User ID from token:', session?.user?.id);
   console.log('Token expires at:', session?.expires_at);
   
   // Refresh if expired
   if (session?.expires_at && Date.now() > session.expires_at * 1000) {
     await supabase.auth.refreshSession();
   }
   ```

3. **Test RLS with actual user tokens (not admin):**
   ```javascript
   // Test script: test_rls.js
   const { createClient } = require('@supabase/supabase-js');
   
   const supabase = createClient(SUPABASE_URL, ANON_KEY); // Use anon key, not service key
   await supabase.auth.signInWithPassword({ email: 'test@example.com', password: 'password' });
   
   const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId);
   console.log('Data:', data); // Should return user's own profile
   console.log('Error:', error); // Should be null
   ```

**Prevention:**
- Always test RLS policies with non-admin users before deploying
- Use Supabase's "View as" feature (impersonate user in dashboard)
- Add E2E tests that cover RLS scenarios

---

### Performance Optimization Tips

#### Slow Search (>5 seconds)

**Diagnosis:**
```sql
-- Enable slow query log in Supabase dashboard
-- Check which queries take >1s

-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM profile_embeddings
WHERE embedding <=> '[...]'::vector
ORDER BY embedding <=> '[...]'::vector
LIMIT 20;
```

**Solutions:**
1. **Add indexes on filtered columns:**
   ```sql
   CREATE INDEX idx_profiles_location ON profiles(location);
   CREATE INDEX idx_profiles_experience ON profiles(experience_level);
   ```

2. **Cache popular searches in Redis (1 hour TTL):**
   ```javascript
   const cacheKey = `search:${md5(query)}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   
   const results = await searchProfiles(query);
   await redis.setex(cacheKey, 3600, JSON.stringify(results));
   return results;
   ```

3. **Limit LLM re-ranking to top 20 (not 50):**
   - Reduces Claude API latency from 5s to 2s
   - Users don't scroll past 20 anyway

---

#### High AI Costs (>$100/day)

**Diagnosis:**
- Check OpenAI dashboard: Token usage per request
- Check Claude dashboard: Number of API calls

**Solutions:**
1. **Cache LLM responses for 24 hours:**
   ```javascript
   const cacheKey = `match_rank:${searcherId}:${queryHash}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   
   const ranked = await rankWithClaude(profiles);
   await redis.setex(cacheKey, 86400, JSON.stringify(ranked)); // 24h TTL
   return ranked;
   ```

2. **Reduce max_tokens from 1000 to 500:**
   - Match explanations don't need to be long
   - 500 tokens = ~2 sentences per match

3. **Use cheaper model for simple tasks:**
   - Intent extraction: Claude Haiku ($0.25/MTok vs $3/MTok Sonnet)
   - Match ranking: Sonnet (keep for quality)

4. **Batch process:**
   ```javascript
   // Instead of 5 separate API calls for 5 profiles:
   await claude.analyze(profile1);
   await claude.analyze(profile2);
   await claude.analyze(profile3);
   // ...
   
   // Batch into 1 API call:
   await claude.analyzeMultiple([profile1, profile2, profile3, profile4, profile5]);
   ```

---

### Monitoring & Alerts

**Set up alerts for:**
- API error rate >5% → Slack alert (Sentry)
- Search response time >3s → Email alert (PostHog)
- AI cost >$100/day → Slack alert (OpenAI dashboard webhook)
- Database connections >80% → Email alert (Supabase metrics)
- User signups drop >50% (compared to 7-day average) → Email alert (PostHog)

**Key metrics to dashboard:**
- Signups per day (trend chart)
- Searches per day (trend chart)
- Connection requests per day (trend chart)
- Average match quality rating (gauge)
- D7 retention rate (%)
- API error rate (%)
- P95 search latency (ms)

---

## ✅ APPENDIX: Quick Reference

### Key Product Metrics

| METRIC | TARGET | CURRENT | STATUS |
|--------|--------|---------|--------|
| Communities | 10 (Month 1) | TBD | 🟡 |
| Users | 2,000 (Month 1) | TBD | 🟡 |
| Profile completion | 60% | TBD | 🟡 |
| D7 retention | 40% | TBD | 🟡 |
| Match quality rating | 4.0/5.0 | TBD | 🟡 |
| Paying communities | 5 (Month 2) | TBD | 🟡 |

---

### Development Checklist

**Week 1:**
- [ ] Supabase project setup + database schema
- [ ] Authentication (email signup, login, logout)
- [ ] Onboarding flow (7 steps, LinkedIn import, intent capture)
- [ ] Profile embedding generation (OpenAI)
- [ ] Basic search (semantic vector search)

**Week 2:**
- [ ] AI match ranking (Claude Sonnet)
- [ ] Connection request flow (request, approve, decline)
- [ ] Community management (create, invite, analytics)
- [ ] Privacy settings (visibility controls)
- [ ] Deploy to production (Vercel + Supabase)

**Week 3:**
- [ ] Bug fixes from pilot feedback
- [ ] Performance optimization (caching, indexing)
- [ ] Email notifications (Resend)
- [ ] Mobile responsive design
- [ ] Public launch prep (landing page, blog post)

---

## 📞 CONTACT & FEEDBACK

**Product Owner:** Sriram Kintada  
**Email:** [Your Email]  
**Project Status:** https://github.com/sriram/supernetworkai  
**Feedback Form:** https://forms.gle/...

---

**Document Version:** 2.0 (Optimized)  
**Last Updated:** October 26, 2025  
**Next Review:** November 10, 2025

---

*This PRD is a living document and will be updated as the product evolves. All stakeholders are encouraged to provide feedback and suggestions.*

**END OF PRD**
