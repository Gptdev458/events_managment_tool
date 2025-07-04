// Utility functions for handling contact area field
// Now using the proper area column in the database

export type ContactArea = 'engineering' | 'founders' | 'product' | null

/**
 * Get display area label
 */
export function getAreaLabel(area: ContactArea): string {
  switch (area) {
    case 'engineering':
      return 'Engineering'
    case 'founders':
      return 'Founders'
    case 'product':
      return 'Product'
    default:
      return '-'
  }
}

/**
 * Contact area options for dropdowns
 */
export const CONTACT_AREA_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'founders', label: 'Founders' },
  { value: 'product', label: 'Product' },
] as const
