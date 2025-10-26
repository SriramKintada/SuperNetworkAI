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
-- ============================================================================
-- SuperNetworkAI - Row-Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- Description: Enable RLS and create security policies for all tables
-- Created: 2025-10-26
--
-- ⚠️ CRITICAL: RLS policies are the #1 source of silent failures
-- Always test with actual user tokens, not admin role
-- Reference: AI Agent Debugging Playbook Error #1
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Users can ALWAYS read their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can read profiles based on visibility settings
CREATE POLICY profiles_select_visibility ON profiles
  FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    OR user_id = auth.uid()
    OR (
      visibility = 'community_only'
      AND EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.user_id = auth.uid()
        AND cm.community_id IN (
          SELECT community_id FROM community_members
          WHERE user_id = profiles.user_id
          AND status = 'active'
        )
        AND cm.status = 'active'
      )
    )
  );

-- Users can UPDATE their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can DELETE their own profile
CREATE POLICY profiles_delete_own ON profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can INSERT their own profile (for manual creation, trigger handles auto-creation)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- PROFILE_EMBEDDINGS RLS POLICIES
-- ============================================================================

-- Users can read embeddings for profiles they can see
CREATE POLICY profile_embeddings_select ON profile_embeddings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND (
        profiles.user_id = auth.uid()
        OR profiles.visibility = 'public'
        OR (
          profiles.visibility = 'community_only'
          AND EXISTS (
            SELECT 1 FROM community_members cm
            WHERE cm.user_id = auth.uid()
            AND cm.community_id IN (
              SELECT community_id FROM community_members
              WHERE user_id = profiles.user_id
              AND status = 'active'
            )
            AND cm.status = 'active'
          )
        )
      )
    )
  );

-- Service role can insert/update/delete embeddings (handled by Edge Functions)
CREATE POLICY profile_embeddings_insert ON profile_embeddings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY profile_embeddings_update ON profile_embeddings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY profile_embeddings_delete ON profile_embeddings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_embeddings.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COMMUNITIES RLS POLICIES
-- ============================================================================

-- Anyone can read public communities
CREATE POLICY communities_select_public ON communities
  FOR SELECT
  TO authenticated
  USING (type = 'public');

-- Members can read their communities (including private)
CREATE POLICY communities_select_member ON communities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_members
      WHERE community_id = communities.id
      AND user_id = auth.uid()
      AND status = 'active'
    )
  );

-- Admins can update their community
CREATE POLICY communities_update_admin ON communities
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Admins can delete their community
CREATE POLICY communities_delete_admin ON communities
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Authenticated users can create communities
CREATE POLICY communities_insert ON communities
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ============================================================================
-- COMMUNITY_MEMBERS RLS POLICIES
-- ============================================================================

-- Users can see members of communities they belong to
CREATE POLICY community_members_select ON community_members
  FOR SELECT
  TO authenticated
  USING (
    -- Can see own memberships
    user_id = auth.uid()
    OR
    -- Can see members of communities user belongs to
    EXISTS (
      SELECT 1 FROM community_members cm
      WHERE cm.community_id = community_members.community_id
      AND cm.user_id = auth.uid()
      AND cm.status = 'active'
    )
  );

-- Users can insert themselves as members (joining)
CREATE POLICY community_members_insert ON community_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own membership
CREATE POLICY community_members_update_own ON community_members
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any member in their community
CREATE POLICY community_members_update_admin ON community_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.created_by = auth.uid()
    )
  );

-- Users can delete (leave) their own membership
CREATE POLICY community_members_delete_own ON community_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can delete (remove) members from their community
CREATE POLICY community_members_delete_admin ON community_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE communities.id = community_members.community_id
      AND communities.created_by = auth.uid()
    )
  );

-- ============================================================================
-- CONNECTIONS RLS POLICIES
-- ============================================================================

-- Users can see connections they're part of
CREATE POLICY connections_select_own ON connections
  FOR SELECT
  TO authenticated
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- Users can create connections (send requests)
CREATE POLICY connections_insert ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (initiated_by = auth.uid());

-- Users can update connections they're part of (accept/decline)
CREATE POLICY connections_update_own ON connections
  FOR UPDATE
  TO authenticated
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
  WITH CHECK (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- Users can delete connections they're part of
CREATE POLICY connections_delete_own ON connections
  FOR DELETE
  TO authenticated
  USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- ============================================================================
-- MESSAGES RLS POLICIES
-- ============================================================================

-- Users can see messages they sent or received
CREATE POLICY messages_select_own ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Users can send messages
CREATE POLICY messages_insert ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Users can update messages they received (mark as read)
CREATE POLICY messages_update_recipient ON messages
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Users can delete messages they sent or received
CREATE POLICY messages_delete_own ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- ============================================================================
-- MATCH_SCORES RLS POLICIES
-- ============================================================================

-- Users can see match scores for themselves
CREATE POLICY match_scores_select_own ON match_scores
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert/update match scores (handled by Edge Functions)
CREATE POLICY match_scores_insert ON match_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY match_scores_update ON match_scores
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY match_scores_delete ON match_scores
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS RLS POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can create notifications for users
CREATE POLICY notifications_insert ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow insertion from Edge Functions

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- SEARCH_LOGS RLS POLICIES
-- ============================================================================

-- Users can see their own search logs
CREATE POLICY search_logs_select_own ON search_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own search logs
CREATE POLICY search_logs_insert ON search_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TESTING NOTES
-- ============================================================================

-- To test RLS policies as a specific user:
-- SET ROLE authenticated;
-- SET request.jwt.claims.sub = 'user-uuid-here';
-- SELECT * FROM profiles WHERE user_id = 'user-uuid-here';

-- To check auth.uid():
-- SELECT auth.uid();

-- To reset to service role:
-- RESET ROLE;

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================
-- ============================================================================
-- SuperNetworkAI - Database Functions & Triggers
-- Migration: 003_functions_triggers.sql
-- Description: Create functions and triggers for automation
-- Created: 2025-10-26
-- ============================================================================

-- ============================================================================
-- FUNCTION: handle_new_user
-- Description: Auto-create profile when new user signs up
-- Trigger: AFTER INSERT ON auth.users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, intent_text)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    '' -- Empty intent text, will be filled during onboarding
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-create profile when user signs up';

-- ============================================================================
-- FUNCTION: update_community_member_count
-- Description: Update community member count when members join/leave
-- Trigger: AFTER INSERT OR DELETE ON community_members
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;

    -- Update active member count if status is active
    IF NEW.status = 'active' THEN
      UPDATE communities
      SET active_member_count = active_member_count + 1
      WHERE id = NEW.community_id;
    END IF;

  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;

    -- Update active member count if status was active
    IF OLD.status = 'active' THEN
      UPDATE communities
      SET active_member_count = active_member_count - 1
      WHERE id = OLD.community_id;
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'active' AND OLD.status != 'active' THEN
        UPDATE communities
        SET active_member_count = active_member_count + 1
        WHERE id = NEW.community_id;
      ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
        UPDATE communities
        SET active_member_count = active_member_count - 1
        WHERE id = NEW.community_id;
      END IF;
    END IF;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on community_members
CREATE TRIGGER community_member_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF status ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_member_count();

COMMENT ON FUNCTION public.update_community_member_count() IS 'Update community member count on member join/leave';

-- ============================================================================
-- FUNCTION: update_updated_at
-- Description: Auto-update updated_at timestamp on row modification
-- Trigger: BEFORE UPDATE on tables with updated_at column
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER profile_embeddings_updated_at
  BEFORE UPDATE ON profile_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER communities_updated_at
  BEFORE UPDATE ON communities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

COMMENT ON FUNCTION public.update_updated_at() IS 'Auto-update updated_at timestamp';

-- ============================================================================
-- FUNCTION: normalize_connection_users
-- Description: Ensure user_id_1 < user_id_2 for connections (prevents duplicates)
-- Trigger: BEFORE INSERT ON connections
-- ============================================================================

CREATE OR REPLACE FUNCTION public.normalize_connection_users()
RETURNS TRIGGER AS $$
DECLARE
  temp_id UUID;
BEGIN
  -- Swap if user_id_1 > user_id_2
  IF NEW.user_id_1 > NEW.user_id_2 THEN
    temp_id := NEW.user_id_1;
    NEW.user_id_1 := NEW.user_id_2;
    NEW.user_id_2 := temp_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on connections
CREATE TRIGGER normalize_connection_users_trigger
  BEFORE INSERT ON connections
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_connection_users();

COMMENT ON FUNCTION public.normalize_connection_users() IS 'Ensure user_id_1 < user_id_2 in connections';

-- ============================================================================
-- FUNCTION: match_profiles (Vector Similarity Search)
-- Description: Search profiles using vector similarity (for Phase 3)
-- Usage: SELECT * FROM match_profiles(query_embedding, threshold, count)
-- ============================================================================

CREATE OR REPLACE FUNCTION match_profiles(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  photo_url TEXT,
  intent_text TEXT,
  skills TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.user_id,
    p.name,
    p.headline,
    p.bio,
    p.location,
    p.photo_url,
    p.intent_text,
    p.skills,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM profile_embeddings pe
  JOIN profiles p ON p.id = pe.profile_id
  WHERE
    1 - (pe.embedding <=> query_embedding) > match_threshold
    AND p.show_in_search = true
    AND p.visibility IN ('public', 'community_only')
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_profiles(VECTOR, FLOAT, INT) IS 'Vector similarity search for profile matching';

-- ============================================================================
-- FUNCTION: get_user_connections
-- Description: Get all connections for a user (accepted connections only)
-- Usage: SELECT * FROM get_user_connections(user_id)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_connections(target_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  connected_user_id UUID,
  connected_user_name TEXT,
  connected_user_headline TEXT,
  connected_user_photo TEXT,
  connected_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS connection_id,
    CASE
      WHEN c.user_id_1 = target_user_id THEN c.user_id_2
      ELSE c.user_id_1
    END AS connected_user_id,
    p.name AS connected_user_name,
    p.headline AS connected_user_headline,
    p.photo_url AS connected_user_photo,
    c.accepted_at AS connected_at
  FROM connections c
  JOIN profiles p ON p.user_id = CASE
    WHEN c.user_id_1 = target_user_id THEN c.user_id_2
    ELSE c.user_id_1
  END
  WHERE
    (c.user_id_1 = target_user_id OR c.user_id_2 = target_user_id)
    AND c.status = 'accepted'
  ORDER BY c.accepted_at DESC;
END;
$$;

COMMENT ON FUNCTION get_user_connections(UUID) IS 'Get all accepted connections for a user';

-- ============================================================================
-- FUNCTION: get_pending_connection_requests
-- Description: Get pending connection requests received by a user
-- Usage: SELECT * FROM get_pending_connection_requests(user_id)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_connection_requests(target_user_id UUID)
RETURNS TABLE (
  connection_id UUID,
  requester_id UUID,
  requester_name TEXT,
  requester_headline TEXT,
  requester_photo TEXT,
  message TEXT,
  requested_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS connection_id,
    c.initiated_by AS requester_id,
    p.name AS requester_name,
    p.headline AS requester_headline,
    p.photo_url AS requester_photo,
    c.message,
    c.requested_at
  FROM connections c
  JOIN profiles p ON p.user_id = c.initiated_by
  WHERE
    (
      (c.user_id_1 = target_user_id AND c.initiated_by != target_user_id)
      OR (c.user_id_2 = target_user_id AND c.initiated_by != target_user_id)
    )
    AND c.status = 'pending'
  ORDER BY c.requested_at DESC;
END;
$$;

COMMENT ON FUNCTION get_pending_connection_requests(UUID) IS 'Get pending connection requests for a user';

-- ============================================================================
-- FUNCTION: update_last_active
-- Description: Update user's last_active_at timestamp
-- Usage: SELECT update_last_active(user_id)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_last_active(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

COMMENT ON FUNCTION update_last_active(UUID) IS 'Update user last active timestamp';

-- ============================================================================
-- TESTING NOTES
-- ============================================================================

-- Test profile creation trigger:
-- INSERT INTO auth.users (email) VALUES ('test@example.com');
-- Check: SELECT * FROM profiles WHERE email = 'test@example.com';

-- Test community member count:
-- INSERT INTO community_members (community_id, user_id) VALUES ('comm-uuid', 'user-uuid');
-- Check: SELECT member_count FROM communities WHERE id = 'comm-uuid';

-- Test connection normalization:
-- INSERT INTO connections (user_id_1, user_id_2, initiated_by)
-- VALUES ('uuid2', 'uuid1', 'uuid2');
-- Check: SELECT user_id_1, user_id_2 FROM connections; (should have uuid1 < uuid2)

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================
