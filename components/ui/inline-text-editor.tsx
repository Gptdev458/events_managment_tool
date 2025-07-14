'use client'

import { useState } from 'react'
import { Button } from './button'
import { Textarea } from './textarea'
import { Check, X, Edit3, StickyNote } from 'lucide-react'

interface InlineTextEditorProps {
  value: string | null
  onSave: (value: string) => Promise<void>
  onCancel?: () => void
  className?: string
  placeholder?: string
}

export function InlineTextEditor({ 
  value, 
  onSave, 
  onCancel,
  className = "",
  placeholder = "Click to add notes..."
}: InlineTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value || '')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(editValue.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue(value || '')
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
      <div className={`group flex items-start gap-2 min-h-[2rem] hover:bg-gray-50 rounded p-2 cursor-pointer ${className}`}>
        <div className="flex items-start gap-2 flex-1" onClick={handleEdit}>
          <StickyNote className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {value && value.trim() ? (
              <p className="text-sm whitespace-pre-wrap">
                {value}
              </p>
            ) : (
              <p className="text-gray-400 text-sm italic">
                {placeholder}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={handleEdit}
          title="Edit notes"
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-2 p-2 border rounded bg-white shadow-sm ${className}`} onKeyDown={handleKeyDown}>
      <Textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        placeholder="Add your notes here..."
        className="min-h-[80px] resize-none"
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
      <div className="text-xs text-gray-500">
        Tip: Press Ctrl+Enter to save, Escape to cancel
      </div>
    </div>
  )
} 