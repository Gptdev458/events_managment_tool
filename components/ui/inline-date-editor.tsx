'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Check, X, Edit3, Calendar, Clock } from 'lucide-react'

interface InlineDateEditorProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  onCancel?: () => void
  className?: string
  allowPastDates?: boolean
}

export function InlineDateEditor({ 
  value, 
  onSave, 
  onCancel,
  className = "",
  allowPastDates = false
}: InlineDateEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value ? new Date(value).toISOString().split('T')[0] : '')
  const [isSaving, setIsSaving] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false
    const actionDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    actionDate.setHours(0, 0, 0, 0)
    return actionDate < today
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value ? new Date(value).toISOString().split('T')[0] : '')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editValue) // Allow empty values to be saved
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value ? new Date(value).toISOString().split('T')[0] : '')
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter') {
      handleSave()
    }
  }

  // Get minimum date - either tomorrow for future dates or no minimum for past dates
  const getMinDate = () => {
    if (allowPastDates) {
      return undefined // No minimum date restriction
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const minDate = getMinDate()
  const overdue = isOverdue(value)

  if (!isEditing) {
    return (
      <div className={`group flex items-center gap-2 min-h-[2rem] hover:bg-gray-50 rounded p-1 cursor-pointer ${className}`}>
        <div className="flex items-center gap-2 flex-1" onClick={handleEdit}>
          {value ? (
            <>
              {overdue ? (
                <Clock className="h-4 w-4 text-red-600" />
              ) : (
                <Calendar className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-sm ${overdue ? 'font-medium text-red-600' : ''}`}>
                {formatDate(value)}
              </span>
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Click to set date</span>
            </>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={handleEdit}
          title="Edit date"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 p-2 border rounded bg-white shadow-sm ${className}`} onKeyDown={handleKeyDown}>
      <Input
        type="date"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        min={minDate}
        className="w-full"
        autoFocus
      />
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-8 px-3 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-8 px-3 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
} 