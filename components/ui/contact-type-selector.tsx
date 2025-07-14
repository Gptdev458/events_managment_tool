'use client'

import { useState, useEffect, useTransition } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Loader2, Check, X } from 'lucide-react'
import { getAllContactTypes, createCustomContactType, generateValueFromLabel } from '@/lib/custom-contact-types-actions'
import { cn } from '@/lib/utils'

interface ContactTypeSelectorProps {
  value?: string | null
  onValueChange: (value: string | null) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  includeNoneOption?: boolean
  noneOptionLabel?: string
}

interface ContactTypeOption {
  value: string
  label: string
  isCustom?: boolean
}

export function ContactTypeSelector({
  value,
  onValueChange,
  placeholder = "Select contact type (optional)",
  className,
  disabled = false,
  includeNoneOption = true,
  noneOptionLabel = "None"
}: ContactTypeSelectorProps) {
  const [contactTypes, setContactTypes] = useState<ContactTypeOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [newTypeValue, setNewTypeValue] = useState('')
  const [isCreating, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // Load contact types on mount
  useEffect(() => {
    loadContactTypes()
  }, [])

  // Auto-generate value from label
  useEffect(() => {
    const updateValue = async () => {
      if (newTypeLabel) {
        const value = await generateValueFromLabel(newTypeLabel)
        setNewTypeValue(value)
      } else {
        setNewTypeValue('')
      }
    }
    updateValue()
  }, [newTypeLabel])

  const loadContactTypes = async () => {
    setIsLoading(true)
    try {
      const types = await getAllContactTypes()
      setContactTypes(types)
    } catch (error) {
      console.error('Failed to load contact types:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'add_new_type') {
      setShowAddDialog(true)
      return
    }
    
    if (selectedValue === 'none') {
      onValueChange(null)
    } else {
      onValueChange(selectedValue)
    }
  }

  const handleCreateCustomType = () => {
    if (!newTypeLabel.trim()) {
      setError('Label is required')
      return
    }

    startTransition(async () => {
      try {
        setError(null)
        const formData = new FormData()
        formData.append('label', newTypeLabel.trim())
        formData.append('value', newTypeValue.trim())

        const result = await createCustomContactType(formData)
        
        if (result.success && result.data) {
          // Reload contact types to include the new one
          await loadContactTypes()
          
          // Select the newly created type
          onValueChange(result.data.value)
          
          // Close dialog and reset form
          setShowAddDialog(false)
          setNewTypeLabel('')
          setNewTypeValue('')
        } else {
          setError(result.error || 'Failed to create contact type')
        }
      } catch (error) {
        setError('An unexpected error occurred')
        console.error('Error creating custom contact type:', error)
      }
    })
  }

  const handleCancelAdd = () => {
    setShowAddDialog(false)
    setNewTypeLabel('')
    setNewTypeValue('')
    setError(null)
  }

  return (
    <>
      <Select 
        value={value || 'none'} 
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeNoneOption && (
            <SelectItem value="none">{noneOptionLabel}</SelectItem>
          )}
          
          {contactTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              <div className="flex items-center gap-2">
                <span>{type.label}</span>
                {type.isCustom && (
                  <span className="text-xs text-muted-foreground">(Custom)</span>
                )}
              </div>
            </SelectItem>
          ))}
          
          <SelectItem value="add_new_type" className="text-primary font-medium">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Add new type...</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Add New Type Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact Type</DialogTitle>
            <DialogDescription>
              Create a custom contact type that will be available across your contact management.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type-label">Display Label *</Label>
              <Input
                id="type-label"
                placeholder="e.g., Startup Founder"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                disabled={isCreating}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type-value">System Value</Label>
              <Input
                id="type-value"
                placeholder="Auto-generated from label"
                value={newTypeValue}
                onChange={(e) => setNewTypeValue(e.target.value)}
                disabled={isCreating}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                This is the internal identifier. It's auto-generated but you can customize it.
                Use only lowercase letters and underscores.
              </p>
            </div>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelAdd}
              disabled={isCreating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCustomType}
              disabled={isCreating || !newTypeLabel.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Type
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 