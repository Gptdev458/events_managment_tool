// Utility for pipeline stage visual styling and distinction

import { PIPELINE_STAGES } from './constants'
import { CTO_PIPELINE_STATUSES } from './cto-club-constants'

/**
 * Get visual styling for relationship pipeline stages
 */
export function getRelationshipStageStyle(stage: string) {
  const baseClasses = "flex items-center gap-2 font-medium"
  
  switch (stage) {
    case 'Initial Outreach':
      return {
        classes: `${baseClasses} text-blue-700`,
        bgColor: 'bg-blue-50',
        dotColor: 'bg-blue-400',
        borderColor: 'border-blue-300'
      }
    case 'Forming the Relationship':
      return {
        classes: `${baseClasses} text-amber-700`,
        bgColor: 'bg-amber-50',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-300'
      }
    case 'Maintaining the Relationship':
      return {
        classes: `${baseClasses} text-emerald-700`,
        bgColor: 'bg-emerald-50',
        dotColor: 'bg-emerald-400',
        borderColor: 'border-emerald-300'
      }
    default:
      return {
        classes: `${baseClasses} text-gray-700`,
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-400',
        borderColor: 'border-gray-300'
      }
  }
}

/**
 * Get visual styling for CTO club pipeline statuses
 */
export function getCtoStatusStyle(status: string) {
  const baseClasses = "flex items-center gap-2 font-medium"
  
  switch (status) {
    case 'not started':
      return {
        classes: `${baseClasses} text-gray-700`,
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-400',
        borderColor: 'border-gray-300'
      }
    case 'in progress':
      return {
        classes: `${baseClasses} text-blue-700`,
        bgColor: 'bg-blue-50',
        dotColor: 'bg-blue-400',
        borderColor: 'border-blue-300'
      }
    case 'awaiting response':
      return {
        classes: `${baseClasses} text-amber-700`,
        bgColor: 'bg-amber-50',
        dotColor: 'bg-amber-400',
        borderColor: 'border-amber-300'
      }
    case 'ready for next step':
      return {
        classes: `${baseClasses} text-green-700`,
        bgColor: 'bg-green-50',
        dotColor: 'bg-green-400',
        borderColor: 'border-green-300'
      }
    default:
      return {
        classes: `${baseClasses} text-gray-700`,
        bgColor: 'bg-gray-100',
        dotColor: 'bg-gray-400',
        borderColor: 'border-gray-300'
      }
  }
}

/**
 * Get progression level for relationship stages (1-7)
 */
export function getRelationshipStageLevel(stage: string): number {
  const stageIndex = PIPELINE_STAGES.findIndex(s => s.value === stage)
  return stageIndex >= 0 ? stageIndex + 1 : 1
}

/**
 * Get progression level for CTO statuses (1-4)
 */
export function getCtoStatusLevel(status: string): number {
  const statusIndex = CTO_PIPELINE_STATUSES.findIndex(s => s.value === status)
  return statusIndex >= 0 ? statusIndex + 1 : 1
} 