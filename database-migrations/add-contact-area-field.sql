-- Migration: Add 'area' field to contacts table
-- Date: 2025-01-03
-- Description: Add a new 'area' column to categorize contacts by business domain

-- Step 1: Create the enum type for contact areas
CREATE TYPE contact_area AS ENUM ('engineering', 'founders', 'product');

-- Step 2: Add the area column to the contacts table
ALTER TABLE contacts ADD COLUMN area contact_area;

-- Step 3: Add a comment to document the new column
COMMENT ON COLUMN contacts.area IS 'The business area or domain this contact is associated with (engineering, founders, product). Must be assigned manually.';

-- Step 4: Create an index for better query performance (optional)
CREATE INDEX idx_contacts_area ON contacts(area);

-- No automatic assignment - areas must be set manually for accuracy

-- Verification queries:
-- SELECT area, COUNT(*) FROM contacts GROUP BY area;
-- SELECT name, job_title, area FROM contacts WHERE area IS NOT NULL;
