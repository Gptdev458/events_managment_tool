// VIP Management Database Actions
// Server actions for VIP-related database operations

'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type {
  VipInitiative,
  VipTask,
  VipActivity,
  VipTag,
  VipInitiativeInsert,
  VipTaskInsert,
  VipActivityInsert,
  VipTagInsert,
  VipStats
} from './database.types'
import type { Contact } from './database.types'

// ========= VIP CONTACTS =========

export async function getVipContacts(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('id, name, email, additional_emails, company, job_title, contact_type, area, linkedin_url, is_in_cto_club, general_notes, created_at, first_name, last_name, current_projects, goals_aspirations, our_strategic_goals')
    .eq('contact_type', 'vip')
    .order('name')

  if (error) {
    console.error('Error fetching VIP contacts:', error)
    throw new Error('Failed to fetch VIP contacts')
  }

  return data || []
}

export async function getVipContactById(id: string): Promise<Contact | null> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching VIP contact:', error)
    return null
  }

  return data
}

export async function updateContactAsVip(contactId: string): Promise<void> {
  const { error } = await supabase
    .from('contacts')
    .update({ contact_type: 'vip' })
    .eq('id', contactId)

  if (error) {
    console.error('Error updating contact as VIP:', error)
    throw new Error('Failed to update contact as VIP')
  }

  revalidatePath('/vip-management')
}

// ========= VIP TAGS =========

export async function getVipTags(): Promise<VipTag[]> {
  const { data, error } = await supabase
    .from('vip_tags')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching VIP tags:', error)
    throw new Error('Failed to fetch VIP tags')
  }

  return data || []
}

export async function createVipTag(tagData: VipTagInsert): Promise<VipTag> {
  const { data, error } = await supabase
    .from('vip_tags')
    .insert(tagData)
    .select()
    .single()

  if (error) {
    console.error('Error creating VIP tag:', error)
    throw new Error('Failed to create VIP tag')
  }

  revalidatePath('/vip-management')
  return data
}

export async function addTagToContact(contactId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('vip_contact_tags')
    .insert({ contact_id: contactId, tag_id: tagId })

  if (error) {
    console.error('Error adding tag to contact:', error)
    throw new Error('Failed to add tag to contact')
  }

  revalidatePath('/vip-management')
}

export async function removeTagFromContact(contactId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('vip_contact_tags')
    .delete()
    .eq('contact_id', contactId)
    .eq('tag_id', tagId)

  if (error) {
    console.error('Error removing tag from contact:', error)
    throw new Error('Failed to remove tag from contact')
  }

  revalidatePath('/vip-management')
}

export async function getContactTags(contactId: string): Promise<VipTag[]> {
  const { data, error } = await supabase
    .from('vip_contact_tags')
    .select(`
      vip_tags (
        id,
        name,
        created_at
      )
    `)
    .eq('contact_id', contactId)

  if (error) {
    console.error('Error fetching contact tags:', error)
    throw new Error('Failed to fetch contact tags')
  }

  return (data || []).map((item: any) => item.vip_tags).filter(Boolean)
}

// ========= VIP INITIATIVES =========

export async function getVipInitiatives(contactId?: string): Promise<VipInitiative[]> {
  let query = supabase
    .from('vip_initiatives')
    .select('*')

  if (contactId) {
    query = query.eq('contact_id', contactId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching VIP initiatives:', error)
    throw new Error('Failed to fetch VIP initiatives')
  }

  return data || []
}

export async function createVipInitiative(initiativeData: VipInitiativeInsert): Promise<VipInitiative> {
  const { data, error } = await supabase
    .from('vip_initiatives')
    .insert(initiativeData)
    .select()
    .single()

  if (error) {
    console.error('Error creating VIP initiative:', error)
    throw new Error('Failed to create VIP initiative')
  }

  revalidatePath('/vip-management')
  return data
}

export async function updateVipInitiative(
  initiativeId: string, 
  updates: Partial<VipInitiative>
): Promise<VipInitiative> {
  const { data, error } = await supabase
    .from('vip_initiatives')
    .update(updates)
    .eq('id', initiativeId)
    .select()
    .single()

  if (error) {
    console.error('Error updating VIP initiative:', error)
    throw new Error('Failed to update VIP initiative')
  }

  revalidatePath('/vip-management')
  return data
}

export async function deleteVipInitiative(initiativeId: string): Promise<void> {
  const { error } = await supabase
    .from('vip_initiatives')
    .delete()
    .eq('id', initiativeId)

  if (error) {
    console.error('Error deleting VIP initiative:', error)
    throw new Error('Failed to delete VIP initiative')
  }

  revalidatePath('/vip-management')
}

// ========= VIP TASKS =========

export async function getVipTasks(initiativeId?: string): Promise<VipTask[]> {
  let query = supabase
    .from('vip_tasks')
    .select('*')

  if (initiativeId) {
    query = query.eq('initiative_id', initiativeId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching VIP tasks:', error)
    throw new Error('Failed to fetch VIP tasks')
  }

  return data || []
}

export async function createVipTask(taskData: VipTaskInsert): Promise<VipTask> {
  const { data, error } = await supabase
    .from('vip_tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    console.error('Error creating VIP task:', error)
    throw new Error('Failed to create VIP task')
  }

  revalidatePath('/vip-management')
  return data
}

export async function updateVipTask(taskId: string, updates: Partial<VipTask>): Promise<VipTask> {
  const { data, error } = await supabase
    .from('vip_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    console.error('Error updating VIP task:', error)
    throw new Error('Failed to update VIP task')
  }

  revalidatePath('/vip-management')
  return data
}

export async function deleteVipTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('vip_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    console.error('Error deleting VIP task:', error)
    throw new Error('Failed to delete VIP task')
  }

  revalidatePath('/vip-management')
}

// ========= VIP ACTIVITIES =========

export async function getVipActivities(contactId?: string): Promise<VipActivity[]> {
  let query = supabase
    .from('vip_activities')
    .select('*')

  if (contactId) {
    query = query.eq('contact_id', contactId)
  }

  const { data, error } = await query.order('activity_date', { ascending: false })

  if (error) {
    console.error('Error fetching VIP activities:', error)
    throw new Error('Failed to fetch VIP activities')
  }

  return data || []
}

export async function createVipActivity(activityData: VipActivityInsert): Promise<VipActivity> {
  const { data, error } = await supabase
    .from('vip_activities')
    .insert(activityData)
    .select()
    .single()

  if (error) {
    console.error('Error creating VIP activity:', error)
    throw new Error('Failed to create VIP activity')
  }

  revalidatePath('/vip-management')
  return data
}

export async function updateVipActivity(activityId: string, updates: Partial<VipActivity>): Promise<VipActivity> {
  const { data, error } = await supabase
    .from('vip_activities')
    .update(updates)
    .eq('id', activityId)
    .select()
    .single()

  if (error) {
    console.error('Error updating VIP activity:', error)
    throw new Error('Failed to update VIP activity')
  }

  revalidatePath('/vip-management')
  return data
}

export async function deleteVipActivity(activityId: string): Promise<void> {
  const { error } = await supabase
    .from('vip_activities')
    .delete()
    .eq('id', activityId)

  if (error) {
    console.error('Error deleting VIP activity:', error)
    throw new Error('Failed to delete VIP activity')
  }

  revalidatePath('/vip-management')
}

// ========= OPTIMIZED BULK DATA LOADING =========

export async function getVipDataBulk(contactId: string): Promise<{
  initiatives: VipInitiative[]
  activities: VipActivity[]
  tags: VipTag[]
  allTasks: VipTask[]
}> {
  try {
    console.log('getVipDataBulk called for contactId:', contactId)
    const [initiatives, activities, tags, allTasks] = await Promise.all([
      supabase
        .from('vip_initiatives')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('vip_activities')
        .select(`
          *,
          vip_initiatives (
            id,
            title,
            type
          )
        `)
        .eq('contact_id', contactId)
        .order('activity_date', { ascending: false }),
      
      supabase
        .from('vip_contact_tags')
        .select(`
          vip_tags (
            id,
            name,
            created_at
          )
        `)
        .eq('contact_id', contactId),
      
      // Load ALL tasks for all initiatives of this contact at once
      supabase
        .from('vip_tasks')
        .select(`
          *,
          vip_initiatives!inner (
            contact_id
          )
        `)
        .eq('vip_initiatives.contact_id', contactId)
        .order('created_at', { ascending: false })
    ])

    if (initiatives.error) {
      console.error('Initiatives error:', initiatives.error)
      throw initiatives.error
    }
    if (activities.error) {
      console.error('Activities error:', activities.error)
      throw activities.error
    }
    if (tags.error) {
      console.error('Tags error:', tags.error)
      throw tags.error
    }
    if (allTasks.error) {
      console.error('AllTasks error:', allTasks.error)
      throw allTasks.error
    }

    const result = {
      initiatives: initiatives.data || [],
      activities: activities.data || [],
      tags: (tags.data || []).map((item: any) => item.vip_tags).filter(Boolean),
      allTasks: allTasks.data || []
    }
    
    console.log('getVipDataBulk result:', result)
    return result
  } catch (error) {
    console.error('Error fetching bulk VIP data:', error)
    throw new Error('Failed to fetch VIP data')
  }
}

// ========= VIP STATISTICS =========

export async function getVipStats(): Promise<VipStats> {
  try {
    const [vipContacts, initiatives, activities] = await Promise.all([
      getVipContacts(),
      getVipInitiatives(),
      getVipActivities(),
    ])

    const giveInitiatives = initiatives.filter(i => i.type === 'give' && i.status === 'active')
    const askInitiatives = initiatives.filter(i => i.type === 'ask' && i.status === 'active')
    
    // Get recent activities (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentActivities = activities.filter(
      a => new Date(a.activity_date) >= thirtyDaysAgo
    )

    return {
      total_vips: vipContacts.length,
      active_give_initiatives: giveInitiatives.length,
      active_ask_initiatives: askInitiatives.length,
      total_activities: activities.length,
      recent_interactions: recentActivities.length,
    }
  } catch (error) {
    console.error('Error getting VIP stats:', error)
    // Return default stats if error
    return {
      total_vips: 0,
      active_give_initiatives: 0,
      active_ask_initiatives: 0,
      total_activities: 0,
      recent_interactions: 0,
    }
  }
} 