-- ============================================================================
-- SuperNetworkAI - Match Scores Cache
-- Migration: 006_match_scores_cache.sql
-- Description: Cache AI match scores to reduce API costs
-- ============================================================================

CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Participants
  user_id_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Match data
  match_score FLOAT NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  explanation TEXT NOT NULL,
  match_details JSONB, -- {skills_overlap: [], intent_similarity: 0.8, ...}

  -- Cache metadata
  query_hash TEXT NOT NULL, -- Hash of search query for cache invalidation
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  -- Constraints
  UNIQUE(user_id_1, user_id_2, query_hash)
);

-- Indexes
CREATE INDEX idx_match_scores_users ON match_scores(user_id_1, user_id_2);
CREATE INDEX idx_match_scores_expires ON match_scores(expires_at);
CREATE INDEX idx_match_scores_query_hash ON match_scores(query_hash);

-- Auto-delete expired cache entries
CREATE OR REPLACE FUNCTION delete_expired_match_scores()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM match_scores WHERE expires_at < NOW();
END;
$$;
