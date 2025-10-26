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
