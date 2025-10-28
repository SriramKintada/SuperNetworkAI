-- ============================================================================
-- COMPREHENSIVE MIGRATION: Add All Missing Columns to Profiles Table
-- Run this in Supabase SQL Editor to fix all schema issues
-- ============================================================================

-- Add comprehensive professional fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS all_roles TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS all_companies TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_summary TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS key_achievements TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise_areas TEXT[] DEFAULT '{}';

-- Add comprehensive vectorization text field for semantic search
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vectorization_text TEXT;

-- Ensure current_role and current_company exist (should already exist from 001)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company TEXT;

-- Create indexes for new array fields to enable fast filtering
CREATE INDEX IF NOT EXISTS idx_profiles_all_roles ON profiles USING GIN(all_roles);
CREATE INDEX IF NOT EXISTS idx_profiles_all_companies ON profiles USING GIN(all_companies);
CREATE INDEX IF NOT EXISTS idx_profiles_expertise_areas ON profiles USING GIN(expertise_areas);
CREATE INDEX IF NOT EXISTS idx_profiles_certifications ON profiles USING GIN(certifications);
CREATE INDEX IF NOT EXISTS idx_profiles_current_role ON profiles(current_role);
CREATE INDEX IF NOT EXISTS idx_profiles_current_company ON profiles(current_company);

-- Add comments for documentation
COMMENT ON COLUMN profiles.vectorization_text IS 'Comprehensive text combining all profile fields for semantic search embedding';
COMMENT ON COLUMN profiles.experience_summary IS 'AI-generated summary of career trajectory and key achievements';
COMMENT ON COLUMN profiles.all_roles IS 'All job titles held throughout career';
COMMENT ON COLUMN profiles.all_companies IS 'All companies worked at throughout career';
COMMENT ON COLUMN profiles.expertise_areas IS 'Core areas of professional expertise (5-10 areas)';
COMMENT ON COLUMN profiles.key_achievements IS 'Notable achievements extracted from experience';
COMMENT ON COLUMN profiles.current_role IS 'Current job title/position';
COMMENT ON COLUMN profiles.current_company IS 'Current company/organization';

-- Show completion message
SELECT 'Migration completed successfully! All columns added.' AS status;
