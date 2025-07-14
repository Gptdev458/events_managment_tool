'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Contact, CtoClubPotentialMember, CtoClubPipeline, CtoClubPotentialMemberInsert, CtoClubPipelineInsert } from './database.types'

// ========= CTO CLUB CURRENT MEMBERS =========

export async function getCtoClubCurrentMembers(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('is_in_cto_club', true)
    .order('name')

  if (error) {
    console.error('Error fetching CTO Club current members:', error)
    throw new Error('Failed to fetch CTO Club current members')
  }

  return data || []
}

// ========= CTO CLUB POTENTIAL MEMBERS =========

export interface CtoPotentialMemberWithContact {
  id: number
  contact_id: string
  notes: string | null
  added_date: string | null
  created_at: string | null
  contacts: Contact
}

export async function getCtoPotentialMembers(): Promise<CtoPotentialMemberWithContact[]> {
  const { data, error } = await supabase
    .from('cto_club_potential_members')
    .select(`
      *,
      contacts (*)
    `)
    .order('added_date', { ascending: false })

  if (error) {
    console.error('Error fetching CTO potential members:', error)
    throw new Error('Failed to fetch CTO potential members')
  }

  return data || []
}

export async function addToPotentialMembers(contactId: string, notes?: string): Promise<void> {
  const { error } = await supabase
    .from('cto_club_potential_members')
    .insert({
      contact_id: contactId,
      notes: notes || null
    } as CtoClubPotentialMemberInsert)

  if (error) {
    console.error('Error adding to potential members:', error)
    throw new Error('Failed to add to potential members')
  }

  revalidatePath('/cto-club')
}

export async function updatePotentialMemberNotes(id: number, notes: string): Promise<void> {
  const { error } = await supabase
    .from('cto_club_potential_members')
    .update({ notes })
    .eq('id', id)

  if (error) {
    console.error('Error updating potential member notes:', error)
    throw new Error('Failed to update notes')
  }

  revalidatePath('/cto-club')
}

export async function removeFromPotentialMembers(id: number): Promise<void> {
  const { error } = await supabase
    .from('cto_club_potential_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error removing from potential members:', error)
    throw new Error('Failed to remove from potential members')
  }

  revalidatePath('/cto-club')
}

// ========= CTO CLUB PIPELINE =========

export interface CtoPipelineItemWithContact {
  id: number
  contact_id: string
  status: string
  next_action: string | null
  next_action_date: string | null
  last_action_date: string | null
  notes: string | null
  created_at: string | null
  contacts: Contact
}

export async function getCtoPipelineItems(): Promise<CtoPipelineItemWithContact[]> {
  const { data, error } = await supabase
    .from('cto_club_pipeline')
    .select(`
      *,
      contacts (*)
    `)
    .order('next_action_date', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching CTO pipeline items:', error)
    throw new Error('Failed to fetch CTO pipeline items')
  }

  return data || []
}

export async function addToPipeline(contactId: string, status: string, nextAction?: string, nextActionDate?: string): Promise<void> {
  const { error } = await supabase
    .from('cto_club_pipeline')
    .insert({
      contact_id: contactId,
      status,
      next_action: nextAction || null,
      next_action_date: nextActionDate || null
    } as CtoClubPipelineInsert)

  if (error) {
    console.error('Error adding to pipeline:', error)
    throw new Error('Failed to add to pipeline')
  }

  revalidatePath('/cto-club')
}

export async function updatePipelineItem(
  id: number, 
  updates: {
    status?: string
    next_action?: string
    next_action_date?: string
    last_action_date?: string
    notes?: string
  }
): Promise<void> {
  // Clean up the updates object to ensure proper data types
  const cleanUpdates: any = {}
  
  if (updates.status !== undefined) {
    cleanUpdates.status = updates.status
  }
  if (updates.next_action !== undefined) {
    cleanUpdates.next_action = updates.next_action || null
  }
  if (updates.next_action_date !== undefined) {
    cleanUpdates.next_action_date = updates.next_action_date || null
  }
  if (updates.last_action_date !== undefined) {
    cleanUpdates.last_action_date = updates.last_action_date || null
  }
  if (updates.notes !== undefined) {
    cleanUpdates.notes = updates.notes || null
  }

  const { error } = await supabase
    .from('cto_club_pipeline')
    .update(cleanUpdates)
    .eq('id', id)

  if (error) {
    console.error('Error updating pipeline item:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to update pipeline item: ${error.message}`)
  }

  revalidatePath('/cto-club')
}

export async function removeFromPipeline(id: number): Promise<void> {
  const { error } = await supabase
    .from('cto_club_pipeline')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error removing from pipeline:', error)
    throw new Error('Failed to remove from pipeline')
  }

  revalidatePath('/cto-club')
}

// ========= CTO CLUB STATISTICS =========

export interface CtoClubStats {
  current_members: number
  potential_members: number
  pipeline_items: number
  ready_for_next_step: number
}

export async function getCtoClubStats(): Promise<CtoClubStats> {
  try {
    const [currentMembers, potentialMembers, pipelineItems] = await Promise.all([
      getCtoClubCurrentMembers(),
      getCtoPotentialMembers(),
      getCtoPipelineItems(),
    ])

    const readyForNextStep = pipelineItems.filter(item => item.status === 'ready for next step').length

    return {
      current_members: currentMembers.length,
      potential_members: potentialMembers.length,
      pipeline_items: pipelineItems.length,
      ready_for_next_step: readyForNextStep,
    }
  } catch (error) {
    console.error('Error getting CTO Club stats:', error)
    return {
      current_members: 0,
      potential_members: 0,
      pipeline_items: 0,
      ready_for_next_step: 0,
    }
  }
}

// ========= CREATE AND ADD TO POTENTIAL MEMBERS =========

export async function createContactAndAddToPotentialMembers(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract contact data from form
    const areaValue = formData.get('area') as string
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      job_title: formData.get('job_title') as string,
      linkedin_url: formData.get('linkedin_url') as string,
      contact_type: formData.get('contact_type') as string || 'normal',
      area: (areaValue && ['engineering', 'founders', 'product'].includes(areaValue)) 
        ? areaValue as 'engineering' | 'founders' | 'product' 
        : null,
      is_in_cto_club: false,
      general_notes: formData.get('general_notes') as string
    }

    // Validate required fields
    if (!contactData.name || !contactData.email) {
      return { success: false, error: 'Name and email are required' }
    }

    // Create the contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert(contactData)
      .select()
      .single()

    if (contactError) {
      console.error('Error creating contact:', contactError)
      return { success: false, error: 'Failed to create contact' }
    }

    // Add to potential members
    const notes = formData.get('notes') as string
    const { error: potentialMemberError } = await supabase
      .from('cto_club_potential_members')
      .insert({
        contact_id: contact.id,
        notes: notes || null
      } as CtoClubPotentialMemberInsert)

    if (potentialMemberError) {
      console.error('Error adding to potential members:', potentialMemberError)
      return { success: false, error: 'Contact created but failed to add to potential members' }
    }

    revalidatePath('/cto-club')
    revalidatePath('/contacts')
    return { success: true }
  } catch (error) {
    console.error('Error in createContactAndAddToPotentialMembers:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
} 