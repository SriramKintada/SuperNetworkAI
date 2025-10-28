-- Migration: Add current_role and current_company columns
-- These fields store the user's current position for quick access

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company TEXT;

-- Add indexes for filtering by current role/company
CREATE INDEX IF NOT EXISTS idx_profiles_current_role ON profiles(current_role);
CREATE INDEX IF NOT EXISTS idx_profiles_current_company ON profiles(current_company);

-- Add comments for documentation
COMMENT ON COLUMN profiles.current_role IS 'Current job title/position';
COMMENT ON COLUMN profiles.current_company IS 'Current company/organization';
