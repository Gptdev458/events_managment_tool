-- Migration: Add last_action_date to relationship_pipeline table
-- Date: 2025-01-16
-- Description: Add last_action_date field to track when the last action was completed

-- Step 1: Add last_action_date column to relationship_pipeline table
ALTER TABLE relationship_pipeline ADD COLUMN last_action_date DATE;

-- Step 2: Add comment to document the new column
COMMENT ON COLUMN relationship_pipeline.last_action_date IS 'Date when the last action was completed for this contact';

-- Step 3: Update any existing records where next_action_date is in the past to set last_action_date
-- This assumes that if next_action_date is in the past, it was likely completed
UPDATE relationship_pipeline 
SET last_action_date = next_action_date 
WHERE next_action_date IS NOT NULL 
  AND next_action_date < CURRENT_DATE;

-- Verification query:
-- SELECT contact_id, pipeline_stage, last_action_date, next_action_date, next_action_description 
-- FROM relationship_pipeline 
-- ORDER BY next_action_date NULLS LAST; 