'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabase } from './supabase'
import { logger } from './logger'

// Types for custom contact types
export interface CustomContactType {
  id: string
  value: string
  label: string
  created_at: string
  created_by: string | null
  is_active: boolean
}

export interface CustomContactTypeInsert {
  value: string
  label: string
  created_by?: string | null
}

export interface CustomContactTypeUpdate {
  value?: string
  label?: string
  is_active?: boolean
}

// Validation schemas
const customTypeSchema = z.object({
  value: z.string()
    .min(1, 'Value is required')
    .max(100, 'Value must be 100 characters or less')
    .regex(/^[a-z_]+$/, 'Value must contain only lowercase letters and underscores'),
  label: z.string()
    .min(1, 'Label is required')
    .max(200, 'Label must be 200 characters or less'),
})

/**
 * Get all active custom contact types
 */
export async function getCustomContactTypes(): Promise<CustomContactType[]> {
  try {
    const { data, error } = await supabase
      .from('custom_contact_types')
      .select('*')
      .eq('is_active', true)
      .order('label', { ascending: true })

    if (error) {
      logger.databaseError('fetch custom contact types', new Error(error.message))
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    logger.serverActionError('getCustomContactTypes', error instanceof Error ? error : new Error('Unknown error'))
    throw error
  }
}

/**
 * Create a new custom contact type
 */
export async function createCustomContactType(formData: FormData): Promise<{ success: boolean; data?: CustomContactType; error?: string }> {
  try {
    const label = formData.get('label') as string;
    const value = formData.get('value') as string || await generateValueFromLabel(label);
    
    const rawData = {
      value: value,
      label: label,
    }

    // Validate the data
    const validation = customTypeSchema.safeParse(rawData)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return { success: false, error: firstError?.message || 'Validation failed' }
    }

    const validatedData = validation.data

    // Check if value already exists (case-insensitive)
    const { data: existing } = await supabase
      .from('custom_contact_types')
      .select('id')
      .ilike('value', validatedData.value)
      .eq('is_active', true)
      .single()

    if (existing) {
      return { success: false, error: 'A contact type with this value already exists' }
    }

    // Create the custom type
    const { data, error } = await supabase
      .from('custom_contact_types')
      .insert(validatedData as CustomContactTypeInsert)
      .select()
      .single()

    if (error) {
      logger.databaseError('create custom contact type', new Error(error.message))
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'A contact type with this value already exists' }
      }
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('createCustomContactType', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create custom contact type' 
    }
  }
}

/**
 * Update a custom contact type
 */
export async function updateCustomContactType(
  id: string, 
  formData: FormData
): Promise<{ success: boolean; data?: CustomContactType; error?: string }> {
  try {
    const rawData = {
      value: formData.get('value') as string,
      label: formData.get('label') as string,
    }

    // Validate the data
    const validation = customTypeSchema.safeParse(rawData)
    if (!validation.success) {
      const firstError = validation.error.errors[0]
      return { success: false, error: firstError?.message || 'Validation failed' }
    }

    const validatedData = validation.data

    // Check if value already exists for a different record
    const { data: existing } = await supabase
      .from('custom_contact_types')
      .select('id')
      .ilike('value', validatedData.value)
      .eq('is_active', true)
      .neq('id', id)
      .single()

    if (existing) {
      return { success: false, error: 'A contact type with this value already exists' }
    }

    const { data, error } = await supabase
      .from('custom_contact_types')
      .update(validatedData as CustomContactTypeUpdate)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single()

    if (error) {
      logger.databaseError('update custom contact type', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateCustomContactType', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update custom contact type' 
    }
  }
}

/**
 * Soft delete a custom contact type
 */
export async function deleteCustomContactType(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('custom_contact_types')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      logger.databaseError('delete custom contact type', new Error(error.message))
      throw new Error(error.message)
    }

    revalidatePath('/contacts')
    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteCustomContactType', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete custom contact type' 
    }
  }
}

/**
 * Get all contact types (predefined + custom) for use in UI components
 */
export async function getAllContactTypes(): Promise<{ value: string; label: string }[]> {
  try {
    // Import the predefined types
    const { CONTACT_TYPES } = await import('./constants')
    
    // Get custom types
    const customTypes = await getCustomContactTypes()
    
    // Combine them
    const allTypes = [
      ...CONTACT_TYPES,
      ...customTypes.map(ct => ({ value: ct.value, label: ct.label }))
    ]
    
    return allTypes
  } catch (error) {
    logger.serverActionError('getAllContactTypes', error instanceof Error ? error : new Error('Unknown error'))
    // Fallback to just predefined types if custom types fail
    const { CONTACT_TYPES } = await import('./constants')
    return [...CONTACT_TYPES]
  }
}

/**
 * Helper function to generate a valid value from a label
 */
export async function generateValueFromLabel(label: string): Promise<string> {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
} 