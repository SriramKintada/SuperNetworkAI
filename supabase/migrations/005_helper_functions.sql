-- ============================================================================
-- SuperNetworkAI - Helper Functions
-- Migration: 005_helper_functions.sql
-- Description: Helper functions for connections, communities, etc.
-- ============================================================================

-- Function: get_user_connections
-- Description: Get all connections for a user (both initiated and received)
CREATE OR REPLACE FUNCTION get_user_connections(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  headline text,
  photo_url text,
  status text,
  message text,
  initiated_by uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    c.id,
    CASE
      WHEN c.user_id_1 = target_user_id THEN c.user_id_2
      ELSE c.user_id_1
    END AS user_id,
    p.name,
    p.headline,
    p.photo_url,
    c.status,
    c.message,
    c.initiated_by,
    c.created_at
  FROM connections c
  INNER JOIN profiles p ON p.user_id = CASE
    WHEN c.user_id_1 = target_user_id THEN c.user_id_2
    ELSE c.user_id_1
  END
  WHERE c.user_id_1 = target_user_id OR c.user_id_2 = target_user_id
  ORDER BY c.created_at DESC;
END;
$$;

-- Function: get_user_conversations
-- Description: Get all conversations for a user with last message
CREATE OR REPLACE FUNCTION get_user_conversations(target_user_id uuid)
RETURNS TABLE (
  conversation_with_user_id uuid,
  conversation_with_name text,
  conversation_with_photo_url text,
  last_message_content text,
  last_message_at timestamptz,
  unread_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN m.sender_id = target_user_id THEN m.recipient_id
      ELSE m.sender_id
    END AS conversation_with_user_id,
    p.name AS conversation_with_name,
    p.photo_url AS conversation_with_photo_url,
    m.content AS last_message_content,
    m.created_at AS last_message_at,
    COUNT(CASE WHEN m.recipient_id = target_user_id AND m.read_at IS NULL THEN 1 END) AS unread_count
  FROM messages m
  INNER JOIN profiles p ON p.user_id = CASE
    WHEN m.sender_id = target_user_id THEN m.recipient_id
    ELSE m.sender_id
  END
  WHERE m.sender_id = target_user_id OR m.recipient_id = target_user_id
  GROUP BY conversation_with_user_id, p.name, p.photo_url, m.content, m.created_at
  ORDER BY m.created_at DESC;
END;
$$;
