'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createVipInitiative } from '@/lib/vip-actions'
import type { VipInitiativeType, VipInitiativeStatus } from '@/lib/database.types'

interface CreateInitiativeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId: string
  type: VipInitiativeType
  onSuccess: () => void
}

export function CreateInitiativeDialog({ 
  open, 
  onOpenChange, 
  contactId, 
  type,
  onSuccess 
}: CreateInitiativeDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<VipInitiativeStatus>('active')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await createVipInitiative({
        contact_id: contactId,
        title: title.trim(),
        description: description.trim() || null,
        type,
        status
      })
      
      // Reset form
      setTitle('')
      setDescription('')
      setStatus('active')
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating initiative:', error)
    } finally {
      setLoading(false)
    }
  }

  const isGive = type === 'give'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Create {isGive ? 'Give' : 'Ask'} Initiative
          </DialogTitle>
          <DialogDescription>
            {isGive 
              ? 'Define how you plan to add value to this VIP relationship.'
              : 'Outline a strategic request you\'d like to make from this VIP.'
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
              placeholder={isGive 
                ? "e.g., Support their education policy initiative"
                : "e.g., Introduction to tech industry leaders"
              }
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
                ? "Describe how you plan to provide value..."
                : "Explain what you'd like to request and why..."
              }
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
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
            onClick={() => onOpenChange(false)}
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
            {loading ? 'Creating...' : `Create ${isGive ? 'Give' : 'Ask'} Initiative`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 