export const CTO_PIPELINE_STATUSES = [
  { value: 'not started', label: 'Not Started' },
  { value: 'in progress', label: 'In Progress' },
  { value: 'awaiting response', label: 'Awaiting Response' },
  { value: 'ready for next step', label: 'Ready for Next Step' },
] as const

export const CTO_NEXT_ACTIONS = [
  'Initial outreach email',
  'Follow-up email',
  'Schedule intro call',
  'Send CTO Club information',
  'Schedule CTO Club visit',
  'Present membership proposal',
  'Follow up on proposal',
  'Complete onboarding',
  'Other (specify in notes)',
] as const 