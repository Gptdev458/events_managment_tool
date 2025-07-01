import { z } from 'zod'

/**
 * Sanitize string input by trimming whitespace and removing potentially dangerous characters
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/[<>'"&]/g, '') // Remove basic XSS characters
    .slice(0, 1000) // Limit length to prevent DoS
}

/**
 * Sanitize email input with proper validation
 */
export function sanitizeEmail(input: unknown): string {
  const sanitized = sanitizeString(input).toLowerCase()
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(sanitized) ? sanitized : ''
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(input: unknown): string {
  const sanitized = sanitizeString(input)
  
  try {
    new URL(sanitized)
    return sanitized
  } catch {
    return ''
  }
}

/**
 * Safe FormData extraction with sanitization
 */
export function extractFormData(formData: FormData, key: string): string {
  if (!formData) return ''
  const value = formData.get(key)
  return sanitizeString(value)
}

/**
 * Extract and validate email from FormData
 */
export function extractEmail(formData: FormData, key: string): string {
  if (!formData) return ''
  const value = formData.get(key)
  return sanitizeEmail(value)
}

/**
 * Extract and validate URL from FormData
 */
export function extractUrl(formData: FormData, key: string): string {
  if (!formData) return ''
  const value = formData.get(key)
  return sanitizeUrl(value)
}

/**
 * Extract boolean from FormData
 */
export function extractBoolean(formData: FormData, key: string): boolean {
  if (!formData) return false
  const value = formData.get(key)
  return value === 'true' || value === 'on'
}

/**
 * Generic validation wrapper that ensures proper error handling
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError?.message || 'Validation failed' }
    }
    return { success: false, error: 'Unknown validation error' }
  }
} 