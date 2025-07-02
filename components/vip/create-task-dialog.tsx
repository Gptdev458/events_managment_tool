'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createVipTask } from '@/lib/vip-actions'
import type { VipTaskInsert } from '@/lib/database.types'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initiativeId: string
  onSuccess: () => void
}

export function CreateTaskDialog({ open, onOpenChange, initiativeId, onSuccess }: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    status: 'to_do' as const,
    due_date: '',
    outcome_notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const taskData: VipTaskInsert = {
        initiative_id: initiativeId,
        name: formData.name.trim(),
        status: formData.status,
        due_date: formData.due_date || null,
        outcome_notes: formData.outcome_notes || null
      }

      await createVipTask(taskData)
      
      // Reset form
      setFormData({
        name: '',
        status: 'to_do',
        due_date: '',
        outcome_notes: ''
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      status: 'to_do',
      due_date: '',
      outcome_notes: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Break down this initiative into actionable tasks.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Connect with industry expert, Research topic X"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="to_do">To-Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome_notes">Outcome/Notes (Optional)</Label>
            <Textarea
              id="outcome_notes"
              value={formData.outcome_notes}
              onChange={(e) => setFormData({ ...formData, outcome_notes: e.target.value })}
              placeholder="Add notes about results or outcomes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 