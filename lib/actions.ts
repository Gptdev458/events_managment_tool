'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { supabase } from './supabase'
import { extractFormData, extractEmail, extractUrl, extractBoolean, extractNullableString, validateData } from './validation'
import { logger } from './logger'
import type { ContactInsert, ContactUpdate, EventInsert, EventUpdate, RelationshipPipelineInsert, RelationshipPipelineUpdate } from './supabase'
import { Contact, Event, EventInvitation, RelationshipPipeline } from './database.types'
import { type ContactArea } from './contact-area-utils'

// Validation schemas
const contactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')).or(z.null()),
  additional_emails: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  contact_type: z.string().optional().or(z.null()),
  area: z.string().optional().or(z.null()),
  linkedin_url: z.string().optional(),
  is_in_cto_club: z.boolean().optional(),
  current_projects: z.string().optional(),
  goals_aspirations: z.string().optional(),
  our_strategic_goals: z.string().optional(),
  general_notes: z.string().optional()
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
  last_action_date: z.string().optional(),
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
  if (!emailString?.trim()) return null
  
  const emails = emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0)
  
  return emails.length > 0 ? emails : null
}

function parseArrayField(fieldString?: string): string[] | null {
  if (!fieldString?.trim()) return null
  
  const items = fieldString
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0)
  
  return items.length > 0 ? items : null
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
      contact_type: extractNullableString(formData, 'contact_type'),
      area: extractNullableString(formData, 'area'),
      linkedin_url: extractUrl(formData, 'linkedin_url'),
      is_in_cto_club: extractBoolean(formData, 'is_in_cto_club'),
      current_projects: extractFormData(formData, 'current_projects'),
      goals_aspirations: extractFormData(formData, 'goals_aspirations'),
      our_strategic_goals: extractFormData(formData, 'our_strategic_goals'),
      general_notes: extractFormData(formData, 'general_notes'),
    }

    const validation = validateData(contactSchema, rawData)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const validatedData = validation.data
    
    // Parse additional emails and array fields
    const processedData = {
      ...validatedData,
      additional_emails: parseAdditionalEmails(validatedData.additional_emails),
      current_projects: parseArrayField(validatedData.current_projects),
      goals_aspirations: parseArrayField(validatedData.goals_aspirations),
      our_strategic_goals: parseArrayField(validatedData.our_strategic_goals)
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
      contact_type: extractNullableString(formData, 'contact_type'),
      area: extractNullableString(formData, 'area'),
      linkedin_url: extractUrl(formData, 'linkedin_url'),
      is_in_cto_club: extractBoolean(formData, 'is_in_cto_club'),
      current_projects: extractFormData(formData, 'current_projects'),
      goals_aspirations: extractFormData(formData, 'goals_aspirations'),
      our_strategic_goals: extractFormData(formData, 'our_strategic_goals'),
      general_notes: extractFormData(formData, 'general_notes'),
    }

    const validatedData = contactSchema.parse(rawData)
    
    // Parse additional emails and array fields
    const processedData = {
      ...validatedData,
      additional_emails: parseAdditionalEmails(validatedData.additional_emails),
      current_projects: parseArrayField(validatedData.current_projects),
      goals_aspirations: parseArrayField(validatedData.goals_aspirations),
      our_strategic_goals: parseArrayField(validatedData.our_strategic_goals)
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(processedData as ContactUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.databaseError('update contact', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateContact', error instanceof Error ? error : new Error('Unknown error'))
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
      logger.databaseError('delete contact', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteContact', error instanceof Error ? error : new Error('Unknown error'))
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
      logger.databaseError('create event', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('createEvent', error instanceof Error ? error : new Error('Unknown error'))
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
      logger.databaseError('update event', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateEvent', error instanceof Error ? error : new Error('Unknown error'))
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
      logger.databaseError('delete event', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteEvent', error instanceof Error ? error : new Error('Unknown error'))
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
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
      .order('created_at', { ascending: false })

    if (error) {
      logger.databaseError('fetch contacts', new Error(error.message))
      throw new Error(error.message)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    logger.serverActionError('getContacts', error instanceof Error ? error : new Error('Unknown error'))
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
      logger.databaseError('get events', new Error(error.message))
      throw new Error(error.message)
    }

    return { success: true, data: data || [] }
  } catch (error) {
    logger.serverActionError('getEvents', error instanceof Error ? error : new Error('Unknown error'))
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
      last_action_date: formData.get('last_action_date') as string || undefined,
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
    revalidatePath('/events-management/pipeline')
    return { success: true, data }
  } catch (error) {
    console.error('Add to pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add contact to pipeline' 
    }
  }
}

export async function bulkAddToPipeline(formData: FormData) {
  try {
    const contactIds = formData.get('contact_ids') as string
    const pipelineStage = formData.get('pipeline_stage') as string
    const nextActionDescription = formData.get('next_action_description') as string
    const nextActionDate = formData.get('next_action_date') as string
    const lastActionDate = formData.get('last_action_date') as string || undefined

    if (!contactIds) {
      throw new Error('No contacts selected')
    }

    const contactIdArray = contactIds.split(',').filter(id => id.trim())
    
    if (contactIdArray.length === 0) {
      throw new Error('No valid contacts selected')
    }

    // Prepare data for bulk insert
    const pipelineEntries = contactIdArray.map(contactId => {
      const rawData = {
        contact_id: contactId.trim(),
        pipeline_stage: pipelineStage,
        next_action_description: nextActionDescription,
        next_action_date: nextActionDate,
        last_action_date: lastActionDate,
      }
      return pipelineSchema.parse(rawData)
    })

    // Check for existing pipeline entries to avoid duplicates
    const { data: existingEntries } = await supabase
      .from('relationship_pipeline')
      .select('contact_id')
      .in('contact_id', contactIdArray)

    const existingContactIds = new Set(existingEntries?.map(entry => entry.contact_id) || [])
    const newEntries = pipelineEntries.filter(entry => !existingContactIds.has(entry.contact_id))

    if (newEntries.length === 0) {
      return {
        success: false,
        error: 'All selected contacts are already in the pipeline'
      }
    }

    // Bulk insert new entries
    const { data, error } = await supabase
      .from('relationship_pipeline')
      .insert(newEntries as RelationshipPipelineInsert[])
      .select()

    if (error) {
      console.error('Bulk add to pipeline error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/pipeline')
    revalidatePath('/events-management/pipeline')
    
    const skippedCount = contactIdArray.length - newEntries.length
    const addedCount = newEntries.length

    return { 
      success: true, 
      data,
      message: `Added ${addedCount} contact${addedCount !== 1 ? 's' : ''} to pipeline${skippedCount > 0 ? ` (${skippedCount} already in pipeline)` : ''}`
    }
  } catch (error) {
    console.error('Bulk add to pipeline action error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add contacts to pipeline' 
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
      last_action_date: formData.get('last_action_date') as string || undefined,
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
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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
      .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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
    .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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
    .select('id, name, email, additional_emails, company, job_title, contact_type, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, area, current_projects, goals_aspirations, our_strategic_goals')
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

    // Update area field directly
    const { error } = await supabase
      .from('contacts')
      .update({ area })
      .in('id', contactIds)

    if (error) {
      console.error('Bulk update area error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/contacts')

    return {
      success: true,
      data: { updated: contactIds.length },
      message: `Updated area for ${contactIds.length} contact${contactIds.length !== 1 ? 's' : ''}`
    }
  } catch (error) {
    console.error('Bulk update contact area action error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update contact area'
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