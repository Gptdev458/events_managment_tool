'use client'

import { useState } from 'react'
import { Button } from './button'
import { InlineActionSelector } from './inline-action-selector'
import { Check, X, Edit3 } from 'lucide-react'

interface InlineActionEditorProps {
  value: string
  onSave: (value: string) => Promise<void>
  onCancel?: () => void
  className?: string
}

export function InlineActionEditor({ 
  value, 
  onSave, 
  onCancel,
  className = ""
}: InlineActionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value)
  }

  const handleSave = async () => {
    if (editValue.trim() === '') return
    
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value)
    onCancel?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  if (!isEditing) {
    return (
      <div className={`group flex items-center gap-2 min-h-[2rem] hover:bg-gray-50 rounded p-1 cursor-pointer ${className}`}>
        <span className="font-medium text-sm flex-1" onClick={handleEdit}>
          {value || <span className="text-gray-400">Click to add action</span>}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={handleEdit}
          title="Edit action"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 p-2 border rounded bg-white shadow-sm ${className}`} onKeyDown={handleKeyDown}>
      <InlineActionSelector
        value={editValue}
        onChange={setEditValue}
        placeholder="Enter next action..."
        className="w-full"
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
          disabled={isSaving || editValue.trim() === ''}
          className="h-8 px-3 text-xs"
        >
          <Check className="h-3 w-3 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  )
} 