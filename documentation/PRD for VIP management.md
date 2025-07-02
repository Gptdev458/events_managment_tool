\# Product Requirements Document (PRD): Strategic Relationship Management CRM



\*\*Version:\*\* 1.1

\*\*Status:\*\* Draft



---



\## 1. Introduction \& Vision



\### 1.1. Problem Statement

Our organization's success is heavily influenced by deep, strategic relationships with a select group of high-value individuals (VIPs). Current methods of managing these complex, long-term relationships are decentralized and inefficient, leading to missed opportunities. We lack a centralized, systematic way to track our value-add initiatives, measure relationship strength, and ensure consistent, purposeful engagement.



\### 1.2. Product Vision

To create a simple, powerful, and highly-specialized internal CRM that operationalizes our strategic relationship protocol. The application will be the single source of truth for our VIP relationships, enabling us to systematically nurture them, track mutual goals, and unlock significant value. It is designed as a tool for strategic action, not a passive database.



\### 1.3. Target Users

\*   \*\*The System Maintainer:\*\* The primary user responsible for data entry, creating profiles, tracking initiatives, and preparing for review meetings.

\*   \*\*The Strategist:\*\* The primary consumer of the information, responsible for reviewing relationship statuses, making strategic decisions, and executing on high-level initiatives.



---



\## 2. Guiding Principles



\*   \*\*Clarity over Clutter:\*\* Every feature must serve a direct purpose. Avoid generic CRM features.

\*   \*\*Action-Oriented:\*\* The design should prompt the question, "What is our next move?"

\*   \*\*Give-First Mentality:\*\* The UI/UX will prioritize and highlight "Give" initiatives, reinforcing our core philosophy.

\*   \*\*Living Document:\*\* The data is dynamic. The UI must make it easy to update profiles, goals, and initiatives as we learn more.



---



\## 3. Functional Requirements \& User Stories



\### 3.1. Main Dashboard / VIP List Page



The application's homepage, providing a high-level overview.



\*   \*\*UI Concept:\*\* A clean, full-width list or card view of all VIPs.

\*   \*\*User Stories:\*\*

&nbsp;   \*   As a user, I want to see a list of all VIPs on the homepage so I can quickly select one to view or manage.

&nbsp;   \*   As a user, I want each VIP in the list to display at-a-glance information: VIP Name, Title/Company, Date of Last Interaction, and a status indicator for active "Give" and "Ask" initiatives.

&nbsp;   \*   As a System Maintainer, I want a prominent "Add New VIP" button on this page.



\### 3.2. VIP Detail Page



The core of the application, accessed by clicking a VIP from the main dashboard. It will use a tabbed interface.



\#### 3.2.1. VIP Header

\*   \*\*UI Concept:\*\* A static header visible across all tabs for a specific VIP.

\*   \*\*Content:\*\* VIP Name, Photo (if available), current role/company.



\#### 3.2.2. Tab 1: Individual Dashboard (Default View)

\*   \*\*UI Concept:\*\* A summary view composed of "widgets" that pull key information from the other tabs.

\*   \*\*User Story:\*\* As a Strategist, when I open a VIP page, I want a dashboard that gives me a 30-second overview of the entire relationship, so I can get up to speed before a call or meeting.

\*   \*\*Widgets:\*\*

&nbsp;   \*   \*\*Our Goals with this VIP:\*\* A summary of our primary goals for the relationship (pulled from the Profile Tab).

&nbsp;   \*   \*\*Active Give Initiatives:\*\* A list of titles of all "Give" initiatives with a status of `Active` or `In Progress`.

&nbsp;   \*   \*\*Active Ask Initiatives:\*\* A list of titles of all "Ask" initiatives with a status of `Active` or `In Progress`.

&nbsp;   \*   \*\*Upcoming Activities:\*\* A list of the next 3-5 scheduled key activities (from the Activity Log).



\#### 3.2.3. Tab 2: Profile

\*   \*\*UI Concept:\*\* A structured, editable page to capture the essence of the VIP. This is a dynamic summary, not a static bio.

\*   \*\*User Story:\*\* As a System Maintainer, I want to create and continuously update a rich profile for each VIP, so we have a deep understanding of their motivations, needs, and how we can best add value.

\*   \*\*Sections:\*\*

&nbsp;   \*   \*\*Relationship Summary (Rich Text):\*\* A free-form text area for a qualitative summary. \*Prompt: "Our current standing, history, communication style, and key personality traits."\*

&nbsp;   \*   \*\*Key Insights (Structured \& Tag-based):\*\*

&nbsp;       \*   \*\*Interests \& Focus Areas (Tag-based):\*\* A list of tags or short phrases. \*Examples: `Charity: Education`, `Policy: Tech Lobbying`, `Investment: Startups`, `Hobby: Sailing`.\*

&nbsp;       \*   \*\*Current Projects \& Ventures (Bulleted List):\*\* A simple, editable list of the VIP's active endeavors. \*Examples: `New role at Built Co.`, `Exploring EdTech startup idea`, `Nonprofit board seat`.\*

&nbsp;       \*   \*\*Goals \& Aspirations (Bulleted List):\*\* A list of the VIP's known professional and personal goals.

&nbsp;   \*   \*\*Our Goals for/with VIP (Bulleted List):\*\* A clear list of what we want to \*do for\* them and \*achieve with\* them.



\#### 3.2.4. Tab 3: Give

\*   \*\*UI Concept:\*\* A list of "Give Initiatives." Each initiative is a container for related tasks.

\*   \*\*User Story:\*\* As a System Maintainer, I want to create a "Give" initiative (e.g., "Support interest in Educators Collaborative") and add specific, actionable tasks under it, so we can systematically track our value-add efforts.

\*   \*\*Data Structure for an Initiative:\*\*

&nbsp;   \*   \*\*Title:\*\* (e.g., "Support Lobbying for New Tech")

&nbsp;   \*   \*\*Description:\*\* Brief on the "why" of this initiative.

&nbsp;   \*   \*\*Status:\*\* `Active`, `On Hold`, `Completed`, `Archived`.

&nbsp;   \*   \*\*Associated Tasks (A sub-list):\*\* The multi-step action plan. Each task will have:

&nbsp;       \*   \*\*Task Name:\*\* (e.g., "Connect with industry expert," "Provide research on topic X")

&nbsp;       \*   \*\*Status:\*\* `To-Do`, `In Progress`, `Done`, `Cancelled`.

&nbsp;       \*   \*\*Due Date:\*\* (Optional).

&nbsp;       \*   \*\*Outcome/Notes:\*\* Text field to log the result.



\#### 3.2.5. Tab 4: Ask

\*   \*\*UI Concept:\*\* Functions identically to the "Give" tab but for tracking requests \*we\* make of the VIP.

\*   \*\*User Story:\*\* As a Strategist, I want to clearly define our "Asks" as strategic initiatives, ensuring they are well-timed and linked to the value we've provided.

\*   \*\*Data Structure:\*\* Identical to a "Give" Initiative.



\#### 3.2.6. Tab 5: Activity Log

\*   \*\*UI Concept:\*\* A reverse-chronological list of all significant interactions and planned key events.

\*   \*\*User Story:\*\* As a System Maintainer, I want to log every significant interaction and plan future touchpoints in a simple list, so we have a complete historical record and can ensure consistency.

\*   \*\*Data for each Log Entry:\*\*

&nbsp;   \*   \*\*Date:\*\*

&nbsp;   \*   \*\*Type:\*\* `Meeting`, `Call`, `Email`, `Event`, `Info Share`, `Future Touchpoint`.

&nbsp;   \*   \*\*Summary:\*\* A one-line description.

&nbsp;   \*   \*\*Notes/Outcome:\*\* Detailed notes.

&nbsp;   \*   \*\*Link to Initiative:\*\* (Optional) Ability to link this activity to a specific "Give" or "Ask" initiative.



---



\## 4. Non-Functional Requirements



\*   \*\*Technology Stack:\*\* Next.js, React.

\*   \*\*Database:\*\* Supabase.

\*   \*\*Authentication:\*\* \*\*No authentication for MVP.\*\* The application will be accessible via a direct, private URL.

\*   \*\*UI/UX:\*\* Clean, minimalist, and fast. The interface should feel like a premium, bespoke tool. Fully responsive for use on desktop and tablet.

\*   \*\*Deployment:\*\* Vercel or a similar platform.



---



\## 5. Success Metrics (for the Software)



\*   \*\*Adoption Rate:\*\* The system is used consistently for relationship management and review sessions.

\*   \*\*Data Freshness:\*\* The "Last Interaction Date" for active VIPs is updated regularly.

\*   \*\*Task Completion Rate:\*\* A high percentage of tasks within active initiatives are moved from `To-Do` to `Done`.

\*   \*\*Qualitative Feedback:\*\* Users feel more organized, in control, and strategic about their VIP relationships.



---



\## 6. Future Considerations (Out of Scope for V1)



\*   \*\*Authentication:\*\* A simple login system for authorized users.

\*   \*\*Global Reporting:\*\* A cross-VIP dashboard aggregating metrics.

\*   \*\*Notifications:\*\* Email reminders for upcoming due dates or scheduled touchpoints.

\*   \*\*Full Calendar Integration:\*\* Syncing key activities with external calendars.

\*   \*\*File Attachments:\*\* Attaching relevant documents to initiatives or activity logs.

