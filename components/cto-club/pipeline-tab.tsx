'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { InlineDateEditor } from "@/components/ui/inline-date-editor"
import { InlineTextEditor } from "@/components/ui/inline-text-editor"
import { 
  Plus, 
  Mail, 
  Calendar, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  UserCheck,
  Linkedin,
  Loader2
} from "lucide-react"
import type { Contact } from "@/lib/database.types"
import type { CtoPipelineItemWithContact } from "@/lib/cto-club-actions"
import { ContactBusinessLogic } from "@/lib/business-logic"
import { CONTACT_TYPES, FOLLOW_UP_ACTIONS, PIPELINE_STAGES } from "@/lib/constants"
import { CONTACT_AREA_OPTIONS } from "@/lib/contact-area-utils"
import { getCtoStatusStyle, getCtoStatusLevel } from "@/lib/pipeline-styles"
import { getUpdatedRelationshipStage, RELATIONSHIP_ACTION_TO_STAGE_MAP } from "@/lib/pipeline-stage-auto-update"
import { AddToPipelineDialog } from "./add-to-pipeline-dialog"
import { updatePipelineItem, removeFromPipeline } from "@/lib/cto-club-actions"
import { updateContact, deleteContact } from "@/lib/actions"

interface PipelineTabProps {
  pipelineItems: CtoPipelineItemWithContact[]
  availableContacts: Contact[]
}

export function PipelineTab({ pipelineItems, availableContacts }: PipelineTabProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  
  // Full edit dialog state
  const [isFullEditOpen, setIsFullEditOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<CtoPipelineItemWithContact | null>(null)
  const [contactEditValues, setContactEditValues] = useState({
    name: '',
    email: '',
    company: '',
    job_title: '',
    linkedin_url: '',
    contact_type: '',
    area: '',
    general_notes: ''
  })
  const [isFullEditLoading, setIsFullEditLoading] = useState(false)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'Initial Outreach': return 'secondary'
      case 'Forming the Relationship': return 'default'
      case 'Maintaining the Relationship': return 'outline'
      default: return 'secondary'
    }
  }

  const handleFullEdit = (item: CtoPipelineItemWithContact) => {
    setEditingContact(item)
    setContactEditValues({
      name: item.contacts.name || '',
      email: item.contacts.email || '',
      company: item.contacts.company || '',
      job_title: item.contacts.job_title || '',
      linkedin_url: item.contacts.linkedin_url || '',
      contact_type: item.contacts.contact_type && item.contacts.contact_type.trim() !== '' ? item.contacts.contact_type : 'none',
      area: item.contacts.area && item.contacts.area.trim() !== '' ? item.contacts.area : 'none',
      general_notes: item.contacts.general_notes || ''
    })
    setIsFullEditOpen(true)
  }

  const handleSaveFullEdit = async () => {
    if (!editingContact) return
    
    setIsFullEditLoading(true)
    try {
      // Update contact details
      const contactFormData = new FormData()
      Object.entries(contactEditValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'none') {
          contactFormData.append(key, value.toString())
        }
      })
      
      const contactResult = await updateContact(editingContact.contacts.id, contactFormData)
      if (!contactResult.success) {
        throw new Error(contactResult.error || 'Failed to update contact')
      }
      
      setIsFullEditOpen(false)
      setEditingContact(null)
      
      // No need to reload - the component will update automatically
    } catch (error) {
      console.error('Error saving full edit:', error)
    } finally {
      setIsFullEditLoading(false)
    }
  }

  const handleCancelFullEdit = () => {
    setIsFullEditOpen(false)
    setEditingContact(null)
    setContactEditValues({
      name: '',
      email: '',
      company: '',
      job_title: '',
      linkedin_url: '',
      contact_type: '',
      area: '',
      general_notes: ''
    })
  }

  const handleRemoveFromPipeline = async (id: number) => {
    try {
      await removeFromPipeline(id)
      // No need to reload - the component will update automatically
    } catch (error) {
      console.error('Error removing from pipeline:', error)
    }
  }

  // Add handler for inline updates with auto-status detection
  const handleInlineUpdate = async (itemId: number, field: 'next_action' | 'next_action_date' | 'last_action_date' | 'notes', value: string) => {
    const item = pipelineItems.find(p => p.id === itemId)
    if (!item) return

    try {
      let updatedStatus = item.status
      
      // Auto-update status when next action is changed
      if (field === 'next_action') {
        console.log('=== CTO Stage Auto-update Debug ===')
        console.log('Current stage:', item.status)
        console.log('Selected action:', value)
        console.log('Available actions in mapping:', Object.keys(RELATIONSHIP_ACTION_TO_STAGE_MAP))
        
        updatedStatus = getUpdatedRelationshipStage(item.status, value)
        
        console.log('Calculated new stage:', updatedStatus)
        console.log('Stage changed:', item.status !== updatedStatus)
        console.log('============================')
      }
      
      const updatedValues = {
        status: updatedStatus,
        next_action: field === 'next_action' ? value : (item.next_action || ''),
        next_action_date: field === 'next_action_date' ? value : (item.next_action_date || ''),
        last_action_date: field === 'last_action_date' ? value : (item.last_action_date || ''),
        notes: field === 'notes' ? value : (item.notes || '')
      }

      console.log('Sending update with values:', updatedValues)
      await updatePipelineItem(itemId, updatedValues)
      
      // Don't reload to avoid tab reset - let the component update naturally
    } catch (error) {
      console.error('Failed to update pipeline item:', error)
      throw error
    }
  }

  if (pipelineItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recruitment Pipeline</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">0 in pipeline</Badge>
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add to Pipeline
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Track CTO Club recruitment progress and next actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pipeline items</h3>
            <p className="text-gray-600 mb-4">
              Add contacts to track their progress through the CTO Club recruitment process.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add to Pipeline
            </Button>
          </div>
        </CardContent>

        <AddToPipelineDialog
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
          <span>Recruitment Pipeline</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{pipelineItems.length} in pipeline</Badge>
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add to Pipeline
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Track CTO Club recruitment progress and next actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name & Company</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Next Action</TableHead>
              <TableHead>Next Action Date</TableHead>
              <TableHead>Last Action</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pipelineItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {ContactBusinessLogic.getDisplayName(item.contacts)}
                      </span>
                      {item.contacts.linkedin_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-6 w-6 p-0 hover:bg-blue-50"
                        >
                          <a 
                            href={item.contacts.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View LinkedIn Profile"
                          >
                            <Linkedin className="h-3 w-3 text-blue-600" />
                          </a>
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600">
                        {item.contacts.company || 'No Company'}
                      </span>
                      {item.contacts.email && (
                        <a 
                          href={`mailto:${item.contacts.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStageBadgeVariant(item.status)}>
                    {PIPELINE_STAGES.find(s => s.value === item.status)?.label || item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="min-w-[200px]">
                    {/* CTO-specific action selector */}
                    <Select 
                      value={item.next_action || ''} 
                      onValueChange={(value) => handleInlineUpdate(item.id, 'next_action', value)}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FOLLOW_UP_ACTIONS).map(([categoryKey, category]) => [
                          <SelectItem key={`${categoryKey}-header`} value={`${categoryKey}-header`} disabled className="text-xs font-medium text-gray-500 bg-gray-50">
                            {category.label}
                          </SelectItem>,
                          ...category.actions.map((action) => (
                            <SelectItem key={`${categoryKey}-${action}`} value={action} className="text-sm pl-4">
                              {action}
                            </SelectItem>
                          ))
                        ]).flat()}
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
                <TableCell>
                  <InlineDateEditor
                    value={item.next_action_date}
                    onSave={(value) => handleInlineUpdate(item.id, 'next_action_date', value)}
                  />
                </TableCell>
                <TableCell>
                  <InlineDateEditor
                    value={item.last_action_date}
                    onSave={(value) => handleInlineUpdate(item.id, 'last_action_date', value)}
                    allowPastDates={true}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-w-[200px]">
                    <InlineTextEditor
                      value={item.notes}
                      onSave={(value) => handleInlineUpdate(item.id, 'notes', value)}
                      placeholder="Click to add notes..."
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFullEdit(item)}
                      title="Edit contact & pipeline info"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <AddToPipelineDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        availableContacts={availableContacts}
      />

      {/* Comprehensive Edit Dialog */}
      <Dialog open={isFullEditOpen} onOpenChange={handleCancelFullEdit}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
                      <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>
            Update contact details for {editingContact?.contacts.name || editingContact?.contacts.email}
          </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={contactEditValues.name}
                    onChange={(e) => setContactEditValues(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactEditValues.email}
                    onChange={(e) => setContactEditValues(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={contactEditValues.company}
                    onChange={(e) => setContactEditValues(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={contactEditValues.job_title}
                    onChange={(e) => setContactEditValues(prev => ({ ...prev, job_title: e.target.value }))}
                    placeholder="CTO, CEO, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_type">Contact Type</Label>
                  <Select value={contactEditValues.contact_type} onValueChange={(value) => setContactEditValues(prev => ({ ...prev, contact_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="none">No contact type</SelectItem>
                       {CONTACT_TYPES.filter(type => type.value && type.value.trim() !== '').map((type) => (
                         <SelectItem key={type.value} value={type.value}>
                           {type.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Select value={contactEditValues.area} onValueChange={(value) => setContactEditValues(prev => ({ ...prev, area: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                                         <SelectContent>
                       <SelectItem value="none">No area</SelectItem>
                       {CONTACT_AREA_OPTIONS.filter(area => area.value && area.value.trim() !== '').map((area) => (
                         <SelectItem key={area.value} value={area.value}>
                           {area.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={contactEditValues.linkedin_url}
                  onChange={(e) => setContactEditValues(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="general_notes">General Notes</Label>
                <Textarea
                  id="general_notes"
                  value={contactEditValues.general_notes}
                  onChange={(e) => setContactEditValues(prev => ({ ...prev, general_notes: e.target.value }))}
                  placeholder="General information about this contact..."
                  className="min-h-[80px]"
                />
              </div>
            </div>


          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCancelFullEdit} disabled={isFullEditLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleRemoveFromPipeline(editingContact?.id || 0)}
              disabled={isFullEditLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove from Pipeline
            </Button>
            <Button onClick={handleSaveFullEdit} disabled={isFullEditLoading}>
              {isFullEditLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 