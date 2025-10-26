-- ============================================================================
-- SuperNetworkAI - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create all core tables for SuperNetworkAI
-- Created: 2025-10-26
-- ============================================================================

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- TABLE: profiles
-- Description: User profiles with intent, skills, and visibility settings
-- ============================================================================

CREATE TABLE profiles (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  headline TEXT, -- e.g., "AI Engineer at Stripe"
  bio TEXT, -- 500 char max
  location TEXT,

  -- Social Links
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  portfolio_url TEXT,

  -- Intent (CRITICAL for matching)
  intent_text TEXT NOT NULL DEFAULT '', -- Free-form: "Looking for technical cofounder..."
  intent_structured JSONB, -- AI-extracted: {looking_for: ["cofounder"], skills_needed: ["RAG"]}

  -- Professional Info
  current_role TEXT,
  current_company TEXT,
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'executive')),

  -- Skills & Interests
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',

  -- Privacy Settings
  visibility TEXT CHECK (visibility IN ('public', 'private', 'community_only')) DEFAULT 'community_only',
  show_in_search BOOLEAN DEFAULT true,
  allow_connection_requests BOOLEAN DEFAULT true,

  -- Metadata
  profile_complete BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_visibility ON profiles(visibility);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_last_active ON profiles(last_active_at DESC);
CREATE INDEX idx_profiles_search ON profiles(location, visibility) WHERE show_in_search = true;

-- ============================================================================
-- TABLE: profile_embeddings
-- Description: Vector embeddings for semantic search (1536 dimensions)
-- ============================================================================

CREATE TABLE profile_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Vector embedding (1536 dimensions for OpenAI text-embedding-3-small)
  embedding VECTOR(1536) NOT NULL,

  -- Source text used for embedding
  embedding_text TEXT NOT NULL,
  embedding_text_hash TEXT NOT NULL, -- md5 hash for cache invalidation

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ CRITICAL: IVFFlat index for fast similarity search
-- lists = sqrt(total_rows) is recommended
-- Starting with 100, will tune based on data size
CREATE INDEX idx_profile_embeddings_vector
  ON profile_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_profile_embeddings_profile_id ON profile_embeddings(profile_id);

-- ============================================================================
-- TABLE: communities
-- Description: Community metadata, settings, and limits
-- ============================================================================

CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,

  -- Type & Access
  type TEXT CHECK (type IN ('public', 'private')) DEFAULT 'private',
  invite_code TEXT UNIQUE, -- For joining
  require_approval BOOLEAN DEFAULT false,

  -- Admin
  created_by UUID REFERENCES auth.users(id) NOT NULL,

  -- Pricing & Limits
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  member_limit INT DEFAULT 100,

  -- Settings
  settings JSONB DEFAULT '{
    "allow_public_profiles": false,
    "allow_external_connections": true,
    "moderation_enabled": false,
    "auto_approve_members": true
  }'::jsonb,

  -- Metadata
  member_count INT DEFAULT 0,
  active_member_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communities_type ON communities(type);
CREATE INDEX idx_communities_created_by ON communities(created_by);
CREATE INDEX idx_communities_invite_code ON communities(invite_code) WHERE invite_code IS NOT NULL;

-- ============================================================================
-- TABLE: community_members
-- Description: User-community relationships with roles and status
-- ============================================================================

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Role & Status
  role TEXT CHECK (role IN ('member', 'moderator', 'admin')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active', 'pending', 'banned')) DEFAULT 'active',

  -- Privacy
  visible_in_community BOOLEAN DEFAULT true,

  -- Metadata
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_community_members_active ON community_members(community_id, status) WHERE status = 'active';

-- ============================================================================
-- TABLE: connections
-- Description: Connection requests between users
-- ============================================================================

CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations (always store user1 < user2 for uniqueness)
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')) DEFAULT 'pending',

  -- Who initiated
  initiated_by UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(user_id_1, user_id_2),
  CHECK (user_id_1 < user_id_2)
);

CREATE INDEX idx_connections_user1 ON connections(user_id_1);
CREATE INDEX idx_connections_user2 ON connections(user_id_2);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_pending ON connections(user_id_2, status) WHERE status = 'pending';

-- ============================================================================
-- TABLE: messages
-- Description: Direct messages between connected users
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content
  content TEXT NOT NULL,

  -- Status
  read_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_unread ON messages(recipient_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);

-- ============================================================================
-- TABLE: notifications
-- Description: In-app notifications for users
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Content
  type TEXT CHECK (type IN (
    'connection_request',
    'connection_accepted',
    'new_message',
    'new_match',
    'join_request_approved'
  )) NOT NULL,

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,

  -- Related
  related_user_id UUID REFERENCES auth.users(id),
  related_community_id UUID REFERENCES communities(id),

  -- Status
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- ============================================================================
-- TABLE: match_scores (Cache)
-- Description: Cached AI-generated match scores (24h TTL)
-- ============================================================================

CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  match_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Match Quality
  score DECIMAL(3, 2) NOT NULL CHECK (score >= 0 AND score <= 1),

  -- AI Explanation
  explanation JSONB,

  -- Cache expiry
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),

  UNIQUE(user_id, match_user_id)
);

CREATE INDEX idx_match_scores_user ON match_scores(user_id);
CREATE INDEX idx_match_scores_expires ON match_scores(expires_at);

-- ============================================================================
-- TABLE: search_logs (Analytics)
-- Description: Track search queries for analytics
-- ============================================================================

CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  query TEXT NOT NULL,
  filters JSONB,
  results_count INT NOT NULL,
  top_result_id UUID REFERENCES profiles(id),
  clicked_result_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_user ON search_logs(user_id);
CREATE INDEX idx_search_logs_created_at ON search_logs(created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles with intent, skills, and visibility settings';
COMMENT ON TABLE profile_embeddings IS 'Vector embeddings for semantic profile search';
COMMENT ON TABLE communities IS 'Community metadata and settings';
COMMENT ON TABLE community_members IS 'User-community membership relationships';
COMMENT ON TABLE connections IS 'Connection requests between users';
COMMENT ON TABLE messages IS 'Direct messages between connected users';
COMMENT ON TABLE notifications IS 'In-app notifications';
COMMENT ON TABLE match_scores IS 'Cached AI-generated match scores';
COMMENT ON TABLE search_logs IS 'Search query analytics';

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================
