'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabase } from './supabase'
import { extractFormData, extractEmail, extractUrl, extractBoolean, validateData } from './validation'
import { logger } from './logger'
import type { ContactInsert, ContactUpdate, EventInsert, EventUpdate, RelationshipPipelineInsert, RelationshipPipelineUpdate } from './supabase'
import { Contact, Event, EventInvitation, RelationshipPipeline } from './database.types'
import { updateAreaInNotes, type ContactArea } from './contact-area-utils'

// Validation schemas
const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  additional_emails: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contact_type: z.string().min(1, 'Please select a contact type'),

  is_in_cto_club: z.boolean().default(false),
  general_notes: z.string().optional(),
})

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  description: z.string().optional(),
  event_type: z.string().min(1, 'Please select an event type'),
  event_date: z.string().min(1, 'Event date is required'),
  location: z.string().optional(),
  max_attendees: z.string().optional().transform((val) => {
    if (!val || val.trim() === '') return null
    const num = parseInt(val.trim())
    if (isNaN(num) || num <= 0) {
      throw new Error('Maximum attendees must be a positive number')
    }
    return num
  }),
  status: z.string().default('Planning'),
})

const pipelineSchema = z.object({
  contact_id: z.string().uuid('Invalid contact ID'),
  pipeline_stage: z.string().min(1, 'Please select a stage'),
  next_action_description: z.string().min(1, 'Next action is required'),
  next_action_date: z.string().min(1, 'Next action date is required'),
})

// Event Invitation Schema
const invitationSchema = z.object({
  event_id: z.string().uuid('Invalid event ID'),
  contact_id: z.string().uuid('Invalid contact ID'),
  status: z.string().default('Sourced'),
  invited_by_host_id: z.string().uuid('Invalid host ID').optional(),
  is_new_connection: z.boolean().default(false),
  follow_up_notes: z.string().optional(),
})

// Helper function to parse additional emails
function parseAdditionalEmails(emailString?: string): string[] | null {
  if (!emailString || emailString.trim() === '') return null
  
  const emails = emailString.split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
  
  // Validate each email
  for (const email of emails) {
    if (!z.string().email().safeParse(email).success) {
      throw new Error(`Invalid email address: ${email}`)
    }
  }
  
  return emails.length > 0 ? emails : null
}

// Helper function to validate and clean email
function validateAndCleanEmail(email?: string): string | null {
  if (!email || email.trim() === '') return null
  
  const cleanEmail = email.trim()
  const validation = z.string().email().safeParse(cleanEmail)
  
  if (!validation.success) {
    throw new Error('Please enter a valid email address')
  }
  
  return cleanEmail
}

// Contact Actions
export async function createContact(formData: FormData) {
  try {
    const rawData = {
      name: extractFormData(formData, 'name'),
      email: validateAndCleanEmail(extractEmail(formData, 'email')),
      additional_emails: extractFormData(formData, 'additional_emails'),
      company: extractFormData(formData, 'company'),
      job_title: extractFormData(formData, 'job_title'),
      linkedin_url: extractUrl(formData, 'linkedin_url'),
      contact_type: extractFormData(formData, 'contact_type'),

      is_in_cto_club: extractBoolean(formData, 'is_in_cto_club'),
      general_notes: extractFormData(formData, 'general_notes'),
    }

    const validation = validateData(contactSchema, rawData)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const validatedData = validation.data
    
    // Parse additional emails
    const processedData = {
      ...validatedData,
      additional_emails: parseAdditionalEmails(validatedData.additional_emails)
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert(processedData as ContactInsert)
      .select()
      .single()

    if (error) {
      logger.databaseError('create contact', new Error(error.message), { rawData })
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('createContact', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create contact' 
    }
  }
}

export async function updateContact(id: string, formData: FormData) {
  try {
    const rawData = {
      name: extractFormData(formData, 'name'),
      email: validateAndCleanEmail(extractEmail(formData, 'email')),
      additional_emails: extractFormData(formData, 'additional_emails'),
      company: extractFormData(formData, 'company'),
      job_title: extractFormData(formData, 'job_title'),
      linkedin_url: extractUrl(formData, 'linkedin_url'),
      contact_type: extractFormData(formData, 'contact_type'),

      is_in_cto_club: extractBoolean(formData, 'is_in_cto_club'),
      general_notes: extractFormData(formData, 'general_notes'),
    }

    const validatedData = contactSchema.parse(rawData)
    
    // Parse additional emails
    const processedData = {
      ...validatedData,
      additional_emails: parseAdditionalEmails(validatedData.additional_emails)
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(processedData as ContactUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update contact error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true, data }
  } catch (error) {
    console.error('Update contact action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update contact' 
    }
  }
}

export async function deleteContact(id: string) {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete contact error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true }
  } catch (error) {
    console.error('Delete contact action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete contact' 
    }
  }
}

// Event Actions
export async function createEvent(formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      event_type: formData.get('event_type') as string,
      event_date: formData.get('event_date') as string,
      location: formData.get('location') as string,
      max_attendees: formData.get('max_attendees') as string,
      status: formData.get('status') as string || 'Planning',
    }

    const validatedData = eventSchema.parse(rawData)

    const { data, error } = await supabase
      .from('events')
      .insert(validatedData as EventInsert)
      .select()
      .single()

    if (error) {
      console.error('Create event error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true, data }
  } catch (error) {
    console.error('Create event action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create event' 
    }
  }
}

export async function updateEvent(id: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      event_type: formData.get('event_type') as string,
      event_date: formData.get('event_date') as string,
      location: formData.get('location') as string,
      max_attendees: (formData.get('max_attendees') as string) || '',
      status: formData.get('status') as string,
    }

    const validatedData = eventSchema.parse(rawData)

    const { data, error } = await supabase
      .from('events')
      .update(validatedData as EventUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update event error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true, data }
  } catch (error) {
    console.error('Update event action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update event' 
    }
  }
}

export async function deleteEvent(id: string) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete event error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('Delete event action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete event' 
    }
  }
}

// Data fetching functions
export async function getContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch contacts error:', error)
      throw new Error(error.message)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Get contacts action error:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch contacts' 
    }
  }
}

export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (error) {
      console.error('Get events error:', error)
      throw new Error(error.message)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Get events action error:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch events' 
    }
  }
}

// Pipeline Actions
export async function getRelationshipPipeline() {
  try {
    const { data, error } = await supabase
      .from('relationship_pipeline')
      .select(`
        *,
        contacts (*)
      `)
      .order('next_action_date', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Get pipeline error:', error)
      throw new Error(error.message)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Get pipeline action error:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch pipeline' 
    }
  }
}

export async function addToPipeline(formData: FormData) {
  try {
    const rawData = {
      contact_id: formData.get('contact_id') as string,
      pipeline_stage: formData.get('pipeline_stage') as string,
      next_action_description: formData.get('next_action_description') as string,
      next_action_date: formData.get('next_action_date') as string,
    }

    const validatedData = pipelineSchema.parse(rawData)

    const { data, error } = await supabase
      .from('relationship_pipeline')
      .insert(validatedData as RelationshipPipelineInsert)
      .select()
      .single()

    if (error) {
      console.error('Add to pipeline error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/pipeline')
    return { success: true, data }
  } catch (error) {
    console.error('Add to pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add contact to pipeline' 
    }
  }
}

export async function updatePipelineStage(id: number, formData: FormData) {
  try {
    const rawData = {
      contact_id: formData.get('contact_id') as string,
      pipeline_stage: formData.get('pipeline_stage') as string,
      next_action_description: formData.get('next_action_description') as string,
      next_action_date: formData.get('next_action_date') as string,
    }

    const validatedData = pipelineSchema.parse(rawData)

    const { data, error } = await supabase
      .from('relationship_pipeline')
      .update(validatedData as RelationshipPipelineUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update pipeline error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/pipeline')
    return { success: true, data }
  } catch (error) {
    console.error('Update pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update pipeline stage' 
    }
  }
}

export async function removeFromPipeline(id: number) {
  try {
    const { error } = await supabase
      .from('relationship_pipeline')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Remove from pipeline error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/pipeline')
    return { success: true }
  } catch (error) {
    console.error('Remove from pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove from pipeline' 
    }
  }
}

// Event Invitation Actions
export async function getEventInvitations(eventId: string) {
  try {
    // Start with the simplest possible query
    const { data: invitations, error } = await supabase
      .from('event_invitations')
      .select('*')
      .eq('event_id', eventId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Get event invitations error:', error)
      throw new Error(error.message)
    }

    if (!invitations || invitations.length === 0) {
      return { success: true, data: [] }
    }

    // Get all contact IDs we need to fetch
    const contactIds = invitations.map(inv => inv.contact_id)
    const invitedByIds = invitations
      .map(inv => inv.invited_by_host_id)
      .filter(id => id !== null)

    // Fetch all contacts at once
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area')
      .in('id', [...contactIds, ...invitedByIds])

    if (contactsError) {
      console.error('Get contacts error:', contactsError)
      // Don't throw, just return invitations without contact details
      return { 
        success: true, 
        data: invitations.map(inv => ({ ...inv, contacts: null, invited_by: null }))
      }
    }

    // Map contacts back to invitations
    const contactsMap = new Map(contacts?.map(c => [c.id, c]) || [])
    
    const result = invitations.map(invitation => ({
      ...invitation,
      contacts: contactsMap.get(invitation.contact_id) || null,
      invited_by: invitation.invited_by_host_id 
        ? contactsMap.get(invitation.invited_by_host_id) || null 
        : null
    }))

    return { success: true, data: result }
  } catch (error) {
    console.error('Get event invitations action error:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch event invitations' 
    }
  }
}

export async function addContactToEvent(formData: FormData) {
  try {
    const rawData = {
      event_id: formData.get('event_id') as string,
      contact_id: formData.get('contact_id') as string,
      status: formData.get('status') as string || 'Sourced',
      invited_by_host_id: formData.get('invited_by_host_id') as string || undefined,
      is_new_connection: formData.get('is_new_connection') === 'true',
      follow_up_notes: formData.get('follow_up_notes') as string || undefined,
    }

    const validatedData = invitationSchema.parse(rawData)

    // Insert the invitation first
    const { data: invitation, error } = await supabase
      .from('event_invitations')
      .insert(validatedData)
      .select('*')
      .single()

    if (error) {
      console.error('Add contact to event error:', error)
      if (error.code === '23505') {
        throw new Error('This contact is already invited to this event')
      }
      throw new Error(error.message)
    }

    // Fetch the contact data separately
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, email, company, job_title, contact_type, area')
      .eq('id', invitation.contact_id)
      .single()

    if (contactError) {
      console.error('Fetch contact error:', contactError)
    }

    // Combine the data
    const result = {
      ...invitation,
      contacts: contact || null
    }

    revalidatePath(`/events/${validatedData.event_id}`)
    return { success: true, data: result }
  } catch (error) {
    console.error('Add contact to event action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add contact to event' 
    }
  }
}

export async function updateInvitationStatus(invitationId: number, formData: FormData) {
  try {
    const status = formData.get('status') as string
    const isNewConnection = formData.get('is_new_connection') === 'true'
    const followUpNotes = formData.get('follow_up_notes') as string || undefined

    if (!status) {
      throw new Error('Status is required')
    }

    // Update the invitation first
    const { data: invitation, error } = await supabase
      .from('event_invitations')
      .update({ 
        status, 
        is_new_connection: isNewConnection,
        follow_up_notes: followUpNotes 
      })
      .eq('id', invitationId)
      .select('*')
      .single()

    if (error) {
      console.error('Update invitation status error:', error)
      throw new Error(error.message)
    }

    // Fetch the contact data separately
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, name, email, company, job_title, area')
      .eq('id', invitation.contact_id)
      .single()

    if (contactError) {
      console.error('Fetch contact error:', contactError)
    }

    // Combine the data
    const result = {
      ...invitation,
      contacts: contact || null
    }

    // Revalidate both the specific event page and events list
    const eventId = invitation.event_id
    revalidatePath(`/events/${eventId}`)
    revalidatePath('/events')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Update invitation status action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update invitation status' 
    }
  }
}

export async function removeContactFromEvent(invitationId: number) {
  try {
    // Get the event_id before deletion for revalidation
    const { data: invitation } = await supabase
      .from('event_invitations')
      .select('event_id')
      .eq('id', invitationId)
      .single()

    const { error } = await supabase
      .from('event_invitations')
      .delete()
      .eq('id', invitationId)

    if (error) {
      console.error('Remove contact from event error:', error)
      throw new Error(error.message)
    }

    // Revalidate the specific event page
    if (invitation?.event_id) {
      revalidatePath(`/events/${invitation.event_id}`)
    }
    revalidatePath('/events')
    
    return { success: true }
  } catch (error) {
    console.error('Remove contact from event action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove contact from event' 
    }
  }
}

export async function getAvailableContactsForEvent(eventId: string) {
  try {
    // First get all contacts already invited to this event
    const { data: invitedContacts, error: invitedError } = await supabase
      .from('event_invitations')
      .select('contact_id')
      .eq('event_id', eventId)

    if (invitedError) {
      console.error('Get invited contacts error:', invitedError)
      throw new Error(invitedError.message)
    }

    const invitedContactIds = invitedContacts?.map(inv => inv.contact_id) || []

    // Get all contacts
    const { data: allContacts, error } = await supabase
      .from('contacts')
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area')
      .order('name', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Get available contacts error:', error)
      throw new Error(error.message)
    }

    // Filter out contacts that are already invited
    const availableContacts = allContacts?.filter(contact => 
      !invitedContactIds.includes(contact.id)
    ) || []

    return { success: true, data: availableContacts }
  } catch (error) {
    console.error('Get available contacts action error:', error)
    return { 
      success: false, 
      data: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch available contacts' 
    }
  }
}

export async function getEventWithDetails(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Get event details error:', error)
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get event details action error:', error)
    return { 
      success: false, 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch event details' 
    }
  }
}

// Function to get event invitations for a specific contact
export async function getContactEventHistory(contactId: string) {
  try {
    const { data, error } = await supabase
      .from('event_invitations')
      .select(`
        *,
        events (
          id,
          name,
          event_date,
          event_type,
          status,
          description
        )
      `)
      .eq('contact_id', contactId)
      .order('id', { ascending: false })

    if (error) {
      console.error('Get contact event history error:', error)
      throw new Error(error.message)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get contact event history action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get contact event history' 
    }
  }
}

export async function getContact(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Fetch contact error:', error)
    return null
  }

  return data
}

export async function searchContacts(query: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Search contacts error:', error)
    throw new Error(error.message)
  }

  return data || []
}

// Bulk Operations for Event Invitations
export async function bulkUpdateInvitationStatus(invitationIds: number[], status: string) {
  try {
    if (invitationIds.length === 0) {
      return { success: false, error: 'No invitations selected' }
    }

    const { data, error } = await supabase
      .from('event_invitations')
      .update({ status })
      .in('id', invitationIds)
      .select('id, event_id')

    if (error) {
      console.error('Bulk update invitation status error:', error)
      throw new Error(error.message)
    }

    // Revalidate event pages
    if (data && data.length > 0) {
      const eventIds = [...new Set(data.map(inv => inv.event_id))]
      eventIds.forEach(eventId => {
        revalidatePath(`/events/${eventId}`)
      })
      revalidatePath('/events')
    }

    return { 
      success: true, 
      data,
      message: `Updated ${invitationIds.length} invitation${invitationIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update invitation status action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update invitation statuses' 
    }
  }
}

export async function bulkUpdateInvitationNotes(invitationIds: number[], followUpNotes: string) {
  try {
    if (invitationIds.length === 0) {
      return { success: false, error: 'No invitations selected' }
    }

    const { data, error } = await supabase
      .from('event_invitations')
      .update({ follow_up_notes: followUpNotes || null })
      .in('id', invitationIds)
      .select('id, event_id')

    if (error) {
      console.error('Bulk update invitation notes error:', error)
      throw new Error(error.message)
    }

    // Revalidate event pages
    if (data && data.length > 0) {
      const eventIds = [...new Set(data.map(inv => inv.event_id))]
      eventIds.forEach(eventId => {
        revalidatePath(`/events/${eventId}`)
      })
      revalidatePath('/events')
    }

    return { 
      success: true, 
      data,
      message: `Updated notes for ${invitationIds.length} invitation${invitationIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update invitation notes action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update invitation notes' 
    }
  }
}

export async function bulkToggleNewConnection(invitationIds: number[], isNewConnection: boolean) {
  try {
    if (invitationIds.length === 0) {
      return { success: false, error: 'No invitations selected' }
    }

    const { data, error } = await supabase
      .from('event_invitations')
      .update({ is_new_connection: isNewConnection })
      .in('id', invitationIds)
      .select('id, event_id')

    if (error) {
      console.error('Bulk toggle new connection error:', error)
      throw new Error(error.message)
    }

    // Revalidate event pages
    if (data && data.length > 0) {
      const eventIds = [...new Set(data.map(inv => inv.event_id))]
      eventIds.forEach(eventId => {
        revalidatePath(`/events/${eventId}`)
      })
      revalidatePath('/events')
    }

    return { 
      success: true, 
      data,
      message: `${isNewConnection ? 'Marked' : 'Unmarked'} ${invitationIds.length} invitation${invitationIds.length !== 1 ? 's' : ''} as new connection${invitationIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk toggle new connection action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update new connection status' 
    }
  }
}

export async function bulkRemoveInvitations(invitationIds: number[]) {
  try {
    if (invitationIds.length === 0) {
      return { success: false, error: 'No invitations selected' }
    }

    // Get event IDs before deletion for revalidation
    const { data: invitations } = await supabase
      .from('event_invitations')
      .select('event_id')
      .in('id', invitationIds)

    const { error } = await supabase
      .from('event_invitations')
      .delete()
      .in('id', invitationIds)

    if (error) {
      console.error('Bulk remove invitations error:', error)
      throw new Error(error.message)
    }

    // Revalidate event pages
    if (invitations && invitations.length > 0) {
      const eventIds = [...new Set(invitations.map(inv => inv.event_id))]
      eventIds.forEach(eventId => {
        revalidatePath(`/events/${eventId}`)
      })
      revalidatePath('/events')
    }

    return { 
      success: true,
      message: `Removed ${invitationIds.length} guest${invitationIds.length !== 1 ? 's' : ''} from event`
    }
  } catch (error) {
    console.error('Bulk remove invitations action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove guests from event' 
    }
  }
}

// Bulk Operations for Contacts
export async function bulkUpdateContactType(contactIds: string[], contactType: string) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ contact_type: contactType })
      .in('id', contactIds)
      .select('id')

    if (error) {
      console.error('Bulk update contact type error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return { 
      success: true, 
      data,
      message: `Updated contact type for ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update contact type action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update contact types' 
    }
  }
}

export async function bulkUpdateCtoClubStatus(contactIds: string[], isInCtoClub: boolean) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ is_in_cto_club: isInCtoClub })
      .in('id', contactIds)
      .select('id')

    if (error) {
      console.error('Bulk update CTO club status error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return { 
      success: true, 
      data,
      message: `${isInCtoClub ? 'Added' : 'Removed'} ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''} ${isInCtoClub ? 'to' : 'from'} CTO Club`
    }
  } catch (error) {
    console.error('Bulk update CTO club status action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update CTO Club status' 
    }
  }
}

export async function bulkUpdateCompany(contactIds: string[], company: string) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ company: company || null })
      .in('id', contactIds)
      .select('id')

    if (error) {
      console.error('Bulk update company error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return { 
      success: true, 
      data,
      message: `Updated company for ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update company action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update company information' 
    }
  }
}

export async function bulkAddContactNotes(contactIds: string[], notes: string) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    const { data, error } = await supabase
      .from('contacts')
      .update({ general_notes: notes || null })
      .in('id', contactIds)
      .select('id')

    if (error) {
      console.error('Bulk update contact notes error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return { 
      success: true, 
      data,
      message: `Updated notes for ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update contact notes action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update contact notes' 
    }
  }
}

export async function bulkUpdateContactArea(contactIds: string[], area: ContactArea) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    // Get all contacts to update their general_notes with area
    const { data: contacts, error: fetchError } = await supabase
      .from('contacts')
      .select('id, general_notes')
      .in('id', contactIds)

    if (fetchError) {
      console.error('Bulk update area fetch error:', fetchError)
      throw new Error(fetchError.message)
    }

    if (!contacts || contacts.length === 0) {
      return { success: false, error: 'No contacts found to update' }
    }

    // Update each contact individually to avoid upsert issues
    let successCount = 0
    const errors: string[] = []

    for (const contact of contacts) {
      try {
        const updatedNotes = updateAreaInNotes(contact.general_notes, area)

        const { error: updateError } = await supabase
          .from('contacts')
          .update({ general_notes: updatedNotes })
          .eq('id', contact.id)

        if (updateError) {
          console.error(`Error updating contact ${contact.id}:`, updateError)
          errors.push(`Failed to update contact ${contact.id}: ${updateError.message}`)
        } else {
          successCount++
        }
      } catch (contactError) {
        console.error(`Error processing contact ${contact.id}:`, contactError)
        errors.push(`Failed to process contact ${contact.id}`)
      }
    }

    revalidatePath('/contacts')

    if (successCount === 0) {
      return {
        success: false,
        error: `Failed to update any contacts. Errors: ${errors.join(', ')}`
      }
    }

    if (errors.length > 0) {
      return {
        success: true,
        data: { updated: successCount },
        message: `Updated area for ${successCount} of ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}. Some updates failed.`
      }
    }

    return {
      success: true,
      data: { updated: successCount },
      message: `Updated area for ${successCount} contact${successCount !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update contact area action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contact area'
    }
  }
}

export async function bulkAddToPipeline(contactIds: string[], pipelineData: {
  pipeline_stage: string
  next_action_description: string
  next_action_date: string
}) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    // Check which contacts are already in pipeline
    const { data: existingPipeline } = await supabase
      .from('relationship_pipeline')
      .select('contact_id')
      .in('contact_id', contactIds)

    const existingContactIds = existingPipeline?.map(p => p.contact_id) || []
    const newContactIds = contactIds.filter(id => !existingContactIds.includes(id))

    if (newContactIds.length === 0) {
      return { 
        success: false, 
        error: 'All selected contacts are already in the pipeline' 
      }
    }

    // Add new contacts to pipeline
    const pipelineInserts = newContactIds.map(contactId => ({
      contact_id: contactId,
      ...pipelineData
    }))

    const { data, error } = await supabase
      .from('relationship_pipeline')
      .insert(pipelineInserts)
      .select('id')

    if (error) {
      console.error('Bulk add to pipeline error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    revalidatePath('/pipeline')

    const skippedCount = contactIds.length - newContactIds.length
    let message = `Added ${newContactIds.length} contact${newContactIds.length !== 1 ? 's' : ''} to pipeline`
    if (skippedCount > 0) {
      message += ` (${skippedCount} already in pipeline)`
    }

    return { 
      success: true, 
      data,
      message
    }
  } catch (error) {
    console.error('Bulk add to pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add contacts to pipeline' 
    }
  }
}

export async function bulkDeleteContacts(contactIds: string[]) {
  try {
    if (contactIds.length === 0) {
      return { success: false, error: 'No contacts selected' }
    }

    // First check if any contacts have associated data
    const { data: invitations } = await supabase
      .from('event_invitations')
      .select('contact_id')
      .in('contact_id', contactIds)

    const { data: pipeline } = await supabase
      .from('relationship_pipeline')
      .select('contact_id')
      .in('contact_id', contactIds)

    const contactsWithData = [
      ...(invitations?.map(i => i.contact_id) || []),
      ...(pipeline?.map(p => p.contact_id) || [])
    ]
    const uniqueContactsWithData = [...new Set(contactsWithData)]

    if (uniqueContactsWithData.length > 0) {
      return {
        success: false,
        error: `Cannot delete ${uniqueContactsWithData.length} contact${uniqueContactsWithData.length !== 1 ? 's' : ''} with existing event invitations or pipeline entries. Remove them from events and pipeline first.`
      }
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .in('id', contactIds)

    if (error) {
      console.error('Bulk delete contacts error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return { 
      success: true,
      message: `Deleted ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk delete contacts action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete contacts' 
    }
  }
} 