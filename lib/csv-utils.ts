/**
 * CSV Import/Export Utilities for Events Management Tool
 * Handles data transformation between database formats and CSV
 */

import { Contact, Event, EventInvitation, RelationshipPipeline } from './database.types'
import { ContactBusinessLogic, EventBusinessLogic, UtilityLogic } from './business-logic'
import Papa from 'papaparse'

// CSV Export Functions
export const CSVExport = {
  /**
   * Exports contacts to CSV format
   */
  exportContacts(contacts: Contact[]): string {
    const headers = [
      'Name',
      'Email',
      'Additional Emails',
      'Company',
      'Job Title',
      'Contact Type',
      'Area',
      'LinkedIn URL',
      'In CTO Club',
      'Current Projects',
      'Goals & Aspirations',
      'Our Strategic Goals',
      'General Notes',
      'Created Date'
    ]

    const rows = contacts.map(contact => [
      ContactBusinessLogic.getDisplayName(contact),
      contact.email || '',
      ContactBusinessLogic.formatAdditionalEmailsForInput(contact),
      contact.company || '',
      contact.job_title || '',
      contact.contact_type || '',
      contact.area || '',
      contact.linkedin_url || '',
      contact.is_in_cto_club ? 'Yes' : 'No',
      Array.isArray(contact.current_projects) ? contact.current_projects.join(', ') : (contact.current_projects || ''),
      Array.isArray(contact.goals_aspirations) ? contact.goals_aspirations.join(', ') : (contact.goals_aspirations || ''),
      Array.isArray(contact.our_strategic_goals) ? contact.our_strategic_goals.join(', ') : (contact.our_strategic_goals || ''),
      (contact.general_notes || '').replace(/"/g, '""'), // Escape quotes
      UtilityLogic.formatDate(contact.created_at)
    ])

    return this.arrayToCSV([headers, ...rows])
  },

  /**
   * Exports events to CSV format
   */
  exportEvents(events: Event[]): string {
    const headers = [
      'Event Name',
      'Event Type',
      'Event Date',
      'Location',
      'Description',
      'Max Attendees',
      'Status',
      'Created Date'
    ]

    const rows = events.map(event => [
      event.name,
      event.event_type,
      UtilityLogic.formatDate(event.event_date, 'long'),
      event.location || '',
      (event.description || '').replace(/"/g, '""'),
      event.max_attendees?.toString() || '',
      event.status || 'Planning',
      UtilityLogic.formatDate(event.created_at)
    ])

    return this.arrayToCSV([headers, ...rows])
  },

  /**
   * Exports event invitations with contact details
   */
  exportEventInvitations(invitations: (EventInvitation & { 
    contacts: Contact, 
    events: Event 
  })[]): string {
    const headers = [
      'Event Name',
      'Contact Name',
      'Contact Email',
      'Company',
      'Job Title',
      'Invitation Status',
      'Is New Connection',
      'Follow-up Notes',
      'Invited By'
    ]

    const rows = invitations.map(invitation => [
      invitation.events.name,
      ContactBusinessLogic.getDisplayName(invitation.contacts),
      invitation.contacts.email || '',
      invitation.contacts.company || '',
      invitation.contacts.job_title || '',
      invitation.status,
      invitation.is_new_connection ? 'Yes' : 'No',
      (invitation.follow_up_notes || '').replace(/"/g, '""'),
      invitation.invited_by_host_id || 'System'
    ])

    return this.arrayToCSV([headers, ...rows])
  },

  /**
   * Exports pipeline data with contact details
   */
  exportPipeline(pipeline: (RelationshipPipeline & { contacts: Contact })[]): string {
    const headers = [
      'Contact Name',
      'Contact Email',
      'Company',
      'Job Title',
      'Pipeline Stage',
      'Next Action',
      'Next Action Date',
      'Days Until Action',
      'Is High Value'
    ]

    const rows = pipeline.map(item => [
      ContactBusinessLogic.getDisplayName(item.contacts),
      item.contacts.email || '',
      item.contacts.company || '',
      item.contacts.job_title || '',
      item.pipeline_stage,
      item.next_action_description || '',
      UtilityLogic.formatDate(item.next_action_date),
      this.getDaysUntilAction(item.next_action_date),
      ContactBusinessLogic.isHighValueContact(item.contacts) ? 'Yes' : 'No'
    ])

    return this.arrayToCSV([headers, ...rows])
  },

  /**
   * Helper to calculate days until action for CSV
   */
  getDaysUntilAction(date: string | null): string {
    if (!date) return 'No date set'
    
    const actionDate = new Date(date)
    const today = new Date()
    const diffTime = actionDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `${diffDays} days`
  },

  /**
   * Converts 2D array to CSV string
   */
  arrayToCSV(data: string[][]): string {
    return data
      .map(row => 
        row.map(field => {
          // Escape fields containing commas, quotes, or newlines
          if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return `"${field.replace(/"/g, '""')}"`
          }
          return field
        }).join(',')
      )
      .join('\n')
  },

  /**
   * Triggers browser download of CSV data
   */
  downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}

// CSV Import Functions
export const CSVImport = {
  /**
   * Parses CSV string into 2D array
   */
  parseCSV(csvText: string): string[][] {
    const lines = csvText.split('\n')
    const result: string[][] = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const row: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        
        if (char === '"') {
          if (inQuotes && line[j + 1] === '"') {
            // Escaped quote
            current += '"'
            j++ // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          row.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      // Add final field
      row.push(current.trim())
      result.push(row)
    }
    
    return result
  },

  /**
   * Validates and processes contact import data
   */
  processContactsImport(csvData: string[][]): {
    valid: Contact[]
    errors: { row: number; errors: string[] }[]
    summary: { total: number; valid: number; errors: number }
  } {
    if (csvData.length === 0) {
      return { valid: [], errors: [], summary: { total: 0, valid: 0, errors: 0 } }
    }

    const headers = csvData[0].map(h => h.toLowerCase().trim())
    const dataRows = csvData.slice(1)
    
    // Map headers to indices for flexible parsing
    const headerMap: Record<number, string> = {}

    // Map CSV headers to our field names
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '')
      
      // More flexible header matching
      if (normalizedHeader === 'name' || normalizedHeader === 'fullname' || normalizedHeader === 'contactname') {
        headerMap[index] = 'name'
      } else if (normalizedHeader === 'email' || normalizedHeader === 'emailaddress' || normalizedHeader === 'primaryemail') {
        headerMap[index] = 'email'
      } else if (normalizedHeader.includes('additional') && normalizedHeader.includes('email')) {
        headerMap[index] = 'additional_emails'
      } else if (normalizedHeader === 'company' || normalizedHeader === 'organization' || normalizedHeader === 'employer') {
        headerMap[index] = 'company'
      } else if (normalizedHeader === 'jobtitle' || normalizedHeader === 'title' || normalizedHeader === 'position' || normalizedHeader === 'role') {
        headerMap[index] = 'job_title'
      } else if (normalizedHeader === 'contacttype' || normalizedHeader === 'type' || normalizedHeader === 'category') {
        headerMap[index] = 'contact_type'
      } else if (normalizedHeader === 'area' || normalizedHeader === 'contactarea' || normalizedHeader === 'specialization') {
        headerMap[index] = 'area'
      } else if (normalizedHeader === 'linkedinurl' || normalizedHeader === 'linkedin' || normalizedHeader === 'linkedinprofile') {
        headerMap[index] = 'linkedin_url'
      } else if (normalizedHeader.includes('cto') || normalizedHeader.includes('club')) {
        headerMap[index] = 'is_in_cto_club'
      } else if (normalizedHeader.includes('current') && normalizedHeader.includes('project')) {
        headerMap[index] = 'current_projects'
      } else if (normalizedHeader.includes('goal') && normalizedHeader.includes('aspiration')) {
        headerMap[index] = 'goals_aspirations'
      } else if (normalizedHeader.includes('strategic') && normalizedHeader.includes('goal')) {
        headerMap[index] = 'our_strategic_goals'
      } else if (normalizedHeader.includes('note') || normalizedHeader === 'generalnotes' || normalizedHeader === 'comments') {
        headerMap[index] = 'general_notes'
      }
    })

    // Debug logging
    console.log('CSV Headers:', headers)
    console.log('Header Map:', headerMap)

    const validContacts: Contact[] = []
    const errors: { row: number; errors: string[] }[] = []

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because arrays are 0-indexed and we skipped header
      const contact: Partial<Contact> = {}
      const rowErrors: string[] = []

      // Get field values using the header map
      const getFieldValue = (fieldName: string): string | undefined => {
        const headerIndex = Object.keys(headerMap).find(key => headerMap[Number(key)] === fieldName)
        return headerIndex !== undefined ? (row[Number(headerIndex)] || '') : undefined
      }

      // Extract and validate fields
      const name = getFieldValue('name')?.trim()
      const email = getFieldValue('email')?.trim() || null
      
      // Basic validation
      if (!name && !email) {
        rowErrors.push('Contact must have either a name or email address')
        return
      }

      if (email && !isValidEmail(email)) {
        rowErrors.push(`Invalid email format: ${email}`)
        return
      }

      // Set contact fields
      contact.name = name || undefined
      contact.email = email
      contact.company = getFieldValue('company')?.trim() || undefined
      contact.job_title = getFieldValue('job_title')?.trim() || undefined
      contact.contact_type = getFieldValue('contact_type')?.trim() || 'prospect'
      
      // Handle area field with enum validation
      const areaStr = getFieldValue('area')?.trim().toLowerCase()
      contact.area = (areaStr && ['engineering', 'founders', 'product'].includes(areaStr)) ? areaStr as any : undefined
      
      contact.linkedin_url = getFieldValue('linkedin_url')?.trim() || undefined
      contact.general_notes = getFieldValue('general_notes')?.trim() || undefined
      
      // Handle boolean field
      const inCtoClubStr = getFieldValue('is_in_cto_club')?.trim().toLowerCase()
      contact.is_in_cto_club = inCtoClubStr === 'yes' || inCtoClubStr === 'true' || inCtoClubStr === '1'

      // Skip validation since we're doing it inline above

      // Additional import-specific validations
      if (rowErrors.length > 0) {
        errors.push({ row: rowNumber, errors: rowErrors })
      } else {
        validContacts.push(contact as Contact)
      }
    })

    return {
      valid: validContacts,
      errors,
      summary: {
        total: Math.max(0, dataRows.length), // Total data rows (excluding header)
        valid: validContacts.length,
        errors: errors.length
      }
    }
  },

  /**
   * Helper to find header index by possible names
   */
  findHeader(headers: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = headers.findIndex(h => h.includes(name))
      if (index !== -1) return index
    }
    return -1
  },

  /**
   * Validates file before processing
   */
  validateCSVFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return { valid: false, error: 'Please select a CSV file' }
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 5MB' }
    }

    return { valid: true }
  },

  /**
   * Reads file as text
   */
  async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = (e) => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}

// Template Generation
export const CSVTemplates = {
  /**
   * Generates a CSV template for contacts with sample data
   */
  generateContactsTemplate(): string {
    const headers = [
      'Name',
      'Email',
      'Additional Emails',
      'Company',
      'Job Title',
      'Contact Type',
      'Area',
      'LinkedIn URL',
      'In CTO Club',
      'Current Projects',
      'Goals & Aspirations',
      'Our Strategic Goals',
      'General Notes'
    ]

    const sampleData = [
      [
        'John Smith',
        'john@techcorp.com',
        'j.smith@gmail.com',
        'TechCorp Inc',
        'CTO',
        'cto_club_member',
        'engineering',
        'https://linkedin.com/in/johnsmith',
        'Yes',
        'AI Platform, Mobile App',
        'Scale engineering team, Implement DevOps',
        'Digital transformation, Cloud migration',
        'Met at TechConf 2024, very interested in our AI solutions'
      ],
      [
        'Sarah Johnson',
        'sarah@startup.io',
        '',
        'Startup.io',
        'Founder & CEO',
        'target_guest',
        'founders',
        'https://linkedin.com/in/sarahjohnson',
        'No',
        'SaaS Platform, Fundraising',
        'Raise Series A, Product-market fit',
        'Strategic partnerships, Market expansion',
        'Potential partnership opportunity'
      ],
      [
        'Mike Chen',
        'mike@productco.com',
        'mike.chen@personal.com',
        'ProductCo',
        'Head of Product',
        'established_connection',
        'product',
        'https://linkedin.com/in/mikechen',
        'Yes',
        'User Analytics, A/B Testing',
        'Improve user engagement, Data-driven decisions',
        'Product innovation, User experience',
        'Expert in product analytics, potential speaker'
      ]
    ]

    return CSVExport.arrayToCSV([headers, ...sampleData])
  },

  /**
   * Downloads contacts template
   */
  downloadContactsTemplate(): void {
    const template = this.generateContactsTemplate()
    CSVExport.downloadCSV(template, 'contacts_import_template.csv')
  }
}

// CSV headers (in the order they should appear)
export const CSV_HEADERS = [
  'name',
  'email',
  'additional_emails',
  'company',
  'job_title',
  'contact_type',
  'area',
  'linkedin_url',
  'is_in_cto_club',
  'current_projects',
  'goals_aspirations',
  'our_strategic_goals',
  'general_notes'
] as const

/**
 * Converts a contact object to CSV row format
 */
export function contactToCSVRow(contact: Contact): string[] {
  return [
    ContactBusinessLogic.getDisplayName(contact),
    contact.email || '',
    ContactBusinessLogic.formatAdditionalEmailsForInput(contact),
    contact.company || '',
    contact.job_title || '',
    contact.contact_type || '',
    contact.area || '',
    contact.linkedin_url || '',
    contact.is_in_cto_club ? 'Yes' : 'No',
    Array.isArray(contact.current_projects) ? contact.current_projects.join(', ') : (contact.current_projects || ''),
    Array.isArray(contact.goals_aspirations) ? contact.goals_aspirations.join(', ') : (contact.goals_aspirations || ''),
    Array.isArray(contact.our_strategic_goals) ? contact.our_strategic_goals.join(', ') : (contact.our_strategic_goals || ''),
    (contact.general_notes || '').replace(/"/g, '""') // Escape quotes
  ]
}

export function parseCSVToContacts(csvContent: string): {
  valid: Contact[]
  errors: { row: number; errors: string[] }[]
  summary: { total: number; valid: number; errors: number }
} {
  const lines = csvContent.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    return {
      valid: [],
      errors: [{ row: 1, errors: ['CSV file is empty or has no data rows'] }],
      summary: { total: 0, valid: 0, errors: 1 }
    }
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
  const headerMap: Record<number, string> = {}
  
  // Map CSV headers to our field names
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // More flexible header matching
    if (normalizedHeader === 'name' || normalizedHeader === 'fullname' || normalizedHeader === 'contactname') {
      headerMap[index] = 'name'
    } else if (normalizedHeader === 'email' || normalizedHeader === 'emailaddress' || normalizedHeader === 'primaryemail') {
      headerMap[index] = 'email'
    } else if (normalizedHeader.includes('additional') && normalizedHeader.includes('email')) {
      headerMap[index] = 'additional_emails'
    } else if (normalizedHeader === 'company' || normalizedHeader === 'organization' || normalizedHeader === 'employer') {
      headerMap[index] = 'company'
    } else if (normalizedHeader === 'jobtitle' || normalizedHeader === 'title' || normalizedHeader === 'position' || normalizedHeader === 'role') {
      headerMap[index] = 'job_title'
    } else if (normalizedHeader === 'contacttype' || normalizedHeader === 'type' || normalizedHeader === 'category') {
      headerMap[index] = 'contact_type'
    } else if (normalizedHeader === 'area' || normalizedHeader === 'contactarea' || normalizedHeader === 'specialization') {
      headerMap[index] = 'area'
    } else if (normalizedHeader === 'linkedinurl' || normalizedHeader === 'linkedin' || normalizedHeader === 'linkedinprofile') {
      headerMap[index] = 'linkedin_url'
    } else if (normalizedHeader.includes('cto') || normalizedHeader.includes('club')) {
      headerMap[index] = 'is_in_cto_club'
    } else if (normalizedHeader.includes('current') && normalizedHeader.includes('project')) {
      headerMap[index] = 'current_projects'
    } else if (normalizedHeader.includes('goal') && normalizedHeader.includes('aspiration')) {
      headerMap[index] = 'goals_aspirations'
    } else if (normalizedHeader.includes('strategic') && normalizedHeader.includes('goal')) {
      headerMap[index] = 'our_strategic_goals'
    } else if (normalizedHeader.includes('note') || normalizedHeader === 'generalnotes' || normalizedHeader === 'comments') {
      headerMap[index] = 'general_notes'
    }
  })

  // Debug logging
  console.log('CSV Headers:', headers)
  console.log('Header Map:', headerMap)

  const validContacts: Contact[] = []
  const errors: { row: number; errors: string[] }[] = []
  
  try {
    const records = Papa.parse<string[]>(csvContent, {
      header: false,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"'
    })

    if (records.errors.length > 0) {
      errors.push(...records.errors.map((err: any, index: number) => ({
        row: index + 1,
        errors: [`Parse error: ${err.message}`]
      })))
    }

    const rows = records.data
    if (rows.length === 0) {
      return {
        valid: [],
        errors: [{ row: 1, errors: ['CSV file is empty'] }],
        summary: { total: 0, valid: 0, errors: 1 }
      }
    }

    const dataRows = rows.slice(1)

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because we skip header and use 1-based indexing
      const rowErrors: string[] = []
      
      try {
        // Get field values using the header map
        const getFieldValue = (fieldName: string): string | undefined => {
          const headerIndex = Object.keys(headerMap).find(key => headerMap[Number(key)] === fieldName)
          return headerIndex !== undefined ? getCellValue(row, Number(headerIndex)) : undefined
        }

        // Handle email (now optional)
        const email = getFieldValue('email')?.trim() || null

        // Validate email format if provided
        if (email && !isValidEmail(email)) {
          rowErrors.push(`Invalid email format: ${email}`)
        }

        // Handle name
        const name = getFieldValue('name')?.trim()
        
        // If no name and no email, this contact cannot be identified
        if (!name && !email) {
          rowErrors.push('Contact must have either a name or email address')
        }

        // Handle additional emails
        const additionalEmailsStr = getFieldValue('additional_emails')?.trim()
        let additionalEmails: string[] | null = null
        
        if (additionalEmailsStr) {
          const emails = additionalEmailsStr.split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0)
          
          // Validate each additional email
          for (const additionalEmail of emails) {
            if (!isValidEmail(additionalEmail)) {
              rowErrors.push(`Invalid additional email format: ${additionalEmail}`)
            }
          }
          
          additionalEmails = emails.length > 0 ? emails : null
        }

        // Parse contact type with default
        const contactType = getFieldValue('contact_type')?.trim() || 'prospect'
        
        // Parse area field
        const areaStr = getFieldValue('area')?.trim().toLowerCase()
        let area: string | null = null
        if (areaStr && ['engineering', 'founders', 'product'].includes(areaStr)) {
          area = areaStr
        }
        
        // Parse LinkedIn URL
        let linkedinUrl = getFieldValue('linkedin_url')?.trim()
        if (linkedinUrl && !isValidUrl(linkedinUrl)) {
          rowErrors.push(`Invalid LinkedIn URL format: ${linkedinUrl}`)
        }

        // Parse boolean fields
        const inCtoClubStr = getFieldValue('is_in_cto_club')?.trim().toLowerCase()
        const inCtoClub = inCtoClubStr === 'yes' || inCtoClubStr === 'true' || inCtoClubStr === '1'

        // Parse array fields (projects and goals)
        const parseArrayField = (value: string | undefined): string[] | null => {
          if (!value?.trim()) return null
          return value.split(',').map(item => item.trim()).filter(item => item.length > 0)
        }

        const currentProjects = parseArrayField(getFieldValue('current_projects'))
        const goalsAspirations = parseArrayField(getFieldValue('goals_aspirations'))
        const ourStrategicGoals = parseArrayField(getFieldValue('our_strategic_goals'))

        // If there are validation errors, add them to the errors array
        if (rowErrors.length > 0) {
          errors.push({ row: rowNumber, errors: rowErrors })
        } else {
          // Create the contact object
          const contact: Partial<Contact> = {
            name: name || undefined,
            email,
            additional_emails: additionalEmails,
            company: getFieldValue('company')?.trim() || undefined,
            job_title: getFieldValue('job_title')?.trim() || undefined,
            contact_type: contactType,
            area: area as any, // Cast to match the enum type
            linkedin_url: linkedinUrl || undefined,
            is_in_cto_club: inCtoClub,
            current_projects: currentProjects,
            goals_aspirations: goalsAspirations,
            our_strategic_goals: ourStrategicGoals,
            general_notes: getFieldValue('general_notes')?.trim() || undefined
          }

          validContacts.push(contact as Contact)
        }
      } catch (error) {
        errors.push({ 
          row: rowNumber, 
          errors: [error instanceof Error ? error.message : 'Unknown error'] 
        })
      }
    })

  } catch (error) {
    errors.push({ 
      row: 1, 
      errors: [`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    })
  }

  return {
    valid: validContacts,
    errors,
    summary: {
      total: Math.max(0, lines.length - 1), // Total data rows (excluding header)
      valid: validContacts.length,
      errors: errors.length
    }
  }
}

// Helper functions
function getCellValue(row: string[], index: number): string | undefined {
  return index >= 0 && index < row.length ? row[index] : undefined
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
} 