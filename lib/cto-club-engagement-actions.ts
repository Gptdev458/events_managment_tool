// CTO Club Engagement Database Actions
// Server actions for CTO club member engagement initiatives and tasks

'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Basic types for the new tables
export interface CtoClubEngagementInitiative {
  id: string
  created_at: string
  title: string
  description: string | null
  status: 'active' | 'on_hold' | 'completed' | 'archived'
  tasks?: CtoClubEngagementTask[]
}

export interface CtoClubEngagementTask {
  id: string
  created_at: string
  initiative_id: string
  name: string
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled'
  due_date: string | null
  notes: string | null
  initiative?: CtoClubEngagementInitiative
}

export interface CtoClubEngagementInitiativeInsert {
  title: string
  description?: string
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
}

export interface CtoClubEngagementTaskInsert {
  initiative_id: string
  name: string
  status?: 'to_do' | 'in_progress' | 'done' | 'cancelled'
  due_date?: string
  notes?: string
}

export interface CtoClubEngagementInitiativeUpdate {
  title?: string
  description?: string
  status?: 'active' | 'on_hold' | 'completed' | 'archived'
}

export interface CtoClubEngagementTaskUpdate {
  name?: string
  status?: 'to_do' | 'in_progress' | 'done' | 'cancelled'
  due_date?: string
  notes?: string
}

// ========= INITIATIVES =========

export async function getCtoClubEngagementInitiatives(): Promise<CtoClubEngagementInitiative[]> {
  const { data, error } = await supabase
    .from('cto_club_engagement_initiatives')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching CTO club engagement initiatives:', error)
    throw new Error('Failed to fetch CTO club engagement initiatives')
  }

  return data || []
}

export async function createCtoClubEngagementInitiative(initiative: CtoClubEngagementInitiativeInsert): Promise<CtoClubEngagementInitiative> {
  const { data, error } = await supabase
    .from('cto_club_engagement_initiatives')
    .insert(initiative)
    .select()
    .single()

  if (error) {
    console.error('Error creating CTO club engagement initiative:', error)
    throw new Error('Failed to create CTO club engagement initiative')
  }

  revalidatePath('/cto-club')
  return data
}

export async function updateCtoClubEngagementInitiative(id: string, updates: CtoClubEngagementInitiativeUpdate): Promise<CtoClubEngagementInitiative> {
  const { data, error } = await supabase
    .from('cto_club_engagement_initiatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating CTO club engagement initiative:', error)
    throw new Error('Failed to update CTO club engagement initiative')
  }

  revalidatePath('/cto-club')
  return data
}

export async function deleteCtoClubEngagementInitiative(id: string): Promise<void> {
  const { error } = await supabase
    .from('cto_club_engagement_initiatives')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting CTO club engagement initiative:', error)
    throw new Error('Failed to delete CTO club engagement initiative')
  }

  revalidatePath('/cto-club')
}

// ========= TASKS =========

export async function getCtoClubEngagementTasks(initiativeId?: string): Promise<CtoClubEngagementTask[]> {
  let query = supabase
    .from('cto_club_engagement_tasks')
    .select('*')

  if (initiativeId) {
    query = query.eq('initiative_id', initiativeId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching CTO club engagement tasks:', error)
    throw new Error('Failed to fetch CTO club engagement tasks')
  }

  return data || []
}

export async function createCtoClubEngagementTask(task: CtoClubEngagementTaskInsert): Promise<CtoClubEngagementTask> {
  const { data, error } = await supabase
    .from('cto_club_engagement_tasks')
    .insert(task)
    .select()
    .single()

  if (error) {
    console.error('Error creating CTO club engagement task:', error)
    throw new Error('Failed to create CTO club engagement task')
  }

  revalidatePath('/cto-club')
  return data
}

export async function updateCtoClubEngagementTask(id: string, updates: CtoClubEngagementTaskUpdate): Promise<CtoClubEngagementTask> {
  const { data, error } = await supabase
    .from('cto_club_engagement_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating CTO club engagement task:', error)
    throw new Error('Failed to update CTO club engagement task')
  }

  // Skip revalidatePath for task updates to prevent page restart
  // The component handles refresh manually via onRefresh() call
  // revalidatePath('/cto-club') 
  return data
}

export async function deleteCtoClubEngagementTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('cto_club_engagement_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting CTO club engagement task:', error)
    throw new Error('Failed to delete CTO club engagement task')
  }

  revalidatePath('/cto-club')
}

// ========= BULK DATA LOADING =========

export async function getCtoClubEngagementDataBulk(): Promise<{
  initiatives: CtoClubEngagementInitiative[]
  allTasks: CtoClubEngagementTask[]
}> {
  try {
    const [initiatives, allTasks] = await Promise.all([
      supabase
        .from('cto_club_engagement_initiatives')
        .select('*')
        .order('created_at', { ascending: false }),
      
      supabase
        .from('cto_club_engagement_tasks')
        .select('*')
        .order('created_at', { ascending: false })
    ])

    if (initiatives.error) {
      console.error('Initiatives error:', initiatives.error)
      throw initiatives.error
    }
    if (allTasks.error) {
      console.error('AllTasks error:', allTasks.error)
      throw allTasks.error
    }

    return {
      initiatives: initiatives.data || [],
      allTasks: allTasks.data || []
    }
  } catch (error) {
    console.error('Error fetching bulk CTO club engagement data:', error)
    throw new Error('Failed to fetch CTO club engagement data')
  }
} 