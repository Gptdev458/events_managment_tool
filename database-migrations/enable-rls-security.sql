-- Migration: Enable Row Level Security (RLS) on all tables
-- Date: 2025-01-20
-- Description: Enable RLS and create policies for secure data access

-- ========= ENABLE RLS ON ALL TABLES =========

-- Core tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_pipeline ENABLE ROW LEVEL SECURITY;

-- VIP Management tables
ALTER TABLE vip_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_activities ENABLE ROW LEVEL SECURITY;

-- CTO Club tables
ALTER TABLE cto_club_potential_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cto_club_pipeline ENABLE ROW LEVEL SECURITY;

-- ========= CREATE PERMISSIVE POLICIES FOR SINGLE-USER APPLICATION =========
-- Note: Since this appears to be a single-user/admin application, we'll create
-- permissive policies that allow all operations. In a multi-user environment,
-- these would need to be more restrictive.

-- Contacts table policies
CREATE POLICY "Enable all operations for contacts" ON contacts
    FOR ALL USING (true) WITH CHECK (true);

-- Events table policies
CREATE POLICY "Enable all operations for events" ON events
    FOR ALL USING (true) WITH CHECK (true);

-- Event invitations table policies
CREATE POLICY "Enable all operations for event_invitations" ON event_invitations
    FOR ALL USING (true) WITH CHECK (true);

-- Relationship pipeline table policies
CREATE POLICY "Enable all operations for relationship_pipeline" ON relationship_pipeline
    FOR ALL USING (true) WITH CHECK (true);

-- VIP tags table policies
CREATE POLICY "Enable all operations for vip_tags" ON vip_tags
    FOR ALL USING (true) WITH CHECK (true);

-- VIP contact tags table policies
CREATE POLICY "Enable all operations for vip_contact_tags" ON vip_contact_tags
    FOR ALL USING (true) WITH CHECK (true);

-- VIP initiatives table policies
CREATE POLICY "Enable all operations for vip_initiatives" ON vip_initiatives
    FOR ALL USING (true) WITH CHECK (true);

-- VIP tasks table policies
CREATE POLICY "Enable all operations for vip_tasks" ON vip_tasks
    FOR ALL USING (true) WITH CHECK (true);

-- VIP activities table policies
CREATE POLICY "Enable all operations for vip_activities" ON vip_activities
    FOR ALL USING (true) WITH CHECK (true);

-- CTO Club potential members table policies
CREATE POLICY "Enable all operations for cto_club_potential_members" ON cto_club_potential_members
    FOR ALL USING (true) WITH CHECK (true);

-- CTO Club pipeline table policies
CREATE POLICY "Enable all operations for cto_club_pipeline" ON cto_club_pipeline
    FOR ALL USING (true) WITH CHECK (true);

-- ========= VERIFICATION QUERIES =========
-- Run these after migration to verify RLS is enabled:

-- Check RLS status for all tables:
-- SELECT schemaname, tablename, rowsecurity, forcerowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename;

-- Check policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, policyname; 