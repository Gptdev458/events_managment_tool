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
      'LinkedIn URL',
      'In CTO Club',
      'General Notes',
      'Created Date'
    ]

    const rows = contacts.map(contact => [
      ContactBusinessLogic.getDisplayName(contact),
      contact.email || '',
      ContactBusinessLogic.formatAdditionalEmailsForInput(contact),
      contact.company || '',
      contact.job_title || '',
      contact.contact_type,
      contact.linkedin_url || '',
      contact.is_in_cto_club ? 'Yes' : 'No',
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
    
    // Map headers to expected fields - support both new 'name' field and legacy first/last name
    const fieldMap = {
      email: this.findHeader(headers, ['email', 'email address', 'e-mail']),
      name: this.findHeader(headers, ['name', 'full name', 'contact name']),
      first_name: this.findHeader(headers, ['first name', 'firstname', 'first', 'given name']),
      last_name: this.findHeader(headers, ['last name', 'lastname', 'last', 'surname', 'family name']),
      company: this.findHeader(headers, ['company', 'organization', 'employer']),
      job_title: this.findHeader(headers, ['job title', 'title', 'position', 'role']),
      contact_type: this.findHeader(headers, ['contact type', 'type', 'category']),
      linkedin_url: this.findHeader(headers, ['linkedin', 'linkedin url', 'linkedin profile']),
      is_in_cto_club: this.findHeader(headers, ['cto club', 'in cto club', 'cto member']),
      general_notes: this.findHeader(headers, ['notes', 'general notes', 'comments'])
    }

    const validContacts: Contact[] = []
    const errors: { row: number; errors: string[] }[] = []

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because arrays are 0-indexed and we skipped header
      const contact: Partial<Contact> = {}
      const rowErrors: string[] = []

      // Extract data based on field mapping
      if (fieldMap.email !== -1) {
        contact.email = row[fieldMap.email]?.trim() || null
      }

      // Handle name field - prefer single name field, fallback to combining first/last
      if (fieldMap.name !== -1) {
        contact.name = row[fieldMap.name]?.trim() || null
      } else if (fieldMap.first_name !== -1 || fieldMap.last_name !== -1) {
        const firstName = fieldMap.first_name !== -1 ? (row[fieldMap.first_name]?.trim() || '') : ''
        const lastName = fieldMap.last_name !== -1 ? (row[fieldMap.last_name]?.trim() || '') : ''
        const fullName = [firstName, lastName].filter(Boolean).join(' ')
        contact.name = fullName || null
      }

      if (fieldMap.company !== -1) {
        contact.company = row[fieldMap.company]?.trim() || null
      }
      if (fieldMap.job_title !== -1) {
        contact.job_title = row[fieldMap.job_title]?.trim() || null
      }
      if (fieldMap.contact_type !== -1) {
        contact.contact_type = row[fieldMap.contact_type]?.trim() || 'General Contact'
      } else {
        contact.contact_type = 'General Contact' // Default value
      }
      if (fieldMap.linkedin_url !== -1) {
        const url = row[fieldMap.linkedin_url]?.trim()
        contact.linkedin_url = url && url !== '' ? url : null
      }
      if (fieldMap.is_in_cto_club !== -1) {
        const value = row[fieldMap.is_in_cto_club]?.trim().toLowerCase()
        contact.is_in_cto_club = ['yes', 'true', '1', 'y'].includes(value || '')
      } else {
        contact.is_in_cto_club = false // Default value
      }
      if (fieldMap.general_notes !== -1) {
        contact.general_notes = row[fieldMap.general_notes]?.trim() || null
      }

      // Validate contact data
      const validation = ContactBusinessLogic.validateContact(contact)
      
      if (!validation.isValid) {
        rowErrors.push(...validation.errors)
      }

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
        total: dataRows.length,
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
   * Generates a contacts import template
   */
  generateContactsTemplate(): string {
    const headers = [
      'Name',
      'Email',
      'Additional Emails',
      'Company',
      'Job Title',
      'Contact Type',
      'LinkedIn URL',
      'In CTO Club',
      'General Notes'
    ]

    const sampleData = [
      [
        'John Doe',
        'john.doe@example.com',
        'john.personal@gmail.com, jdoe@consulting.com',
        'Tech Corp',
        'CTO',
        'Strategic Partner',
        'https://linkedin.com/in/johndoe',
        'Yes',
        'Met at conference, interested in partnership'
      ],
      [
        'Jane Smith',
        'jane.smith@startup.com',
        '',
        'Startup Inc',
        'CEO',
        'Key Executive',
        'https://linkedin.com/in/janesmith',
        'No',
        'Potential collaboration opportunity'
      ],
      [
        'Anonymous Contact',
        '',
        '',
        'Mystery Corp',
        'Unknown',
        'prospect',
        '',
        'No',
        'Contact without email - identified by name only'
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
  'Name',
  'Email',
  'Additional Emails',
  'Company',
  'Job Title',
  'Contact Type',
  'LinkedIn URL',
  'In CTO Club',
  'General Notes'
] as const

export function contactToCSVRow(contact: Contact): string[] {
  return [
    ContactBusinessLogic.getDisplayName(contact),
    contact.email || '',
    ContactBusinessLogic.formatAdditionalEmailsForInput(contact),
    contact.company || '',
    contact.job_title || '',
    contact.contact_type,
    contact.linkedin_url || '',
    contact.is_in_cto_club ? 'Yes' : 'No',
    contact.general_notes || ''
  ]
}

export function parseCSVToContacts(csvContent: string): { 
  contacts: Partial<Contact>[], 
  errors: string[] 
} {
  const contacts: Partial<Contact>[] = []
  const errors: string[] = []
  
  try {
    const records = Papa.parse<string[]>(csvContent, {
      header: false,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"'
    })

    if (records.errors.length > 0) {
      errors.push(...records.errors.map((err: any) => `Parse error: ${err.message}`))
    }

    const rows = records.data
    if (rows.length === 0) {
      errors.push('CSV file is empty')
      return { contacts, errors }
    }

    // Get headers from first row and normalize them
    const headers = rows[0].map((h: any) => h.trim().toLowerCase())
    const dataRows = rows.slice(1)

    // Map headers to indices for flexible parsing
    const headerMap = {
      name: CSVImport.findHeader(headers, ['name', 'full name', 'contact name']),
      firstName: CSVImport.findHeader(headers, ['first name', 'firstname', 'fname']),
      lastName: CSVImport.findHeader(headers, ['last name', 'lastname', 'lname']),
      email: CSVImport.findHeader(headers, ['email', 'email address', 'primary email']),
      additionalEmails: CSVImport.findHeader(headers, ['additional emails', 'secondary emails', 'other emails']),
      company: CSVImport.findHeader(headers, ['company', 'organization', 'employer']),
      jobTitle: CSVImport.findHeader(headers, ['job title', 'title', 'position', 'role']),
      contactType: CSVImport.findHeader(headers, ['contact type', 'type', 'category']),
      linkedinUrl: CSVImport.findHeader(headers, ['linkedin url', 'linkedin', 'linkedin profile']),
      inCtoClub: CSVImport.findHeader(headers, ['in cto club', 'cto club', 'is in cto club']),
      generalNotes: CSVImport.findHeader(headers, ['general notes', 'notes', 'comments', 'description'])
    }

    // Validate required fields - remove email requirement
    // Note: No longer requiring email since contacts can exist without email addresses

    dataRows.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because we skip header and use 1-based indexing
      
      try {
        // Handle email (now optional)
        const email = getCellValue(row, headerMap.email)?.trim() || null

        // Validate email format if provided
        if (email && !isValidEmail(email)) {
          errors.push(`Row ${rowNumber}: Invalid email format: ${email}`)
          return
        }

        // Handle name with fallback to first/last name, then email if no name provided
        let name = getCellValue(row, headerMap.name)?.trim()
        if (!name) {
          const firstName = getCellValue(row, headerMap.firstName)?.trim() || ''
          const lastName = getCellValue(row, headerMap.lastName)?.trim() || ''
          name = `${firstName} ${lastName}`.trim() || undefined
        }
        
        // If still no name and no email, this contact cannot be identified
        if (!name && !email) {
          errors.push(`Row ${rowNumber}: Contact must have either a name or email address`)
          return
        }

        // Handle additional emails
        const additionalEmailsStr = getCellValue(row, headerMap.additionalEmails)?.trim()
        let additionalEmails: string[] | null = null
        
        if (additionalEmailsStr) {
          const emails = additionalEmailsStr.split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0)
          
          // Validate each additional email
          for (const additionalEmail of emails) {
            if (!isValidEmail(additionalEmail)) {
              errors.push(`Row ${rowNumber}: Invalid additional email format: ${additionalEmail}`)
              return
            }
          }
          
          additionalEmails = emails.length > 0 ? emails : null
        }

        // Parse contact type with default
        const contactType = getCellValue(row, headerMap.contactType)?.trim() || 'prospect'
        
        // Parse LinkedIn URL
        let linkedinUrl = getCellValue(row, headerMap.linkedinUrl)?.trim()
        if (linkedinUrl && !isValidUrl(linkedinUrl)) {
          errors.push(`Row ${rowNumber}: Invalid LinkedIn URL format: ${linkedinUrl}`)
          return
        }

        // Parse boolean fields
        const inCtoClubStr = getCellValue(row, headerMap.inCtoClub)?.trim().toLowerCase()
        const inCtoClub = inCtoClubStr === 'yes' || inCtoClubStr === 'true' || inCtoClubStr === '1'

        const contact: Partial<Contact> = {
          name: name || undefined,
          email,
          additional_emails: additionalEmails,
          company: getCellValue(row, headerMap.company)?.trim() || undefined,
          job_title: getCellValue(row, headerMap.jobTitle)?.trim() || undefined,
          contact_type: contactType,
          linkedin_url: linkedinUrl || undefined,
          is_in_cto_club: inCtoClub,
          general_notes: getCellValue(row, headerMap.generalNotes)?.trim() || undefined
        }

        contacts.push(contact)
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })

  } catch (error) {
    errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { contacts, errors }
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