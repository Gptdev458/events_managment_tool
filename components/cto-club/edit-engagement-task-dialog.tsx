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
import { updateCtoClubEngagementTask } from '@/lib/cto-club-engagement-actions'
import type { CtoClubEngagementTask } from '@/lib/cto-club-engagement-actions'

interface EditEngagementTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  task: CtoClubEngagementTask | null
}

export function EditEngagementTaskDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  task 
}: EditEngagementTaskDialogProps) {
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<'to_do' | 'in_progress' | 'done' | 'cancelled'>('to_do')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setName(task.name)
      setNotes(task.notes || '')
      setDueDate(task.due_date || '')
      setStatus(task.status)
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task || !name.trim()) return

    setLoading(true)
    try {
      await updateCtoClubEngagementTask(task.id, {
        name: name.trim(),
        notes: notes.trim() || undefined,
        due_date: dueDate || undefined,
        status
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating engagement task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Update the details of this task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                placeholder="e.g., Reserve restaurant"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_do">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or details about this task..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 