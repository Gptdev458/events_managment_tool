'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVipActivity } from '@/lib/vip-actions'
import type { VipActivityType, VipInitiative } from '@/lib/database.types'

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  initiatives: VipInitiative[]
  onSuccess: () => void
}

export function CreateActivityDialog({ 
  open, 
  onOpenChange, 
  contactId,
  initiatives,
  onSuccess 
}: CreateActivityDialogProps) {
  const [summary, setSummary] = useState('')
  const [notes, setNotes] = useState('')
  const [activityDate, setActivityDate] = useState('')
  const [type, setType] = useState<VipActivityType>('meeting')
  const [initiativeId, setInitiativeId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summary.trim()) return

    setLoading(true)
    try {
      await createVipActivity({
        contact_id: contactId,
        summary: summary.trim(),
        notes: notes.trim() || null,
        activity_date: activityDate || new Date().toISOString().split('T')[0],
        type,
        initiative_id: initiativeId === 'none' || !initiativeId ? null : initiativeId
      })
      
      // Reset form
      setSummary('')
      setNotes('')
      setActivityDate('')
      setType('meeting')
      setInitiativeId('')
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log New Activity</DialogTitle>
          <DialogDescription>
            Record an interaction or planned touchpoint with this VIP.
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
            <Label htmlFor="initiative">Link to Initiative (Optional)</Label>
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
        
        <DialogFooter>
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
            {loading ? 'Logging...' : 'Log Activity'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 