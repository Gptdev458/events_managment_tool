// JSONB Utility Functions
// Helper functions for handling JSONB fields that can be either parsed arrays or JSON strings

/**
 * Safely parses a JSONB field that can be either a string array or a JSON string
 * @param field - The JSONB field value
 * @returns Parsed string array or empty array if invalid
 */
export function parseJsonbStringArray(field: string[] | string | null): string[] {
  if (!field) return []
  
  if (Array.isArray(field)) {
    return field
  }
  
  try {
    const parsed = JSON.parse(field)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Failed to parse JSONB field:', field, error)
    return []
  }
}

/**
 * Safely stringifies a string array for JSONB storage
 * @param array - The string array to stringify
 * @returns JSON string representation
 */
export function stringifyJsonbArray(array: string[] | null): string {
  if (!array) return '[]'
  return JSON.stringify(array)
}

/**
 * Type guard to check if a JSONB field is already parsed
 * @param field - The JSONB field value
 * @returns True if field is already a string array
 */
export function isJsonbArrayParsed(field: string[] | string | null): field is string[] {
  return Array.isArray(field)
}

/**
 * Normalizes JSONB field for consistent handling
 * @param field - The JSONB field value
 * @returns Normalized string array
 */
export function normalizeJsonbArray(field: string[] | string | null): string[] {
  return parseJsonbStringArray(field)
}

/**
 * Validates that all items in a JSONB array are strings
 * @param field - The JSONB field value
 * @returns True if all items are valid strings
 */
export function validateJsonbStringArray(field: string[] | string | null): boolean {
  const parsed = parseJsonbStringArray(field)
  return parsed.every(item => typeof item === 'string' && item.trim().length > 0)
}

/**
 * Adds an item to a JSONB string array
 * @param field - The existing JSONB field value
 * @param item - The item to add
 * @returns Updated string array
 */
export function addToJsonbArray(field: string[] | string | null, item: string): string[] {
  const current = parseJsonbStringArray(field)
  if (!current.includes(item)) {
    current.push(item)
  }
  return current
}

/**
 * Removes an item from a JSONB string array
 * @param field - The existing JSONB field value
 * @param item - The item to remove
 * @returns Updated string array
 */
export function removeFromJsonbArray(field: string[] | string | null, item: string): string[] {
  const current = parseJsonbStringArray(field)
  return current.filter(existing => existing !== item)
}

/**
 * Updates a JSONB array by replacing all items
 * @param items - The new items for the array
 * @returns String array
 */
export function updateJsonbArray(items: string[]): string[] {
  return items.filter(item => typeof item === 'string' && item.trim().length > 0)
} 