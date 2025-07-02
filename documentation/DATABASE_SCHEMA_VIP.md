-- ========= VIP MANAGEMENT SYSTEM - SCHEMA ADDITIONS =========

-- This script adds the necessary tables and types for "The Schlagel Protocol"

-- to an existing project schema. It leverages the existing 'contacts' table.



-- ========= 1. CUSTOM VIP TYPES =========

-- Prefixed with 'vip\_' to avoid any naming conflicts.

CREATE TYPE vip\_initiative\_type AS ENUM ('give', 'ask');

CREATE TYPE vip\_initiative\_status AS ENUM ('active', 'on\_hold', 'completed', 'archived');

CREATE TYPE vip\_task\_status AS ENUM ('to\_do', 'in\_progress', 'done', 'cancelled');

CREATE TYPE vip\_activity\_type AS ENUM ('meeting', 'call', 'email', 'event', 'info\_share', 'future\_touchpoint');





-- ========= 2. NEW VIP-RELATED TABLES =========



-- Table for flexible, reusable tags for VIP interests and focus areas.

-- This provides more flexibility than the single 'contact\_type' column.

CREATE TABLE vip\_tags (

&nbsp;   id uuid PRIMARY KEY DEFAULT extensions.uuid\_generate\_v4(),

&nbsp;   created\_at timestamptz NOT NULL DEFAULT now(),

&nbsp;   name text NOT NULL UNIQUE

);

COMMENT ON TABLE vip\_tags IS 'Master list of interests and focus areas for VIPs (e.g., "Charity: Education", "Policy: Tech").';



-- Join table to link contacts to multiple tags.

CREATE TABLE vip\_contact\_tags (

&nbsp;   contact\_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

&nbsp;   tag\_id uuid NOT NULL REFERENCES vip\_tags(id) ON DELETE CASCADE,

&nbsp;   PRIMARY KEY (contact\_id, tag\_id)

);

COMMENT ON TABLE vip\_contact\_tags IS 'Connects contacts to their specific VIP-level interests.';





-- Table for the high-level "Give" and "Ask" Initiatives.

-- This is the core of the new protocol and far more detailed than 'relationship\_pipeline'.

CREATE TABLE vip\_initiatives (

&nbsp;   id uuid PRIMARY KEY DEFAULT extensions.uuid\_generate\_v4(),

&nbsp;   created\_at timestamptz NOT NULL DEFAULT now(),

&nbsp;   contact\_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

&nbsp;   title text NOT NULL,

&nbsp;   description text,

&nbsp;   type vip\_initiative\_type NOT NULL,

&nbsp;   status vip\_initiative\_status NOT NULL DEFAULT 'active'

);

COMMENT ON TABLE vip\_initiatives IS 'Stores the main "Give" and "Ask" strategic projects for a contact.';





-- Table for the multi-step tasks within each Initiative.

CREATE TABLE vip\_tasks (

&nbsp;   id uuid PRIMARY KEY DEFAULT extensions.uuid\_generate\_v4(),

&nbsp;   created\_at timestamptz NOT NULL DEFAULT now(),

&nbsp;   initiative\_id uuid NOT NULL REFERENCES vip\_initiatives(id) ON DELETE CASCADE,

&nbsp;   name text NOT NULL,

&nbsp;   status vip\_task\_status NOT NULL DEFAULT 'to\_do',

&nbsp;   due\_date date,

&nbsp;   outcome\_notes text

);

COMMENT ON TABLE vip\_tasks IS 'Individual, actionable to-do items within a larger VIP Initiative.';





-- Table for a detailed log of interactions related to the VIP protocol.

CREATE TABLE vip\_activities (

&nbsp;   id uuid PRIMARY KEY DEFAULT extensions.uuid\_generate\_v4(),

&nbsp;   created\_at timestamptz NOT NULL DEFAULT now(),

&nbsp;   contact\_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

&nbsp;   initiative\_id uuid REFERENCES vip\_initiatives(id) ON DELETE SET NULL,

&nbsp;   activity\_date timestamptz NOT NULL DEFAULT now(),

&nbsp;   type vip\_activity\_type NOT NULL,

&nbsp;   summary text NOT NULL,

&nbsp;   notes text

);

COMMENT ON TABLE vip\_activities IS 'A running journal of all VIP-level interactions and touchpoints.';





-- ========= 3. NEW INDEXES FOR PERFORMANCE =========

CREATE INDEX ON vip\_contact\_tags (contact\_id);

CREATE INDEX ON vip\_contact\_tags (tag\_id);

CREATE INDEX ON vip\_initiatives (contact\_id);

CREATE INDEX ON vip\_tasks (initiative\_id);

CREATE INDEX ON vip\_activities (contact\_id);

CREATE INDEX ON vip\_activities (initiative\_id);

