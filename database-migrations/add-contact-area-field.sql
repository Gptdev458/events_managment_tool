-- Migration: Add 'area' field to contacts table
-- Date: 2025-01-03
-- Description: Add a new 'area' column to categorize contacts by business domain

-- Step 1: Create the enum type for contact areas
CREATE TYPE contact_area AS ENUM ('engineering', 'founders', 'product');

-- Step 2: Add the area column to the contacts table
ALTER TABLE contacts ADD COLUMN area contact_area;

-- Step 3: Add a comment to document the new column
COMMENT ON COLUMN contacts.area IS 'The business area or domain this contact is associated with (engineering, founders, product)';

-- Step 4: Create an index for better query performance (optional)
CREATE INDEX idx_contacts_area ON contacts(area);

-- Step 5: Update existing contacts with default areas based on their job titles (optional)
-- This is a best-effort mapping based on common job title patterns
UPDATE contacts 
SET area = 'engineering' 
WHERE area IS NULL 
  AND (
    LOWER(job_title) LIKE '%engineer%' 
    OR LOWER(job_title) LIKE '%developer%' 
    OR LOWER(job_title) LIKE '%architect%'
    OR LOWER(job_title) LIKE '%tech lead%'
    OR LOWER(job_title) LIKE '%technical%'
  );

UPDATE contacts 
SET area = 'founders' 
WHERE area IS NULL 
  AND (
    LOWER(job_title) LIKE '%founder%' 
    OR LOWER(job_title) LIKE '%ceo%' 
    OR LOWER(job_title) LIKE '%cto%'
    OR LOWER(job_title) LIKE '%chief%'
    OR LOWER(job_title) LIKE '%president%'
  );

UPDATE contacts 
SET area = 'product' 
WHERE area IS NULL 
  AND (
    LOWER(job_title) LIKE '%product%' 
    OR LOWER(job_title) LIKE '%pm%'
    OR LOWER(job_title) LIKE '%product manager%'
    OR LOWER(job_title) LIKE '%product owner%'
  );

-- Verification queries:
-- SELECT area, COUNT(*) FROM contacts GROUP BY area;
-- SELECT * FROM contacts WHERE area IS NOT NULL LIMIT 10;
