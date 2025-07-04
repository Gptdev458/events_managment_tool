-- Migration: Fix data inconsistencies
-- Date: 2025-01-03
-- Description: Clean up test data and reset auto-assigned areas

-- Reset all auto-assigned areas to null - require manual assignment for accuracy
UPDATE contacts 
SET area = NULL 
WHERE area IS NOT NULL;

-- Clean up any contacts with future dates (test data)
UPDATE contacts 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at > CURRENT_TIMESTAMP;

-- Verification queries to run after migration:
-- Check that all areas are now null:
-- SELECT area, COUNT(*) as count FROM contacts GROUP BY area ORDER BY count DESC;

-- Check for any future dates:
-- SELECT name, created_at FROM contacts WHERE created_at > CURRENT_TIMESTAMP;

-- Check CTO Club members (should have no area assigned):
-- SELECT name, job_title, area, contact_type, is_in_cto_club FROM contacts WHERE is_in_cto_club = true; 