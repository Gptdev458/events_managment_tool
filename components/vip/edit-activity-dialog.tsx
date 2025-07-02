'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateVipActivity, deleteVipActivity } from '@/lib/vip-actions'
import type { VipActivity, VipActivityType, VipInitiative } from '@/lib/database.types'
import { Trash2 } from 'lucide-react'

interface EditActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activity: VipActivity | null
  initiatives: VipInitiative[]
  onSuccess: () => void
}

export function EditActivityDialog({ 
  open, 
  onOpenChange, 
  activity,
  initiatives,
  onSuccess 
}: EditActivityDialogProps) {
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [type, setType] = useState<VipActivityType>('meeting')
  const [initiativeId, setInitiativeId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Reset form when activity changes
  useEffect(() => {
    if (activity) {
      setSummary(activity.summary || '')
      setNotes(activity.notes || '')
      setActivityDate(activity.activity_date || '')
      setType(activity.type)
      setInitiativeId(activity.initiative_id || 'none')
    }
  }, [activity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activity || !summary.trim()) return

    setLoading(true)
    try {
      await updateVipActivity(activity.id, {
        summary: summary.trim(),
        notes: notes.trim() || null,
        activity_date: activityDate,
        type,
        initiative_id: initiativeId === 'none' || !initiativeId ? null : initiativeId
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!activity) return

    setLoading(true)
    try {
      await deleteVipActivity(activity.id)
      onSuccess()
      onOpenChange(false)
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting activity:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Update activity details or change the linked initiative.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Activity Summary *</Label>
            <Input
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., Coffee meeting to discuss new project"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as VipActivityType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="info_share">Info Share</SelectItem>
                  <SelectItem value="future_touchpoint">Future Touchpoint</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initiative">Link to Initiative</Label>
            <Select value={initiativeId} onValueChange={setInitiativeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select an initiative..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No initiative</SelectItem>
                {initiatives.map(initiative => (
                  <SelectItem key={initiative.id} value={initiative.id}>
                    {initiative.title} ({initiative.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Detailed Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detailed notes about the interaction, outcomes, next steps..."
              rows={4}
            />
          </div>
        </form>
        
        <DialogFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="mr-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={!summary.trim() || loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Activity'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
} 