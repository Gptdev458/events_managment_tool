/**
 * Business Logic Functions for Events Management Tool
 * Contains reusable business rules and calculations
 */

import { Event, Contact, EventInvitation, RelationshipPipeline } from './database.types'

// Event-related business logic
export const EventBusinessLogic = {
  /**
   * Determines if an event is upcoming (within next 7 days)
   */
  isUpcoming(event: Event): boolean {
    if (!event.event_date) return false
    const eventDate = new Date(event.event_date)
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return eventDate >= now && eventDate <= weekFromNow
  },

  /**
   * Determines if an event is past
   */
  isPast(event: Event): boolean {
    if (!event.event_date) return false
    const eventDate = new Date(event.event_date)
    const now = new Date()
    
    return eventDate < now
  },

  /**
   * Gets event status with business rules
   */
  getEventStatus(event: Event): 'Draft' | 'Planning' | 'Ready' | 'In Progress' | 'Completed' | 'Cancelled' {
    if (event.status) return event.status as any
    
    // Auto-determine status based on date and invitations
    if (this.isPast(event)) return 'Completed'
    if (this.isUpcoming(event)) return 'Ready'
    return 'Planning'
  },

  /**
   * Calculates event metrics
   */
  getEventMetrics(invitations: EventInvitation[]) {
    const total = invitations.length
    const responded = invitations.filter(inv => ['RSVP_Yes', 'RSVP_No'].includes(inv.status)).length
    const attending = invitations.filter(inv => inv.status === 'RSVP_Yes').length
    const declined = invitations.filter(inv => inv.status === 'RSVP_No').length
    const pending = total - responded
    
    return {
      total,
      responded,
      attending,
      declined,
      pending,
      responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
      attendanceRate: total > 0 ? Math.round((attending / total) * 100) : 0
    }
  },

  /**
   * Validates event data
   */
  validateEvent(event: Partial<Event>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!event.name?.trim()) errors.push('Event name is required')
    if (!event.event_date) errors.push('Event date is required')
    if (!event.event_type) errors.push('Event type is required')
    
    if (event.event_date) {
      const eventDate = new Date(event.event_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (eventDate < today) {
        errors.push('Event date cannot be in the past')
      }
    }
    
    if (event.max_attendees && event.max_attendees < 1) {
      errors.push('Maximum attendees must be at least 1')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Contact-related business logic
export const ContactBusinessLogic = {
  /**
   * Gets contact display name with fallback
   */
  getDisplayName(contact: Contact): string {
    // If we have first_name, use first_name + last_name
    if (contact.first_name) {
      return `${contact.first_name} ${contact.last_name || ''}`.trim()
    }
    
    // Fall back to the name field if available
    if (contact.name) {
      return contact.name.trim()
    }
    
    // Fall back to email if available
    if (contact.email) {
      return contact.email
    }
    
    // Last resort fallback
    return 'Unknown Contact'
  },

  /**
   * Gets all email addresses for a contact (primary + additional)
   */
  getAllEmails(contact: Contact): string[] {
    const emails: string[] = []
    
    if (contact.email) {
      emails.push(contact.email)
    }
    
    if (contact.additional_emails && contact.additional_emails.length > 0) {
      emails.push(...contact.additional_emails)
    }
    
    return emails
  },

  /**
   * Gets the primary email address for a contact
   */
  getPrimaryEmail(contact: Contact): string | null {
    return contact.email || null
  },

  /**
   * Gets additional email addresses for a contact
   */
  getAdditionalEmails(contact: Contact): string[] {
    return contact.additional_emails || []
  },

  /**
   * Formats additional emails as a comma-separated string for form inputs
   */
  formatAdditionalEmailsForInput(contact: Contact): string {
    const additionalEmails = this.getAdditionalEmails(contact)
    return additionalEmails.join(', ')
  },

  /**
   * Checks if a contact has multiple email addresses
   */
  hasMultipleEmails(contact: Contact): boolean {
    const totalEmails = this.getAllEmails(contact).length
    return totalEmails > 1
  },

  /**
   * Gets email count for a contact
   */
  getEmailCount(contact: Contact): number {
    return this.getAllEmails(contact).length
  },

  /**
   * Checks if a contact has any email addresses
   */
  hasAnyEmails(contact: Contact): boolean {
    return this.getAllEmails(contact).length > 0
  },

  /**
   * Gets contact's professional title with company
   */
  getProfessionalTitle(contact: Contact): string {
    const parts: string[] = []
    
    if (contact.job_title) parts.push(contact.job_title)
    if (contact.company) parts.push(`at ${contact.company}`)
    
    return parts.join(' ') || 'No title specified'
  },

  /**
   * Validates contact data
   */
  validateContact(contact: Partial<Contact>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Ensure contact has either name or email for identification
    const hasName = contact.name?.trim()
    const hasEmail = contact.email?.trim()
    
    if (!hasName && !hasEmail) {
      errors.push('Contact must have either a name or email address')
    }
    
    // If email is provided, validate its format
    if (contact.email?.trim() && !this.isValidEmail(contact.email.trim())) {
      errors.push('Please enter a valid email address')
    }
    
    if (!contact.contact_type) {
      errors.push('Contact type is required')
    }
    
    if (contact.linkedin_url && !this.isValidLinkedInUrl(contact.linkedin_url)) {
      errors.push('Please enter a valid LinkedIn URL')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  /**
   * Validates LinkedIn URL format
   */
  isValidLinkedInUrl(url: string): boolean {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinRegex.test(url)
  },

  /**
   * Determines if contact is high-value based on criteria
   */
  isHighValueContact(contact: Contact): boolean {
    // High-value criteria:
    // 1. In CTO Club
    // 2. Senior title (contains CEO, CTO, VP, Director, etc.)
    // 3. Key contact type
    
    if (contact.is_in_cto_club) return true
    
    const seniorTitles = ['ceo', 'cto', 'cfo', 'coo', 'vp', 'director', 'head of', 'chief']
    const jobTitle = (contact.job_title || '').toLowerCase()
    const hasSeniorTitle = seniorTitles.some(title => jobTitle.includes(title))
    
    const keyContactTypes = ['Strategic Partner', 'Key Executive', 'Industry Leader']
    const isKeyContactType = keyContactTypes.includes(contact.contact_type)
    
    return hasSeniorTitle || isKeyContactType
  }
}

// Pipeline-related business logic
export const PipelineBusinessLogic = {
  /**
   * Gets next recommended action based on stage
   */
  getRecommendedNextAction(stage: string): string {
    const recommendations: Record<string, string> = {
      'Identified': 'Research company and role, find common connections',
      'Warm Lead': 'Send personalized outreach message or request introduction',
      'Active Discussion': 'Schedule follow-up meeting or call',
      'Partnership Pending': 'Finalize partnership terms and agreement',
      'Strategic Partner': 'Plan regular check-ins and collaboration opportunities'
    }
    
    return recommendations[stage] || 'Define next action step'
  },

  /**
   * Calculates days until next action
   */
  getDaysUntilNextAction(nextActionDate: string | null): number | null {
    if (!nextActionDate) return null
    
    const actionDate = new Date(nextActionDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    actionDate.setHours(0, 0, 0, 0)
    
    const diffTime = actionDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  /**
   * Determines if next action is overdue
   */
  isOverdue(nextActionDate: string | null): boolean {
    const days = this.getDaysUntilNextAction(nextActionDate)
    return days !== null && days < 0
  },

  /**
   * Gets urgency level for pipeline item
   */
  getUrgencyLevel(nextActionDate: string | null): 'low' | 'medium' | 'high' | 'overdue' {
    const days = this.getDaysUntilNextAction(nextActionDate)
    
    if (days === null) return 'low'
    if (days < 0) return 'overdue'
    if (days <= 1) return 'high'
    if (days <= 3) return 'medium'
    return 'low'
  },

  /**
   * Validates pipeline data
   */
  validatePipelineItem(item: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!item.contact_id) errors.push('Contact is required')
    if (!item.pipeline_stage) errors.push('Pipeline stage is required')
    
    if (item.next_action_date) {
      const actionDate = new Date(item.next_action_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (actionDate < today) {
        errors.push('Next action date should be today or in the future')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  /**
   * Gets pipeline stage progression order
   */
  getStageOrder(): string[] {
    return [
      'Identified',
      'Warm Lead', 
      'Active Discussion',
      'Partnership Pending',
      'Strategic Partner'
    ]
  },

  /**
   * Gets next stage in progression
   */
  getNextStage(currentStage: string): string | null {
    const order = this.getStageOrder()
    const currentIndex = order.indexOf(currentStage)
    
    if (currentIndex === -1 || currentIndex === order.length - 1) {
      return null
    }
    
    return order[currentIndex + 1]
  },

  /**
   * Calculates pipeline health score
   */
  calculatePipelineHealth(items: any[]): {
    score: number
    overdue: number
    actionableToday: number
    noNextAction: number
  } {
    const total = items.length
    const overdue = items.filter(item => this.isOverdue(item.next_action_date)).length
    const actionableToday = items.filter(item => {
      const days = this.getDaysUntilNextAction(item.next_action_date)
      return days === 0
    }).length
    const noNextAction = items.filter(item => !item.next_action_date).length
    
    // Health score calculation (0-100)
    let score = 100
    score -= (overdue / total) * 40 // -40 points for overdue items
    score -= (noNextAction / total) * 30 // -30 points for items without next action
    score = Math.max(0, Math.min(100, score))
    
    return {
      score: Math.round(score),
      overdue,
      actionableToday,
      noNextAction
    }
  }
}

// General utility functions
export const UtilityLogic = {
  /**
   * Formats date for display
   */
  formatDate(date: string | null, format: 'short' | 'long' = 'short'): string {
    if (!date) return 'No date'
    
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid date'
    
    if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  },

  /**
   * Formats relative time (e.g., "3 days ago", "in 2 days")
   */
  formatRelativeTime(date: string | null): string {
    if (!date) return 'No date'
    
    const d = new Date(date)
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1) return `In ${diffDays} days`
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
    
    return 'Unknown'
  },

  /**
   * Truncates text with ellipsis
   */
  truncateText(text: string | null, maxLength: number): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  },

  /**
   * Capitalizes first letter of each word
   */
  titleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
} 