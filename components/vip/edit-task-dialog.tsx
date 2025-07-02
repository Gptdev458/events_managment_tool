'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateVipTask, deleteVipTask } from '@/lib/vip-actions'
import type { VipTask } from '@/lib/database.types'
import { Trash2 } from 'lucide-react'

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: VipTask | null
  onSuccess: () => void
}

export function EditTaskDialog({ open, onOpenChange, task, onSuccess }: EditTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: task?.name || '',
    status: task?.status || 'to_do',
    due_date: task?.due_date || '',
    outcome_notes: task?.outcome_notes || ''
  })

  // Reset form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        status: task.status,
        due_date: task.due_date || '',
        outcome_notes: task.outcome_notes || ''
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !task) return

    setLoading(true)
    try {
      await updateVipTask(task.id, {
        name: formData.name.trim(),
        status: formData.status as any,
        due_date: formData.due_date || null,
        outcome_notes: formData.outcome_notes || null
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!task) return
    
    setDeleting(true)
    try {
      await deleteVipTask(task.id)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (task) {
      setFormData({
        name: task.name,
        status: task.status,
        due_date: task.due_date || '',
        outcome_notes: task.outcome_notes || ''
      })
    }
    onOpenChange(false)
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Task
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-4"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Update task details or remove this task from the initiative.
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
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 