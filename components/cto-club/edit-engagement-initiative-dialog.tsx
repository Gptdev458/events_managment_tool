'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateCtoClubEngagementInitiative } from '@/lib/cto-club-engagement-actions'
import type { CtoClubEngagementInitiative } from '@/lib/cto-club-engagement-actions'

interface EditEngagementInitiativeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initiative: CtoClubEngagementInitiative | null
}

export function EditEngagementInitiativeDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  initiative 
}: EditEngagementInitiativeDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'on_hold' | 'completed' | 'archived'>('active')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initiative) {
      setTitle(initiative.title)
      setDescription(initiative.description || '')
      setStatus(initiative.status)
    }
  }, [initiative])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initiative || !title.trim()) return

    setLoading(true)
    try {
      await updateCtoClubEngagementInitiative(initiative.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating engagement initiative:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Engagement Initiative</DialogTitle>
          <DialogDescription>
            Update the details of this engagement initiative.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Initiative Title</Label>
              <Input
                id="title"
                placeholder="e.g., Quarterly Member Dinner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of this initiative..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Updating...' : 'Update Initiative'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 