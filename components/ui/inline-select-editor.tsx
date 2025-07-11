'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineSelectEditorProps {
  value: string | null
  options: { value: string; label: string; className?: string }[]
  onSave: (value: string) => Promise<void>
  onCancel?: () => void
  placeholder?: string
  className?: string
  displayClassName?: string
}

export function InlineSelectEditor({
  value,
  options,
  onSave,
  onCancel,
  placeholder = "Select...",
  className = "",
  displayClassName = ""
}: InlineSelectEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const currentOption = options.find(opt => opt.value === value)

  const handleEdit = () => {
    setIsEditing(true)
    setEditValue(value || '')
  }

  const handleSave = async () => {
    if (!editValue) return
    
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
    setEditValue(value || '')
    onCancel?.()
  }

  if (!isEditing) {
    return (
      <div className={className} onClick={handleEdit}>
        {currentOption ? (
          <Badge 
            variant="secondary" 
            className={cn("capitalize cursor-pointer hover:opacity-80", currentOption.className)}
          >
            {currentOption.label}
          </Badge>
        ) : (
          <Badge 
            variant="outline" 
            className="text-gray-400 cursor-pointer hover:opacity-80"
          >
            {placeholder}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={editValue} onValueChange={setEditValue}>
        <SelectTrigger className="h-8 text-sm flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
          onClick={handleSave}
          disabled={isSaving}
          title="Save"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-gray-600 hover:text-gray-700"
          onClick={handleCancel}
          disabled={isSaving}
          title="Cancel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 