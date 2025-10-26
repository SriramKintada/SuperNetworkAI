-- ============================================================================
-- SuperNetworkAI - Vector Search Functions
-- Migration: 004_vector_functions.sql
-- Description: Create match_profiles function for vector similarity search
-- ============================================================================

-- Function: match_profiles
-- Description: Find profiles similar to a query embedding using vector cosine similarity
CREATE OR REPLACE FUNCTION match_profiles(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  name text,
  headline text,
  bio text,
  intent_text text,
  skills text[],
  location text,
  photo_url text,
  similarity float
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
    p.intent_text,
    p.skills,
    p.location,
    p.photo_url,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM profiles p
  INNER JOIN profile_embeddings pe ON pe.profile_id = p.id
  WHERE
    p.show_in_search = true
    AND p.visibility != 'private'
    AND 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
