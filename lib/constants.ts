// Contact Types - Updated categories
export const CONTACT_TYPES = [
  { value: 'guest', label: 'Guest' },
  { value: 'target_guest', label: 'Target Guest' },
  { value: 'host', label: 'Host' },
  { value: 'established_connection', label: 'Established Connection' },
  { value: 'vip', label: 'VIP' },
  { value: 'potential_cto_club_member', label: 'Potential CTO Club Member' },
  { value: 'cto_club_member', label: 'CTO Club Member' },
] as const

// Contact Areas - Business domains
export const CONTACT_AREAS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'founders', label: 'Founders' },
  { value: 'product', label: 'Product' },
] as const

// Event Types - Updated categories
export const EVENT_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'startup', label: 'Startup' },
  { value: 'cto_club', label: 'CTO Club' },
] as const

// Event Statuses - from database schema
export const EVENT_STATUSES = [
  { value: 'Planning', label: 'Planning' },
  { value: 'Invitations Sent', label: 'Invitations Sent' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const

// Invitation Statuses - from database schema
export const INVITATION_STATUSES = [
  { value: 'Sourced', label: 'Sourced' },
  { value: 'Invited', label: 'Invited' },
  { value: 'RSVP_Yes', label: 'RSVP Yes' },
  { value: 'RSVP_No', label: 'RSVP No' },
  { value: 'Attended', label: 'Attended' },
  { value: 'No Show', label: 'No Show' },
] as const

// Pipeline Stages - for relationship building journey
export const PIPELINE_STAGES = [
  { value: 'Initial Outreach', label: 'Initial Outreach' },
  { value: 'Forming the Relationship', label: 'Forming the Relationship' },
  { value: 'Maintaining the Relationship', label: 'Maintaining the Relationship' },
] as const

// Follow-up Actions - organized by relationship stage
export const FOLLOW_UP_ACTIONS = {
  'initial-outreach': {
    label: 'Initial Outreach',
    actions: [
      'Connect on LinkedIn',
      'Send thank you note',
      'Send first catch-up email'
    ]
  },
  'forming-relationship': {
    label: 'Forming the Relationship',
    actions: [
      'Second catch-up email',
      'Schedule small 1:1 call',
      'Schedule coffee meetup',
      'Share something via email',
      'Schedule dinner'
    ]
  },
  'maintaining-relationship': {
    label: 'Maintaining the Relationship',
    actions: [
      'Follow up call',
      'Send valuable insight',
      'Ask if they need any help/introduction',
      'Schedule dinner'
    ]
  }
} as const

// Type exports for TypeScript
export type ContactType = typeof CONTACT_TYPES[number]['value']
export type ContactAreaType = typeof CONTACT_AREAS[number]['value']
export type EventType = typeof EVENT_TYPES[number]['value']
export type EventStatus = typeof EVENT_STATUSES[number]['value']
export type InvitationStatus = typeof INVITATION_STATUSES[number]['value']
export type PipelineStage = typeof PIPELINE_STAGES[number]['value']
export type FollowUpActionCategory = keyof typeof FOLLOW_UP_ACTIONS