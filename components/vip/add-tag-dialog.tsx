'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getVipTags, createVipTag, addTagToContact } from '@/lib/vip-actions'
import type { VipTag } from '@/lib/database.types'

interface AddTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  existingTags: VipTag[]
  onSuccess: () => void
}

export function AddTagDialog({ open, onOpenChange, contactId, existingTags, onSuccess }: AddTagDialogProps) {
  const [loading, setLoading] = useState(false)
  const [allTags, setAllTags] = useState<VipTag[]>([])
  const [selectedTagId, setSelectedTagId] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [mode, setMode] = useState<'select' | 'create'>('select')

  const existingTagIds = existingTags.map(tag => tag.id)
  const availableTags = allTags.filter(tag => !existingTagIds.includes(tag.id))

  useEffect(() => {
    if (open) {
      loadAllTags()
    }
  }, [open])

  const loadAllTags = async () => {
    try {
      const tags = await getVipTags()
      setAllTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'create' && newTagName.trim()) {
        // Create new tag and add to contact
        const newTag = await createVipTag({ name: newTagName.trim() })
        await addTagToContact(contactId, newTag.id)
      } else if (mode === 'select' && selectedTagId) {
        // Add existing tag to contact
        await addTagToContact(contactId, selectedTagId)
      }

      // Reset form
      setSelectedTagId('')
      setNewTagName('')
      setMode('select')
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error adding tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedTagId('')
    setNewTagName('')
    setMode('select')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Interest Tag</DialogTitle>
          <DialogDescription>
            Tag this VIP's interests and focus areas for better relationship management.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={mode === 'select' ? 'default' : 'outline'}
                onClick={() => setMode('select')}
                className="flex-1"
              >
                Select Existing
              </Button>
              <Button
                type="button"
                variant={mode === 'create' ? 'default' : 'outline'}
                onClick={() => setMode('create')}
                className="flex-1"
              >
                Create New
              </Button>
            </div>

            {mode === 'select' ? (
              <div className="space-y-2">
                <Label htmlFor="tag-select">Choose from existing tags</Label>
                {availableTags.length > 0 ? (
                  <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">
                    All available tags are already added to this VIP.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="new-tag">Create new tag</Label>
                <Input
                  id="new-tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g., Charity: Education, Policy: Tech"
                  required={mode === 'create'}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading || 
                (mode === 'select' && !selectedTagId) ||
                (mode === 'create' && !newTagName.trim()) ||
                (mode === 'select' && availableTags.length === 0)
              }
            >
              {loading ? 'Adding...' : 'Add Tag'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 