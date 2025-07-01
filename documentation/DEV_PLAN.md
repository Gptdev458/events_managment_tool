\# Development Plan



\*\*Project:\*\* The Rolodex - Event \& Network Management Tool

\*\*Lead:\*\* AI Agent

\*\*Goal:\*\* To build an internal tool with robust import/export capabilities as per PRD v1.1.



\## 1. Technology Stack



\-   \*\*Framework:\*\* Next.js (with App Router)

\-   \*\*Database \& Auth:\*\* Supabase

\-   \*\*Styling:\*\* Tailwind CSS

\-   \*\*UI Components:\*\* Shadcn/ui

\-   \*\*CSV Handling:\*\* `papaparse` (for parsing imports), `json2csv` (for generating exports)

\-   \*\*Deployment:\*\* Vercel



\## 2. Database Schema



\*(The database schema remains unchanged as it perfectly supports the required data relationships for import/export.)\*



\-   \*\*`contacts`\*\*: Central rolodex.

\-   \*\*`events`\*\*: Event details.

\-   \*\*`event\_invitations`\*\*: Join table tracking status, host, and new connection status.

\-   \*\*`relationship\_pipeline`\*\*: For internal strategic follow-ups.



\## 3. Development Milestones (Revised Sprint Plan)



\### Milestone 1: Foundation \& Setup (Est. 1 day)

\-   \[ ] Clone Next.js/Supabase starter template and configure environment.

\-   \[ ] Set up Supabase Auth for internal user login.

\-   \[ ] Initialize Shadcn/ui and add core components (Button, Table, Dialog, Input).

\-   \[ ] Create basic page layouts for `/contacts`, `/events`, and `/pipeline`, protected by authentication.



\### Milestone 2: Core Data Management (Est. 2-3 days)

\-   \[ ] \*\*Contacts Page:\*\* Build full CRUD (Create, Read, Update, Delete) for the `contacts` table using a Shadcn `Table` and `Dialog` forms.

\-   \[ ] \*\*Events Page:\*\* Build full CRUD for the `events` table.

\-   \[ ] \*\*Event Detail Page (`/events/\[id]`):\*\*

&nbsp;   -   \[ ] Display event details.

&nbsp;   -   \[ ] Implement the UI to build the guest list (i.e., associate contacts with an event, creating records in `event\_invitations`).



\### Milestone 3: Import \& Export Functionality (Est. 3 days)

\-   \[ ] \*\*Contact Import:\*\*

&nbsp;   -   \[ ] On the `/contacts` page, add an "Import from CSV" button.

&nbsp;   -   \[ ] Build a client-side component using `papaparse` to read a CSV file.

&nbsp;   -   \[ ] Create a server action to receive the parsed JSON data and perform an "upsert" operation into the `contacts` table.

\-   \[ ] \*\*Contact/Attendee Export:\*\*

&nbsp;   -   \[ ] On the `/contacts` and `/events/\[id]` pages, add an "Export to CSV" button.

&nbsp;   -   \[ ] Create a server action that fetches the relevant data, converts it to CSV format using `json2csv`, and returns it as a file download.

\-   \[ ] \*\*Specialized Exports:\*\*

&nbsp;   -   \[ ] On the Event Detail page, create a specific "Export for Zap" button that generates a clean CSV with only Name, Email, Company.

&nbsp;   -   \[ ] Create a "Host Performance Report" generator that filters `event\_invitations` by `invited\_by\_host\_id` and exports the results.



\### Milestone 4: Event Workflow \& Pipeline (Est. 2-3 days)

\-   \[ ] \*\*Event Day Check-in:\*\*

&nbsp;   -   \[ ] On the Event Detail Page, implement the "Check In" button to update status to `Attended`.

&nbsp;   -   \[ ] Ensure the `is\_new\_connection` flag is correctly set on the backend during check-in.

\-   \[ ] \*\*Relationship Pipeline:\*\*

&nbsp;   -   \[ ] Build the `/pipeline` page to manage high-value contacts.

&nbsp;   -   \[ ] Implement the "Add to Pipeline" functionality from the event detail page.



\### Milestone 5: Dashboard \& Polish (Est. 1-2 days)

\-   \[ ] Create a simple internal dashboard on the homepage showing key metrics (Total Contacts, Upcoming Events, etc.).

\-   \[ ] Thoroughly test all import/export formats and data integrity.

\-   \[ ] Review all workflows, fix bugs, and ensure a consistent UI/UX.

\-   \[ ] Deploy the application to Vercel.

