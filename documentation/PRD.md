\# Product Requirements Document (PRD)



\*\*Product Name:\*\* The Rolodex - Event \& Network Management Tool

\*\*Version:\*\* 1.1

\*\*Status:\*\* Revised Draft

\*\*Primary User:\*\* The Internal Events Team (e.g., Joshua)



\## 1. Introduction \& Background



The company runs high-touch, exclusive events to generate business and expand its network. This document outlines the requirements for "The Rolodex," a centralized \*\*internal tool\*\* to manage contacts, curate event guest lists, and track networking success. The primary workflow for external collaborators (like Haley "Zap" Zapolski and event hosts) will be managed via data exports (CSV files) generated from this tool.



\## 2. Problem Statement



Our current event management process is inefficient and prevents us from maximizing the value of our networking efforts.



\-   \*\*No Central Source of Truth:\*\* Contact information is scattered.

\-   \*\*Inconsistent Follow-up:\*\* High-value connections are not systematically nurtured.

\-   \*\*Difficult Guest List Curation:\*\* Creating targeted guest lists is a manual, time-consuming process.

\-   \*\*Lack of Measurable Metrics:\*\* We cannot easily answer key questions about event success and network growth.



\## 3. Goals \& Success Metrics



The primary goal is to systematize event management to drive business development and network growth.



| Goal                                      | Success Metric                                                                      |

| ----------------------------------------- | ----------------------------------------------------------------------------------- |

| \*\*Increase Efficiency\*\*                   | Reduce time spent creating targeted invite lists by 75% via filtering and exporting.  |

| \*\*Improve Follow-up Effectiveness\*\*       | Achieve a 100% follow-up rate for contacts marked as high-priority in the pipeline.   |

| \*\*Quantify Network Growth\*\*               | Track the number of "new connections" (first-time attendees) at each event.           |

| \*\*Enable Data-Driven Collaboration\*\*      | Seamlessly provide accurate, up-to-date CSV exports to Zap and hosts.                 |

| \*\*Create a Valuable, Reusable Asset\*\*     | Grow the central `contacts` database into a comprehensive and searchable rolodex.     |



\## 4. User Persona \& Workflow



\-   \*\*The Organizer (Internal User):\*\* This is the primary user of the application. They are responsible for:

&nbsp;   -   Maintaining the central contacts rolodex.

&nbsp;   -   Creating and managing events.

&nbsp;   -   Building guest lists for events.

&nbsp;   -   Tracking attendance and follow-ups.

&nbsp;   -   \*\*Generating exports\*\* for external collaborators.

&nbsp;   -   \*\*Importing new data\*\* to update the rolodex.



\-   \*\*The Collaborators (External):\*\*

&nbsp;   -   \*\*Invitation Manager (Zap):\*\* Receives a CSV export of the invite list (Name, Email, Company) to perform the email merge/send.

&nbsp;   -   \*\*Host:\*\* Receives a CSV export of their specific invitees to track their outreach and see who attended.



\## 5. Features \& User Stories (V1)



\### Core Data Management

\-   As an Organizer, I want to add, view, edit, search, and filter all contacts in our network.

\-   As an Organizer, I want to create, view, and edit events.

\-   As an Organizer, I want to build a guest list for an event by selecting contacts from the main rolodex.



\### \*\*Crucial Feature: Import/Export Functionality\*\*

\-   \*\*Import:\*\* As an Organizer, I want to \*\*bulk import new contacts from a CSV file\*\* to quickly populate the rolodex from sourced lists.

\-   \*\*Export (Invitations):\*\* As an Organizer, I want to \*\*export the guest list\*\* for a specific event to a CSV file (including Name, Email, Company) to give to Zap.

\-   \*\*Export (General):\*\* As an Organizer, I want to be able to \*\*export any filtered view\*\* of my contacts or event attendees to CSV for ad-hoc analysis.

\-   \*\*Export (Host Report):\*\* As an Organizer, I want to generate and \*\*export a CSV report for a specific host\*\*, showing who they invited and their final attendance status.



\### Event Day \& Post-Event

\-   As an Organizer, I want a simple check-in interface to mark the status of attendees as `Attended`.

\-   As an Organizer, I want the system to automatically flag "new connections" (first-time attendees).

\-   As an Organizer, I want to add internal follow-up notes to an attendee's profile after an event.



\### Relationship Pipeline

\-   As an Organizer, I want to promote high-value contacts into a separate internal "Relationship Pipeline" to track strategic follow-ups.



\## 6. Out of Scope for V1



\-   Any user accounts or logins for external collaborators (Hosts, Zap).

\-   Direct, in-app email sending capabilities.

\-   Public-facing event pages or RSVP forms.

