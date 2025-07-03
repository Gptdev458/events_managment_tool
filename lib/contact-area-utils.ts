// Utility functions for handling contact area field stored in general_notes
// This is a temporary solution until we can add a proper area column to the database

export type ContactArea = 'engineering' | 'founders' | 'product' | null

const AREA_PREFIX = 'AREA:'
const AREA_SEPARATOR = '\n---\n'

/**
 * Extract area from general_notes field
 */
export function extractAreaFromNotes(generalNotes: string | null): ContactArea {
  if (!generalNotes) return null
  
  const lines = generalNotes.split('\n')
  const areaLine = lines.find(line => line.startsWith(AREA_PREFIX))
  
  if (!areaLine) return null
  
  const area = areaLine.replace(AREA_PREFIX, '').trim()
  if (area === 'engineering' || area === 'founders' || area === 'product') {
    return area
  }
  
  return null
}

/**
 * Extract clean notes (without area) from general_notes field
 */
export function extractNotesWithoutArea(generalNotes: string | null): string | null {
  if (!generalNotes) return null
  
  const lines = generalNotes.split('\n')
  const cleanLines = lines.filter(line => !line.startsWith(AREA_PREFIX))
  const cleanNotes = cleanLines.join('\n').trim()
  
  return cleanNotes || null
}

/**
 * Combine notes and area into general_notes field
 */
export function combineNotesWithArea(notes: string | null, area: ContactArea): string | null {
  const cleanNotes = notes?.trim() || ''
  
  if (!area) {
    return cleanNotes || null
  }
  
  const areaLine = `${AREA_PREFIX}${area}`
  
  if (!cleanNotes) {
    return areaLine
  }
  
  return `${cleanNotes}\n${areaLine}`
}

/**
 * Update area in existing general_notes
 */
export function updateAreaInNotes(generalNotes: string | null, newArea: ContactArea): string | null {
  const existingNotes = extractNotesWithoutArea(generalNotes)
  return combineNotesWithArea(existingNotes, newArea)
}

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
