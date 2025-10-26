# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SuperNetworkAI** is an AI-powered networking platform built with Next.js that helps professionals find cofounders, advisors, clients, and teammates through intelligent matching. The platform features a community-first privacy model where members can control profile visibility across private communities.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build production bundle
npm start            # Start production server
npm run lint         # Run ESLint checks
```

### Prerequisites
- Node.js (v18+)
- npm/pnpm/yarn/bun
- No backend setup required yet (Supabase integration pending)

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 16.0.0 (App Router)
- **UI Components:** Radix UI primitives + shadcn/ui
- **Styling:** Tailwind CSS 4.x with custom design system
- **Forms:** React Hook Form + Zod validation
- **Analytics:** Vercel Analytics
- **Planned Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)

### Design System
Custom color palette centered on:
- **Primary:** Forest Green (#1b4332) - professional, trustworthy
- **Secondary:** Warm Amber (#f77f00) - engaging, energetic
- **Background:** Cream (#fffbf0) - warm, welcoming
- CSS variables defined in `app/globals.css`

### Project Structure

```
app/
├── (auth)/
│   ├── login/         # Authentication pages
│   ├── signup/
│   └── onboarding/    # Multi-step user setup
├── dashboard/         # Main user dashboard
├── search/            # User search with filters
├── communities/       # Community browsing and management
│   ├── [id]/         # Dynamic community pages
│   │   ├── members/
│   │   └── settings/
│   ├── create/
│   └── join/
├── connections/       # User connections list
├── messages/          # Direct messaging
│   └── [id]/         # Conversation threads
├── profile/[id]/      # User profiles
├── settings/          # User settings
│   ├── profile/
│   ├── privacy/
│   └── communities/
├── admin/             # Admin panel
│   ├── users/
│   └── moderation/
└── layout.tsx         # Root layout with fonts

components/
├── ui/               # Reusable UI primitives (shadcn/ui)
├── header.tsx        # Landing page header
├── footer.tsx        # Landing page footer
├── sidebar.tsx       # App navigation sidebar
├── admin-sidebar.tsx # Admin navigation
├── match-card.tsx    # User match display
├── community-card.tsx # Community display
└── onboarding-steps.tsx # Multi-step onboarding

lib/
└── utils.ts          # Utility functions (cn helper)
```

## Key Implementation Patterns

### Routing
- Uses Next.js App Router with file-based routing
- Dynamic routes: `[id]` for communities, profiles, messages
- Route groups for organization (no URL impact)

### Component Architecture
- **"use client"** directive for interactive components (Sidebar, forms)
- Server components by default for better performance
- Loading states via `loading.tsx` files (search, messages, communities)

### Styling
- Utility-first with Tailwind CSS
- `cn()` helper in `lib/utils.ts` for conditional classes
- Custom CSS variables for theming (light/dark mode ready)
- Consistent spacing and component variants via `class-variance-authority`

### State Management
- Local state with React hooks (useState)
- No global state library yet (consider Zustand/Jotai when needed)
- URL state for filters/pagination via searchParams

### Forms
- React Hook Form for form state
- Zod schemas for validation (see package.json dependencies)
- Radix UI components for accessible form primitives

## Important Reference Files

Located in `important_reference_files/`:

1. **SuperNetworkAI_PRD.md** - Complete product requirements document
   - User personas and journeys
   - Feature specifications
   - Business model and KPIs
   - Privacy and security requirements

2. **SuperNetworkAI_TDD_Complete.md** - Technical design document
   - Database schema (Supabase/PostgreSQL)
   - API specifications
   - AI/LLM integration architecture (Claude Sonnet 4, OpenAI embeddings)
   - Authentication flows
   - Caching strategy (Redis/Upstash)
   - Deployment guide

**CRITICAL:** Always reference these documents when implementing new features or making architectural decisions. They contain the source of truth for product behavior and technical implementation.

## Code Style Guidelines

### TypeScript
- Strict mode enabled
- Use type inference where obvious
- Explicit types for function parameters and return values
- Prefer interfaces for object shapes

### Components
- Functional components with TypeScript
- Props interfaces defined inline or exported
- Keep components focused and composable
- Extract reusable logic to custom hooks

### Naming Conventions
- Components: PascalCase (e.g., `MatchCard.tsx`)
- Files: kebab-case for utilities, PascalCase for components
- CSS variables: kebab-case with `--` prefix
- Functions: camelCase

## Development Workflow

### Adding New Pages
1. Create page in appropriate `app/` directory
2. Use `page.tsx` for route, `layout.tsx` for shared layouts
3. Add loading/error states with `loading.tsx`/`error.tsx`
4. Update sidebar navigation if needed

### Adding UI Components
1. Check if Radix UI primitive exists in package.json
2. Create in `components/ui/` following shadcn/ui patterns
3. Use design system variables from `globals.css`
4. Export from component file directly (no barrel exports yet)

### Working with Forms
1. Define Zod schema for validation
2. Use `useForm` with `@hookform/resolvers/zod`
3. Wrap Radix UI components with Controller if needed
4. Handle submission with try/catch for API calls

## Backend Integration (Planned)

### Supabase Setup
- PostgreSQL database with pgvector for embeddings
- Row Level Security (RLS) for data access control
- Edge Functions for API logic (Deno runtime)
- Auth with JWT and OAuth providers

### API Architecture
- Edge Functions for:
  - AI matching (Claude Sonnet 4)
  - Profile enrichment (LinkedIn scraping via Apify)
  - Search with vector similarity (pgvector)
  - Real-time messaging (Supabase Realtime)

### Key Entities
- Users (profiles, intents, skills)
- Communities (private networks)
- Matches (AI-generated with explanations)
- Messages (direct conversations)
- Connections (mutual relationships)

See TDD document for complete database schema and API endpoints.

## Common Gotchas

1. **Tailwind CSS v4:** Uses new `@import` syntax, not PostCSS plugins
2. **Fonts:** Geist (sans) and Lora (serif) loaded via next/font
3. **No Backend Yet:** All data is currently mocked client-side
4. **Sidebar Behavior:** Fixed on desktop, overlay on mobile with backdrop
5. **Route Protection:** Authentication guards not implemented yet

## Testing Strategy

### Current State
- No tests yet (MVP phase)

### Planned
- Unit tests: Vitest for utilities and hooks
- Integration tests: Testing Library for components
- E2E tests: Playwright for critical flows
- API tests: Deno test for Edge Functions

## Deployment

### Vercel (Primary)
- Automatic deployments on push to main
- Preview deployments for PRs
- Environment variables in Vercel dashboard

### Environment Variables (When Backend Added)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
OPENAI_API_KEY
APIFY_API_KEY
RESEND_API_KEY
```

## AI/LLM Integration Notes

### Matching Algorithm
- Claude Sonnet 4 for generating match explanations
- Embeddings: OpenAI text-embedding-3-small (1536d)
- Vector search: pgvector with cosine similarity
- Hybrid scoring: vector similarity + structured filters

### Profile Enrichment
- LinkedIn import via Apify actors
- AI extraction of skills, intents, and interests
- Privacy controls per profile field

### Search
- Natural language queries: "technical cofounder who knows RAG"
- Semantic search via embeddings
- Fallback to keyword search (PostgreSQL full-text search)

Refer to TDD Section 5 for complete AI integration details.

## Analytics & Monitoring

- **Analytics:** Vercel Analytics (integrated)
- **Planned:** PostHog for product analytics
- **Errors:** Sentry (to be added)
- **Performance:** Web Vitals via Vercel

## Browser Support

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (tested on iOS/Android)
- Progressive enhancement approach

## License & Credits

- Built with v0.dev (AI-assisted design)
- shadcn/ui for component patterns
- Radix UI for accessible primitives
