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
