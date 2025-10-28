-- ============================================================================
-- COMPREHENSIVE MIGRATION: Add All Missing Columns to Profiles Table
-- Run this in Supabase SQL Editor to fix all schema issues
-- ============================================================================

DO $$
BEGIN
    -- Add experience_summary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='experience_summary') THEN
        ALTER TABLE profiles ADD COLUMN experience_summary TEXT;
    END IF;

    -- Add all_roles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='all_roles') THEN
        ALTER TABLE profiles ADD COLUMN all_roles TEXT[] DEFAULT '{}';
    END IF;

    -- Add all_companies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='all_companies') THEN
        ALTER TABLE profiles ADD COLUMN all_companies TEXT[] DEFAULT '{}';
    END IF;

    -- Add education_summary
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='education_summary') THEN
        ALTER TABLE profiles ADD COLUMN education_summary TEXT;
    END IF;

    -- Add years_of_experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='years_of_experience') THEN
        ALTER TABLE profiles ADD COLUMN years_of_experience INTEGER;
    END IF;

    -- Add certifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='certifications') THEN
        ALTER TABLE profiles ADD COLUMN certifications TEXT[] DEFAULT '{}';
    END IF;

    -- Add key_achievements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='key_achievements') THEN
        ALTER TABLE profiles ADD COLUMN key_achievements TEXT[] DEFAULT '{}';
    END IF;

    -- Add expertise_areas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='expertise_areas') THEN
        ALTER TABLE profiles ADD COLUMN expertise_areas TEXT[] DEFAULT '{}';
    END IF;

    -- Add vectorization_text
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='vectorization_text') THEN
        ALTER TABLE profiles ADD COLUMN vectorization_text TEXT;
    END IF;

    -- Add current_role (might already exist from initial schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='current_role') THEN
        ALTER TABLE profiles ADD COLUMN current_role TEXT;
    END IF;

    -- Add current_company (might already exist from initial schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='profiles' AND column_name='current_company') THEN
        ALTER TABLE profiles ADD COLUMN current_company TEXT;
    END IF;
END $$;

-- Create indexes (these use IF NOT EXISTS so they're safe)
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

-- Show completion message
SELECT 'Migration completed successfully! All columns added.' AS status;
