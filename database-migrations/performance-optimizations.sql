-- Migration: Performance Optimizations
-- Date: 2025-01-20
-- Description: Add missing foreign key indexes and remove unused indexes

-- ========= ADD MISSING FOREIGN KEY INDEXES =========

-- Add index for event_invitations.contact_id foreign key
CREATE INDEX IF NOT EXISTS idx_event_invitations_contact_id 
ON event_invitations (contact_id);

-- Add index for event_invitations.invited_by_host_id foreign key
CREATE INDEX IF NOT EXISTS idx_event_invitations_invited_by_host_id 
ON event_invitations (invited_by_host_id);

-- Add index for event_invitations.event_id foreign key (if not exists)
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_id 
ON event_invitations (event_id);

-- ========= REMOVE UNUSED INDEXES =========

-- Remove unused JSONB indexes on contacts table
DROP INDEX IF EXISTS idx_contacts_current_projects;
DROP INDEX IF EXISTS idx_contacts_goals_aspirations;
DROP INDEX IF EXISTS idx_contacts_our_strategic_goals;

-- Remove unused VIP-related indexes
DROP INDEX IF EXISTS vip_contact_tags_tag_id_idx;
DROP INDEX IF EXISTS vip_activities_initiative_id_idx;

-- ========= ADD USEFUL INDEXES FOR COMMON QUERIES =========

-- Add index for contacts by contact_type (frequently queried)
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type 
ON contacts (contact_type);

-- Add index for contacts by area (frequently queried)
CREATE INDEX IF NOT EXISTS idx_contacts_area 
ON contacts (area);

-- Add index for contacts by is_in_cto_club (frequently queried)
CREATE INDEX IF NOT EXISTS idx_contacts_is_in_cto_club 
ON contacts (is_in_cto_club);

-- Add index for events by event_date (frequently queried)
CREATE INDEX IF NOT EXISTS idx_events_event_date 
ON events (event_date);

-- Add index for events by status (frequently queried)
CREATE INDEX IF NOT EXISTS idx_events_status 
ON events (status);

-- Add index for event_invitations by status (frequently queried)
CREATE INDEX IF NOT EXISTS idx_event_invitations_status 
ON event_invitations (status);

-- ========= VERIFICATION QUERIES =========
-- Run these after migration to verify indexes:

-- Check all indexes on public schema:
-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- Check foreign key constraints:
-- SELECT tc.table_name, tc.constraint_name, kcu.column_name, 
--        ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_schema = 'public'
-- ORDER BY tc.table_name; 