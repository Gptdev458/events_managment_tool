'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Contact } from '@/lib/supabase'
import { CONTACT_TYPES, PIPELINE_STAGES } from '@/lib/constants'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { 
  bulkUpdateContactType, 
  bulkUpdateCtoClubStatus, 
  bulkUpdateCompany, 
  bulkAddContactNotes, 
  bulkAddToPipeline, 
  bulkDeleteContacts 
} from '@/lib/actions'
import { Loader2, Users, AlertTriangle } from 'lucide-react'

type BulkOperationType = 'contact-type' | 'cto-club' | 'company' | 'notes' | 'pipeline' | 'delete'

interface BulkEditContactsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedContacts: Contact[]
  operationType: BulkOperationType
  onSuccess: () => void
}

export function BulkEditContactsDialog({
  open,
  onOpenChange,
  selectedContacts,
  operationType,
  onSuccess
}: BulkEditContactsDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [contactType, setContactType] = useState('')
  const [isCtoClub, setIsCtoClub] = useState(false)
  const [company, setCompany] = useState('')
  const [notes, setNotes] = useState('')
  const [pipelineStage, setPipelineStage] = useState('')
  const [nextActionDescription, setNextActionDescription] = useState('')
  const [nextActionDate, setNextActionDate] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const contactIds = selectedContacts.map(c => c.id)
      let result

      switch (operationType) {
        case 'contact-type':
          if (!contactType) {
            setError('Please select a contact type')
            return
          }
          result = await bulkUpdateContactType(contactIds, contactType)
          break

        case 'cto-club':
          result = await bulkUpdateCtoClubStatus(contactIds, isCtoClub)
          break

        case 'company':
          result = await bulkUpdateCompany(contactIds, company)
          break

        case 'notes':
          if (!notes.trim()) {
            setError('Please enter notes')
            return
          }
          result = await bulkAddContactNotes(contactIds, notes)
          break

        case 'pipeline':
          if (!pipelineStage || !nextActionDescription.trim() || !nextActionDate) {
            setError('Please fill in all pipeline fields')
            return
          }
          result = await bulkAddToPipeline(contactIds, {
            pipeline_stage: pipelineStage,
            next_action_description: nextActionDescription,
            next_action_date: nextActionDate
          })
          break

        case 'delete':
          result = await bulkDeleteContacts(contactIds)
          break

        default:
          setError('Invalid operation type')
          return
      }

      if (result.success) {
        onSuccess()
        onOpenChange(false)
        // Reset form
        setContactType('')
        setIsCtoClub(false)
        setCompany('')
        setNotes('')
        setPipelineStage('')
        setNextActionDescription('')
        setNextActionDate('')
      } else {
        setError(result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Bulk operation error:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getDialogTitle = () => {
    switch (operationType) {
      case 'contact-type': return 'Update Contact Type'
      case 'cto-club': return 'Update CTO Club Status'
      case 'company': return 'Update Company'
      case 'notes': return 'Add Notes'
      case 'pipeline': return 'Add to Pipeline'
      case 'delete': return 'Delete Contacts'
      default: return 'Bulk Edit'
    }
  }

  const getSubmitButtonText = () => {
    if (isLoading) return 'Processing...'
    switch (operationType) {
      case 'contact-type': return 'Update Type'
      case 'cto-club': return isCtoClub ? 'Add to CTO Club' : 'Remove from CTO Club'
      case 'company': return 'Update Company'
      case 'notes': return 'Add Notes'
      case 'pipeline': return 'Add to Pipeline'
      case 'delete': return 'Delete Contacts'
      default: return 'Apply Changes'
    }
  }

  const getSubmitButtonVariant = () => {
    return operationType === 'delete' ? 'destructive' : 'default'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {operationType === 'delete' ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Users className="h-4 w-4" />
            )}
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Contacts Preview */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">
              Selected Contacts ({selectedContacts.length})
            </Label>
            <div className="mt-2 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {selectedContacts.slice(0, 10).map((contact) => (
                <Badge key={contact.id} variant="secondary" className="text-xs">
                  {ContactBusinessLogic.getDisplayName(contact)}
                </Badge>
              ))}
              {selectedContacts.length > 10 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedContacts.length - 10} more
                </Badge>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Type Form */}
            {operationType === 'contact-type' && (
              <div className="space-y-2">
                <Label htmlFor="contactType">New Contact Type</Label>
                <Select value={contactType} onValueChange={setContactType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CTO Club Form */}
            {operationType === 'cto-club' && (
              <div className="space-y-2">
                <Label>CTO Club Status</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ctoClub"
                    checked={isCtoClub}
                    onCheckedChange={(checked) => setIsCtoClub(checked as boolean)}
                  />
                  <Label htmlFor="ctoClub" className="text-sm">
                    {isCtoClub ? 'Add to CTO Club' : 'Remove from CTO Club'}
                  </Label>
                </div>
              </div>
            )}

            {/* Company Form */}
            {operationType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Enter company name (leave empty to clear)"
                />
              </div>
            )}

            {/* Notes Form */}
            {operationType === 'notes' && (
              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes to add to all selected contacts..."
                  rows={3}
                />
              </div>
            )}

            {/* Pipeline Form */}
            {operationType === 'pipeline' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pipelineStage">Pipeline Stage</Label>
                  <Select value={pipelineStage} onValueChange={setPipelineStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pipeline stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map(stage => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextAction">Next Action Description</Label>
                  <Input
                    id="nextAction"
                    value={nextActionDescription}
                    onChange={(e) => setNextActionDescription(e.target.value)}
                    placeholder="e.g., Send follow-up email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextActionDate">Next Action Date</Label>
                  <Input
                    id="nextActionDate"
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Delete Confirmation */}
            {operationType === 'delete' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''}. 
                  This action cannot be undone.
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Contacts with existing event invitations or pipeline entries cannot be deleted.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={getSubmitButtonVariant()}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {getSubmitButtonText()}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
} 