# Event System Database Schema Backup
*Created: December 13, 2025*
*Project ID: jxofvrtmkkgicvwjqoyy*

## Database Overview
- **Status**: ACTIVE_HEALTHY
- **Region**: eu-central-2 
- **PostgreSQL Version**: 17.4.1.45

## Tables

### 1. contacts
**Description**: Master list of every person in your network. The central rolodex.
- **Size**: 144 kB (64 live rows, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - gen_random_uuid()
- `created_at` (timestamptz) - now()
- `first_name` (text)
- `last_name` (text) 
- `email` (text, unique) - Primary email address for the contact
- `company` (text)
- `job_title` (text)
- `linkedin_url` (text)
- `contact_type` (text)
- `is_in_cto_club` (boolean) - default false
- `general_notes` (text)
- `name` (text) - Combined full name of the contact
- `additional_emails` (text[]) - Array of additional email addresses
- `area` (contact_area enum) - engineering, founders, product
- `current_projects` (jsonb) - JSON array of VIP's current projects (default '[]')
- `goals_aspirations` (jsonb) - JSON array of VIP's goals (default '[]')
- `our_strategic_goals` (jsonb) - JSON array of our strategic goals (default '[]')

### 2. events
**Description**: A record for each individual event that is hosted.
- **Size**: 64 kB (1 live row, 6 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - gen_random_uuid()
- `created_at` (timestamptz) - now()
- `name` (text, NOT NULL)
- `event_type` (text, NOT NULL)
- `event_date` (date, NOT NULL)
- `status` (text) - default 'Planning'
- `description` (text)
- `location` (text)
- `max_attendees` (integer)

### 3. event_invitations
**Description**: Tracks the status of each contact for each event they are invited to.
- **Size**: 112 kB (47 live rows, 30 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (bigint, PK, identity)
- `event_id` (uuid, NOT NULL, FK → events.id)
- `contact_id` (uuid, NOT NULL, FK → contacts.id)
- `status` (text, NOT NULL) - default 'Sourced'
- `invited_by_host_id` (uuid, FK → contacts.id)
- `is_new_connection` (boolean) - default false
- `follow_up_notes` (text)
- `created_at` (timestamptz) - now()

### 4. relationship_pipeline
**Description**: A curated list for nurturing high-value contacts into clients or partners.
- **Size**: 48 kB (1 live row, 33 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (bigint, PK, identity)
- `contact_id` (uuid, NOT NULL, unique, FK → contacts.id)
- `pipeline_stage` (text, NOT NULL)
- `next_action_description` (text)
- `next_action_date` (date)

### 5. vip_tags
**Description**: Master list of interests and focus areas for VIPs.
- **Size**: 48 kB (1 live row, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `name` (text, NOT NULL, unique)

### 6. vip_contact_tags
**Description**: Connects contacts to their specific VIP-level interests.
- **Size**: 40 kB (1 live row, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `contact_id` (uuid, PK, FK → contacts.id)
- `tag_id` (uuid, PK, FK → vip_tags.id)

### 7. vip_initiatives
**Description**: Stores the main "Give" and "Ask" strategic projects for a contact.
- **Size**: 48 kB (2 live rows, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `contact_id` (uuid, NOT NULL, FK → contacts.id)
- `title` (text, NOT NULL)
- `description` (text)
- `type` (vip_initiative_type enum) - give, ask
- `status` (vip_initiative_status enum) - active, on_hold, completed, archived (default 'active')

### 8. vip_tasks
**Description**: Individual, actionable to-do items within a larger VIP Initiative.
- **Size**: 48 kB (3 live rows, 5 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `initiative_id` (uuid, NOT NULL, FK → vip_initiatives.id)
- `name` (text, NOT NULL)
- `status` (vip_task_status enum) - to_do, in_progress, done, cancelled (default 'to_do')
- `due_date` (date)
- `outcome_notes` (text)

### 9. vip_activities
**Description**: A running journal of all VIP-level interactions and touchpoints.
- **Size**: 48 kB (1 live row, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `contact_id` (uuid, NOT NULL, FK → contacts.id)
- `initiative_id` (uuid, FK → vip_initiatives.id)
- `activity_date` (timestamptz) - now()
- `type` (vip_activity_type enum) - meeting, call, email, event, info_share, future_touchpoint
- `summary` (text, NOT NULL)
- `notes` (text)

### 10. cto_club_potential_members
**Description**: Tracks potential CTO Club members with notes.
- **Size**: 48 kB (1 live row, 3 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (bigint, PK, identity)
- `contact_id` (uuid, NOT NULL, unique, FK → contacts.id)
- `notes` (text)
- `added_date` (timestamptz) - now()
- `created_at` (timestamptz) - now()

### 11. cto_club_pipeline
**Description**: Tracks CTO Club recruitment pipeline with status and actions.
- **Size**: 48 kB (1 live row, 30 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (bigint, PK, identity)
- `contact_id` (uuid, NOT NULL, unique, FK → contacts.id)
- `status` (text) - default 'not started'
- `next_action` (text)
- `next_action_date` (date)
- `last_action_date` (date)
- `notes` (text)
- `created_at` (timestamptz) - now()

### 12. cto_club_engagement_initiatives
**Description**: Global initiatives for CTO club member engagement and value delivery.
- **Size**: 48 kB (2 live rows, 0 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `title` (text, NOT NULL)
- `description` (text)
- `status` (cto_club_initiative_status enum) - active, on_hold, completed, archived (default 'active')

### 13. cto_club_engagement_tasks
**Description**: Individual tasks within CTO club engagement initiatives.
- **Size**: 80 kB (5 live rows, 26 dead rows)
- **RLS**: Enabled

**Columns:**
- `id` (uuid, PK) - uuid_generate_v4()
- `created_at` (timestamptz) - now()
- `initiative_id` (uuid, NOT NULL, FK → cto_club_engagement_initiatives.id)
- `name` (text, NOT NULL)
- `status` (cto_club_task_status enum) - to_do, in_progress, done, cancelled (default 'to_do')
- `due_date` (date)
- `notes` (text)

## Enums
- `contact_area`: engineering, founders, product
- `vip_initiative_type`: give, ask
- `vip_initiative_status`: active, on_hold, completed, archived
- `vip_task_status`: to_do, in_progress, done, cancelled
- `vip_activity_type`: meeting, call, email, event, info_share, future_touchpoint
- `cto_club_initiative_status`: active, on_hold, completed, archived
- `cto_club_task_status`: to_do, in_progress, done, cancelled

## Key Relationships
- Events → Event Invitations → Contacts
- Contacts → VIP Initiatives → VIP Tasks/Activities
- Contacts → CTO Club (potential members, pipeline, engagement)
- Contacts → Relationship Pipeline
- VIP Tags ↔ Contacts (many-to-many) 