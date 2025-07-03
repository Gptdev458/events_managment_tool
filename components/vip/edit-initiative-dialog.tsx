'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateVipInitiative, deleteVipInitiative } from '@/lib/vip-actions'
import type { VipInitiative, VipInitiativeStatus } from '@/lib/database.types'
import { Trash2 } from 'lucide-react'

interface EditInitiativeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initiative: VipInitiative | null
  onSuccess: () => void
}

export function EditInitiativeDialog({ 
  open, 
  onOpenChange, 
  initiative,
  onSuccess 
}: EditInitiativeDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<VipInitiativeStatus>('active')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Reset form when initiative changes
  useEffect(() => {
    if (initiative) {
      setTitle(initiative.title || '')
      setDescription(initiative.description || '')
      setStatus(initiative.status)
    }
  }, [initiative])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!initiative || !title.trim()) return

    setLoading(true)
    try {
      await updateVipInitiative(initiative.id, {
        title: title.trim(),
        description: description.trim() || null,
        status
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating initiative:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!initiative) return
    
    setDeleting(true)
    try {
      await deleteVipInitiative(initiative.id)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting initiative:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleClose = () => {
    if (initiative) {
      setTitle(initiative.title || '')
      setDescription(initiative.description || '')
      setStatus(initiative.status)
    }
    onOpenChange(false)
  }

  if (!initiative) return null

  const isGive = initiative.type === 'give'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit {isGive ? 'Give' : 'Ask'} Initiative
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
            {isGive 
              ? 'Update how you plan to add value to this VIP relationship.'
              : 'Update your strategic request from this VIP.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Initiative Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isGive ? "e.g., Introduce to potential partners" : "e.g., Request introduction to investors"}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isGive 
                ? "Describe how this initiative will benefit the VIP..." 
                : "Explain the strategic value of this request..."
              }
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as VipInitiativeStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            className={isGive ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {loading ? 'Updating...' : `Update ${isGive ? 'Give' : 'Ask'} Initiative`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
