'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Mail, ExternalLink, Edit, Trash2, Save, X, UserPlus, Linkedin, TrendingUp, Loader2 } from "lucide-react"
import type { Contact } from "@/lib/database.types"
import type { CtoPotentialMemberWithContact } from "@/lib/cto-club-actions"
import { ContactBusinessLogic } from "@/lib/business-logic"
import { AddPotentialMemberDialog } from "./add-potential-member-dialog"
import { EditContactDialog } from "@/components/contacts/edit-contact-dialog"
import { updatePotentialMemberNotes, removeFromPotentialMembers, addToPipeline } from "@/lib/cto-club-actions"

interface PotentialMembersTabProps {
  potentialMembers: CtoPotentialMemberWithContact[]
  availableContacts: Contact[]
  availableForPipeline: Contact[]
  pipelineStatusMap: Map<string, string>
}

export function PotentialMembersTab({ 
  potentialMembers, 
  availableContacts, 
  availableForPipeline,
  pipelineStatusMap 
}: PotentialMembersTabProps) {
  const [editingNotes, setEditingNotes] = useState<number | null>(null)
  const [notesValue, setNotesValue] = useState('')
  const [isLoading, setIsLoading] = useState<number | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPipelineDialogOpen, setIsPipelineDialogOpen] = useState(false)
  const [selectedContactForPipeline, setSelectedContactForPipeline] = useState<Contact | null>(null)
  const [pipelineForm, setPipelineForm] = useState({
    status: '',
    next_action: '',
    next_action_date: ''
  })
  const [isPipelineSubmitting, setIsPipelineSubmitting] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleEditNotes = (id: number, currentNotes: string | null) => {
    setEditingNotes(id)
    setNotesValue(currentNotes || '')
  }

  const handleSaveNotes = async (id: number) => {
    setIsLoading(id)
    try {
      await updatePotentialMemberNotes(id, notesValue)
      setEditingNotes(null)
    } catch (error) {
      console.error('Error updating notes:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingNotes(null)
    setNotesValue('')
  }

  const handleAddToPipeline = (contact: Contact) => {
    setSelectedContactForPipeline(contact)
    setPipelineForm({
      status: '',
      next_action: '',
      next_action_date: ''
    })
    setIsPipelineDialogOpen(true)
  }

  const handlePipelineDialogClose = () => {
    setIsPipelineDialogOpen(false)
    setSelectedContactForPipeline(null)
    setPipelineForm({
      status: '',
      next_action: '',
      next_action_date: ''
    })
  }

  const handlePipelineSubmit = async () => {
    if (!selectedContactForPipeline || !pipelineForm.status) return

    setIsPipelineSubmitting(true)
    try {
      await addToPipeline(
        selectedContactForPipeline.id,
        pipelineForm.status,
        pipelineForm.next_action || undefined,
        pipelineForm.next_action_date || undefined
      )
      handlePipelineDialogClose()
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error adding to pipeline:', error)
    } finally {
      setIsPipelineSubmitting(false)
    }
  }

  const getPipelineStatus = (contactId: string) => {
    return pipelineStatusMap.get(contactId)
  }

  const isInPipeline = (contactId: string) => {
    return pipelineStatusMap.has(contactId)
  }

  // Get tomorrow as default date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  if (potentialMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Potential Members</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">0 potential members</Badge>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Potential Member
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Contacts being evaluated for CTO Club membership
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No potential members</h3>
            <p className="text-gray-600 mb-4">
              Add contacts to track them as potential CTO Club members with notes.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Potential Member
            </Button>
          </div>
        </CardContent>

        <AddPotentialMemberDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          availableContacts={availableContacts}
        />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Potential Members</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{potentialMembers.length} potential members</Badge>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Potential Member
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Contacts being evaluated for CTO Club membership
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name & Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {potentialMembers.map((member) => {
              const pipelineStatus = getPipelineStatus(member.contact_id)
              const inPipeline = isInPipeline(member.contact_id)
              
              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {ContactBusinessLogic.getDisplayName(member.contacts)}
                          </span>
                          {member.contacts.linkedin_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-6 w-6 p-0 hover:bg-blue-50"
                            >
                              <a 
                                href={member.contacts.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View LinkedIn Profile"
                              >
                                <Linkedin className="h-3 w-3 text-blue-600" />
                              </a>
                            </Button>
                          )}
                        </div>
                        {member.contacts.job_title && (
                          <div className="text-xs text-gray-500 mt-0.5">{member.contacts.job_title}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{member.contacts.company || 'No Company'}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {member.contacts.email ? (
                        <a 
                          href={`mailto:${member.contacts.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {member.contacts.email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No email</span>
                      )}
                      {member.contacts.linkedin_url && (
                        <a 
                          href={member.contacts.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Linkedin className="h-3 w-3" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {inPipeline ? (
                        <Badge variant="default" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          In Pipeline
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Potential Member
                        </Badge>
                      )}
                      {pipelineStatus && (
                        <Badge 
                          variant={pipelineStatus === 'ready for next step' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {pipelineStatus}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingNotes === member.id ? (
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        <Textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add notes about this potential member..."
                          className="min-h-[60px]"
                        />
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSaveNotes(member.id)}
                            disabled={isLoading === member.id}
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            disabled={isLoading === member.id}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="max-w-[200px] cursor-pointer hover:bg-gray-50 p-2 rounded"
                        onClick={() => handleEditNotes(member.id, member.notes)}
                        title="Click to edit notes"
                      >
                        <p className="text-sm text-gray-600 truncate">
                          {member.notes || 'Click to add notes...'}
                        </p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatDate(member.added_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditContactDialog 
                        key={`edit-${member.id}-${member.contacts.id}`}
                        contact={member.contacts} 
                        onRemoveFromPotentialMembers={() => removeFromPotentialMembers(member.id)}
                        showPotentialMemberActions={true}
                      />
                      {!inPipeline && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToPipeline(member.contacts)}
                          title="Add to Pipeline"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>

      <AddPotentialMemberDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        availableContacts={availableContacts}
      />

      {/* Custom Add to Pipeline Dialog */}
      <Dialog open={isPipelineDialogOpen} onOpenChange={handlePipelineDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add to CTO Club Pipeline</DialogTitle>
            <DialogDescription>
              Add {selectedContactForPipeline?.name || selectedContactForPipeline?.email} to the CTO Club recruitment pipeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Pipeline Status</Label>
              <Select value={pipelineForm.status} onValueChange={(value) => setPipelineForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pipeline status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial contact">Initial Contact</SelectItem>
                  <SelectItem value="follow up">Follow Up</SelectItem>
                  <SelectItem value="meeting scheduled">Meeting Scheduled</SelectItem>
                  <SelectItem value="meeting completed">Meeting Completed</SelectItem>
                  <SelectItem value="ready for next step">Ready for Next Step</SelectItem>
                  <SelectItem value="on hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_action">Next Action (Optional)</Label>
              <Input
                id="next_action"
                placeholder="e.g., Schedule follow-up call"
                value={pipelineForm.next_action}
                onChange={(e) => setPipelineForm(prev => ({ ...prev, next_action: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_action_date">Next Action Date (Optional)</Label>
              <Input
                id="next_action_date"
                type="date"
                value={pipelineForm.next_action_date || defaultDate}
                onChange={(e) => setPipelineForm(prev => ({ ...prev, next_action_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handlePipelineDialogClose} disabled={isPipelineSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handlePipelineSubmit} 
              disabled={!pipelineForm.status || isPipelineSubmitting}
            >
              {isPipelineSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Pipeline'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 