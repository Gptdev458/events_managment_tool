// Utility for automatically updating pipeline stages based on next actions

import { PIPELINE_STAGES } from './constants'
import { CTO_PIPELINE_STATUSES } from './cto-club-constants'

// Mapping for Event Management Pipeline (relationship building)
export const RELATIONSHIP_ACTION_TO_STAGE_MAP: Record<string, string> = {
  // Initial Outreach
  'Connect on LinkedIn': 'Initial Outreach',
  'Send thank you note': 'Initial Outreach',
  'Send first catch-up email': 'Initial Outreach',
  
  // Forming the Relationship
  'Second catch-up email': 'Forming the Relationship',
  'Schedule small 1:1 call': 'Forming the Relationship',
  'Schedule coffee meetup': 'Forming the Relationship',
  'Share something via email': 'Forming the Relationship',
  
  // Maintaining the Relationship  
  'Schedule dinner': 'Maintaining the Relationship',
  'Follow up call': 'Maintaining the Relationship',
  'Send valuable insight': 'Maintaining the Relationship',
  'Ask if they need any help/introduction': 'Maintaining the Relationship',
}

// Mapping for CTO Club Pipeline
export const CTO_ACTION_TO_STATUS_MAP: Record<string, string> = {
  // Initial contact actions → In Progress
  'Initial outreach email': 'in progress',
  'Follow-up email': 'in progress',
  
  // Scheduling and response actions → Awaiting Response
  'Schedule intro call': 'awaiting response',
  'Send CTO Club information': 'awaiting response',
  
  // Advanced actions → Ready for Next Step
  'Schedule CTO Club visit': 'ready for next step',
  'Present membership proposal': 'ready for next step',
  'Follow up on proposal': 'ready for next step',
  'Complete onboarding': 'ready for next step',
  
  // Other actions remain at current status
  'Other (specify in notes)': '', // Will keep current status
}

/**
 * Auto-updates pipeline stage based on selected next action for relationship pipeline
 */
export function getUpdatedRelationshipStage(
  currentStage: string,
  nextAction: string
): string {
  const suggestedStage = RELATIONSHIP_ACTION_TO_STAGE_MAP[nextAction]
  
  if (!suggestedStage) {
    return currentStage // No mapping found, keep current stage
  }
  
  // Change to whatever stage matches the action (can go forward or backward)
  return suggestedStage
}

/**
 * Auto-updates CTO pipeline status based on selected next action
 */
export function getUpdatedCtoStatus(
  currentStatus: string,
  nextAction: string
): string {
  const suggestedStatus = CTO_ACTION_TO_STATUS_MAP[nextAction]
  
  if (!suggestedStatus || suggestedStatus === '') {
    return currentStatus // No mapping found or empty mapping, keep current status
  }
  
  // Change to whatever status matches the action (can go forward or backward)
  return suggestedStatus
} 