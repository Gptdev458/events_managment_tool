'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/lib/database.types"
import { ContactBusinessLogic } from "@/lib/business-logic"
import { addToPipeline, getCtoPotentialMembers } from "@/lib/cto-club-actions"
import { CTO_PIPELINE_STATUSES, CTO_NEXT_ACTIONS } from "@/lib/cto-club-constants"

interface AddToPipelineDialogProps {
  isOpen: boolean
  onClose: () => void
  availableContacts: Contact[]
}

export function AddToPipelineDialog({ isOpen, onClose, availableContacts }: AddToPipelineDialogProps) {
  const [selectedContactId, setSelectedContactId] = useState('')
  const [status, setStatus] = useState('new')
  const [nextAction, setNextAction] = useState('')
  const [nextActionDate, setNextActionDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [potentialMemberIds, setPotentialMemberIds] = useState<Set<string>>(new Set())

  // Fetch potential members to show badges
  useEffect(() => {
    if (isOpen) {
      getCtoPotentialMembers().then(potentialMembers => {
        const ids = new Set(potentialMembers.map(pm => pm.contact_id))
        setPotentialMemberIds(ids)
      }).catch(() => {
        setPotentialMemberIds(new Set())
      })
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!selectedContactId || !status) return
    
    setIsLoading(true)
    try {
      await addToPipeline(
        selectedContactId, 
        status, 
        nextAction || undefined, 
        nextActionDate || undefined
      )
      onClose()
      setSelectedContactId('')
      setStatus('new')
      setNextAction('')
      setNextActionDate('')
    } catch (error) {
      console.error('Error adding to pipeline:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedContactId('')
    setStatus('new')
    setNextAction('')
    setNextActionDate('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to CTO Club Pipeline</DialogTitle>
          <DialogDescription>
            Add a contact to the CTO Club recruitment pipeline to track their progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="contact">Contact</Label>
            <Select value={selectedContactId} onValueChange={setSelectedContactId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact" />
              </SelectTrigger>
              <SelectContent>
                {availableContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{ContactBusinessLogic.getDisplayName(contact)}</span>
                          {potentialMemberIds.has(contact.id) && (
                            <Badge variant="secondary" className="text-xs">
                              Potential Member
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {contact.company} - {contact.job_title}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Select from all contacts including potential members
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CTO_PIPELINE_STATUSES.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="next-action">Next Action (Optional)</Label>
            <Select value={nextAction} onValueChange={setNextAction}>
              <SelectTrigger>
                <SelectValue placeholder="Select next action" />
              </SelectTrigger>
              <SelectContent>
                {CTO_NEXT_ACTIONS.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="next-action-date">Next Action Date (Optional)</Label>
            <Input
              id="next-action-date"
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedContactId || !status || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add to Pipeline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 