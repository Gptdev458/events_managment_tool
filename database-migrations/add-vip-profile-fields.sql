-- Migration: Add VIP Profile fields to contacts table
-- Date: 2025-01-15
-- Description: Add VIP profile fields for storing current projects, goals, and strategic goals

-- Step 1: Add current_projects column to store the VIP's active endeavors
ALTER TABLE contacts ADD COLUMN current_projects JSONB DEFAULT '[]'::jsonb;

-- Step 2: Add goals_aspirations column to store the VIP's personal and professional goals
ALTER TABLE contacts ADD COLUMN goals_aspirations JSONB DEFAULT '[]'::jsonb;

-- Step 3: Add our_strategic_goals column to store our goals for/with the VIP
ALTER TABLE contacts ADD COLUMN our_strategic_goals JSONB DEFAULT '[]'::jsonb;

-- Step 4: Add comments to document the new columns
COMMENT ON COLUMN contacts.current_projects IS 'JSON array of the VIP''s current projects and ventures';
COMMENT ON COLUMN contacts.goals_aspirations IS 'JSON array of the VIP''s known personal and professional goals';
COMMENT ON COLUMN contacts.our_strategic_goals IS 'JSON array of our strategic goals for/with this VIP';

-- Step 5: Create indexes for better query performance on JSONB columns
CREATE INDEX idx_contacts_current_projects ON contacts USING GIN (current_projects);
CREATE INDEX idx_contacts_goals_aspirations ON contacts USING GIN (goals_aspirations);
CREATE INDEX idx_contacts_our_strategic_goals ON contacts USING GIN (our_strategic_goals);

-- Verification queries:
-- SELECT name, current_projects, goals_aspirations, our_strategic_goals FROM contacts WHERE contact_type = 'vip';
-- SELECT COUNT(*) FROM contacts WHERE jsonb_array_length(current_projects) > 0; 