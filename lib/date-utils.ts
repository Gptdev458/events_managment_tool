/**
 * Date utilities to handle timezone issues and proper date comparisons
 */

/**
 * Get current date in YYYY-MM-DD format in user's timezone
 */
export function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Get current datetime in ISO format
 */
export function getCurrentDateTime(): string {
  return new Date().toISOString()
}

/**
 * Compare if a date is in the future (accounting for timezone)
 */
export function isDateInFuture(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  
  // Reset time to start of day for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return dateOnly > nowOnly
}

/**
 * Compare if a date is in the past (accounting for timezone)
 */
export function isDateInPast(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  
  // Reset time to start of day for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return dateOnly < nowOnly
}

/**
 * Check if a date is today
 */
export function isDateToday(dateString: string): boolean {
  const date = new Date(dateString)
  const now = new Date()
  
  return date.getFullYear() === now.getFullYear() &&
         date.getMonth() === now.getMonth() &&
         date.getDate() === now.getDate()
}

/**
 * Format date for display
 */
export function formatDisplayDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Format date and time for display
 */
export function formatDisplayDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Get days between two dates
 */
export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return !isNaN(date.getTime())
} 