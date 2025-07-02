\# Database Schema for "The Rolodex"



This document outlines the complete database schema for the internal event management tool. It is the single source of truth for all tables, columns, and their relationships.



\## Table of Contents

1\.  \[Table: `contacts`](#table-contacts)

2\.  \[Table: `events`](#table-events)

3\.  \[Table: `event\_invitations`](#table-event-invitations)

4\.  \[Table: `relationship\_pipeline`](#table-relationship-pipeline)

5\.  \[Relationships \& Foreign Keys](#relationships--foreign-keys)

6\.  \[Full SQL Schema](#full-sql-schema)



---



\## Table: `contacts`



\*\*Purpose:\*\* This is the central rolodex. It holds a unique record for every person in our network, regardless of their event attendance history. The `email` column is the unique identifier.



| Column Name       | Data Type     | Constraints                              | Description                                                    |

| ----------------- | ------------- | ---------------------------------------- | -------------------------------------------------------------- |

| `id`              | `UUID`        | Primary Key, Default: `gen\_random\_uuid()` | Unique identifier for the contact.                             |

| `created\_at`      | `TIMESTAMPTZ` | Default: `now()`                         | Timestamp of when the contact was created.                     |

| `first\_name`      | `TEXT`        | -                                        | The contact's first name.                                      |

| `last\_name`       | `TEXT`        | -                                        | The contact's last name.                                       |

| `email`           | `TEXT`        | `NOT NULL`, `UNIQUE`                     | The contact's unique email address. Prevents duplicates.       |

| `company`         | `TEXT`        | -                                        | The company the contact works for.                             |

| `job\_title`       | `TEXT`        | -                                        | The contact's job title.                                       |

| `linkedin\_url`    | `TEXT`        | -                                        | A URL to the contact's LinkedIn profile.                       |

| `contact\_type`    | `TEXT`        | `NOT NULL`                               | Category tag (e.g., 'Engineer', 'Product', 'Founder', 'Host'). |

| `is\_in\_cto\_club`  | `BOOLEAN`     | Default: `FALSE`                         | A true/false flag indicating CTO Club membership.              |

| `general\_notes`   | `TEXT`        | -                                        | Timeless notes about the contact.                              |



---



\## Table: `events`



\*\*Purpose:\*\* Stores a record for each individual event hosted by the company.



| Column Name  | Data Type     | Constraints                              | Description                                                    |

| ------------ | ------------- | ---------------------------------------- | -------------------------------------------------------------- |

| `id`         | `UUID`        | Primary Key, Default: `gen\_random\_uuid()` | Unique identifier for the event.                               |

| `created\_at` | `TIMESTAMPTZ` | Default: `now()`                         | Timestamp of when the event was created.                       |

| `name`       | `TEXT`        | `NOT NULL`                               | The official name of the event (e.g., 'Q3 Engineering BBQ').   |

| `event\_type` | `TEXT`        | `NOT NULL`                               | The category of the event (e.g., 'Engineering', 'Product').    |

| `event\_date` | `DATE`        | `NOT NULL`                               | The date on which the event is held.                           |

| `status`     | `TEXT`        | Default: `'Planning'`                    | The current lifecycle stage of the event (e.g., 'Planning', 'Completed'). |



---



\## Table: `event\_invitations`



\*\*Purpose:\*\* This is the "join table" that connects `contacts` to `events`. Each record represents one person's invitation to one specific event and tracks their status throughout the process.



| Column Name           | Data Type | Constraints                              | Description                                                                    |

| --------------------- | --------- | ---------------------------------------- | ------------------------------------------------------------------------------ |

| `id`                  | `BIGINT`  | Primary Key, Auto-incrementing           | Unique identifier for the invitation record.                                   |

| `event\_id`            | `UUID`    | `NOT NULL`, Foreign Key -> `events.id`   | Links to the specific event.                                                   |

| `contact\_id`          | `UUID`    | `NOT NULL`, Foreign Key -> `contacts.id` | Links to the specific contact who was invited.                                 |

| `status`              | `TEXT`    | `NOT NULL`, Default: `'Sourced'`         | The current status of the invitation (e.g., 'Sourced', 'Invited', 'Attended'). |

| `invited\_by\_host\_id`  | `UUID`    | Foreign Key -> `contacts.id`             | If invited by a host, this links to the host's record in the `contacts` table. |

| `is\_new\_connection`   | `BOOLEAN` | Default: `FALSE`                         | A flag set to `true` if this is the first event the contact has attended.      |

| `follow\_up\_notes`     | `TEXT`    | -                                        | Specific notes from interactions at this particular event.                     |

| -                     | -         | `UNIQUE(event\_id, contact\_id)`           | A constraint to ensure a person can't be invited to the same event twice.      |



---



\## Table: `relationship\_pipeline`



\*\*Purpose:\*\* A curated list for managing and nurturing high-value contacts who are potential clients, partners, or key networkers.



| Column Name               | Data Type | Constraints                              | Description                                                                |

| ------------------------- | --------- | ---------------------------------------- | -------------------------------------------------------------------------- |

| `id`                      | `BIGINT`  | Primary Key, Auto-incrementing           | Unique identifier for the pipeline entry.                                  |

| `contact\_id`              | `UUID`    | `NOT NULL`, `UNIQUE`, Foreign Key -> `contacts.id` | Links to the contact. `UNIQUE` ensures a person is only in the pipeline once. |

| `pipeline\_stage`          | `TEXT`    | `NOT NULL`                               | The current stage of the relationship (e.g., 'Identified', 'Warm Lead').   |

| `next\_action\_description` | `TEXT`    | -                                        | A description of the next task to perform for this contact.                |

| `next\_action\_date`        | `DATE`    | -                                        | The due date for the next action.                                          |



---



\## Relationships \& Foreign Keys



\-   `event\_invitations.event\_id` points to `events.id`. This links a guest list entry to a specific event.

\-   `event\_invitations.contact\_id` points to `contacts.id`. This links a guest list entry to a specific person.

\-   `event\_invitations.invited\_by\_host\_id` points to `contacts.id`. This links an invitation to the host who sourced it.

\-   `relationship\_pipeline.contact\_id` points to `contacts.id`. This links a VIP follow-up record to a specific person.



---



\## Full SQL Schema



This is the complete SQL script to create all tables and their relationships in a Supabase project.



```sql

-- SQL Schema for "The Rolodex" Event Management Tool



-- 1. The `Contacts` Cabinet (Your Digital Rolodex)

-- Master list of every person in your network.

CREATE TABLE contacts (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMPTZ DEFAULT now(),

&nbsp; first\_name TEXT,

&nbsp; last\_name TEXT,

&nbsp; email TEXT NOT NULL UNIQUE,

&nbsp; company TEXT,

&nbsp; job\_title TEXT,

&nbsp; linkedin\_url TEXT,

&nbsp; contact\_type TEXT NOT NULL, -- e.g., 'Engineer', 'Product', 'Founder', 'Host'

&nbsp; is\_in\_cto\_club BOOLEAN DEFAULT FALSE,

&nbsp; general\_notes TEXT

);



COMMENT ON TABLE contacts IS 'Master list of every person in your network. The central rolodex.';





-- 2. The `Events` Cabinet (Your Event Calendar)

-- Contains details for each specific event you host.

CREATE TABLE events (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; created\_at TIMESTAMPTZ DEFAULT now(),

&nbsp; name TEXT NOT NULL, -- e.g., 'Q3 2024 Engineering Leaders BBQ'

&nbsp; event\_type TEXT NOT NULL, -- e.g., 'Engineering', 'Product', 'Combined'

&nbsp; event\_date DATE NOT NULL,

&nbsp; status TEXT DEFAULT 'Planning' -- e.g., 'Planning', 'Invitations Sent', 'Completed'

);



COMMENT ON TABLE events IS 'A record for each individual event that is hosted.';





-- 3. The `Event Invitations` Cabinet (The Master Guest List)

-- This is the "glue" that connects a contact to a specific event, tracking their status.

CREATE TABLE event\_invitations (

&nbsp; id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

&nbsp; event\_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,

&nbsp; contact\_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

&nbsp; status TEXT NOT NULL DEFAULT 'Sourced', -- e.g., 'Sourced', 'Invited', 'RSVP\_Yes', 'Attended'

&nbsp; invited\_by\_host\_id UUID REFERENCES contacts(id) ON DELETE SET NULL, -- Links to the host who invited them

&nbsp; is\_new\_connection BOOLEAN DEFAULT FALSE,

&nbsp; follow\_up\_notes TEXT,

&nbsp; 

&nbsp; -- Ensures a person can only be on a guest list once for any given event

&nbsp; UNIQUE(event\_id, contact\_id)

);



COMMENT ON TABLE event\_invitations IS 'Tracks the status of each contact for each event they are invited to.';





-- 4. The `Relationship Pipeline` Cabinet (The VIP Follow-up List)

-- A separate, high-priority list for strategic relationship nurturing.

CREATE TABLE relationship\_pipeline (

&nbsp; id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,

&nbsp; contact\_id UUID NOT NULL UNIQUE REFERENCES contacts(id) ON DELETE CASCADE,

&nbsp; pipeline\_stage TEXT NOT NULL, -- e.g., 'Identified', 'Initial Outreach', 'Warm Lead'

&nbsp; next\_action\_description TEXT,

&nbsp; next\_action\_date DATE

);



COMMENT ON TABLE relationship\_pipeline IS 'A curated list for nurturing high-value contacts into clients or partners.';

