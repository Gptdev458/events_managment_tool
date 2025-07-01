'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react'
import { updateInvitationStatus, removeContactFromEvent } from '@/lib/actions'
import { INVITATION_STATUSES } from '@/lib/constants'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

import { Contact } from '@/lib/supabase'
import { ContactBusinessLogic } from '@/lib/business-logic'

interface Invitation {
  id: number
  event_id: string
  contact_id: string
  status: string
  invited_by_host_id: string | null
  is_new_connection: boolean
  follow_up_notes: string | null
  contacts: Contact
  invited_by: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface InvitationActionsDropdownProps {
  invitation: Invitation
  eventStatus: string
  isUpcoming: boolean
  isPast: boolean
}

export function InvitationActionsDropdown({ 
  invitation, 
  eventStatus,
  isUpcoming,
  isPast
}: InvitationActionsDropdownProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Edit dialog state
  const [editStatus, setEditStatus] = useState(invitation.status)
  const [editIsNewConnection, setEditIsNewConnection] = useState(invitation.is_new_connection)
  const [editFollowUpNotes, setEditFollowUpNotes] = useState(invitation.follow_up_notes || '')

  const getContactDisplayName = (contact: Contact) => {
    return ContactBusinessLogic.getDisplayName(contact)
  }

  const handleQuickStatusUpdate = (newStatus: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('status', newStatus)
        formData.append('is_new_connection', invitation.is_new_connection.toString())
        if (invitation.follow_up_notes) {
          formData.append('follow_up_notes', invitation.follow_up_notes)
        }

        const result = await updateInvitationStatus(invitation.id, formData)
        if (!result.success) {
          setError(result.error || 'Failed to update status')
        } else {
          router.refresh()
        }
      } catch (error) {
        setError('An unexpected error occurred')
        logger.error('Failed to update invitation status', error instanceof Error ? error : new Error(String(error)), { 
          invitationId: invitation.id,
          newStatus
        })
      }
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('status', editStatus)
        formData.append('is_new_connection', editIsNewConnection.toString())
        formData.append('follow_up_notes', editFollowUpNotes)

        const result = await updateInvitationStatus(invitation.id, formData)
        if (!result.success) {
          setError(result.error || 'Failed to update invitation')
        } else {
          setShowEditDialog(false)
          router.refresh()
        }
      } catch (error) {
        setError('An unexpected error occurred')
        logger.error('Failed to update invitation in edit dialog', error instanceof Error ? error : new Error(String(error)), { 
          invitationId: invitation.id,
          editStatus,
          editIsNewConnection
        })
      }
    })
  }

  const handleDelete = async () => {
    setError(null)

    startTransition(async () => {
      try {
        const result = await removeContactFromEvent(invitation.id)
        if (!result.success) {
          setError(result.error || 'Failed to remove contact from event')
        } else {
          setShowDeleteDialog(false)
          router.refresh()
        }
      } catch (error) {
        setError('An unexpected error occurred')
        logger.error('Failed to remove contact from event', error instanceof Error ? error : new Error(String(error)), { 
          invitationId: invitation.id,
          contactId: invitation.contact_id,
          eventId: invitation.event_id
        })
      }
    })
  }

  const canQuickUpdate = isUpcoming || isPast
  const canEdit = true // Always allow editing
  const canDelete = eventStatus !== 'Completed' // Don't allow deletion for completed events

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {/* Quick Status Updates */}
          {canQuickUpdate && invitation.status !== 'RSVP_Yes' && (
            <DropdownMenuItem 
              onClick={() => handleQuickStatusUpdate('RSVP_Yes')}
              disabled={isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Mark as RSVP Yes
            </DropdownMenuItem>
          )}
          
          {canQuickUpdate && invitation.status !== 'RSVP_No' && (
            <DropdownMenuItem 
              onClick={() => handleQuickStatusUpdate('RSVP_No')}
              disabled={isPending}
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Mark as RSVP No
            </DropdownMenuItem>
          )}

          {isPast && invitation.status !== 'Attended' && invitation.status !== 'No Show' && (
            <>
              <DropdownMenuItem 
                onClick={() => handleQuickStatusUpdate('Attended')}
                disabled={isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4 text-purple-600" />
                Mark as Attended
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleQuickStatusUpdate('No Show')}
                disabled={isPending}
              >
                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                Mark as No Show
              </DropdownMenuItem>
            </>
          )}

          {(canQuickUpdate && (invitation.status === 'RSVP_Yes' || invitation.status === 'RSVP_No')) && (
            <DropdownMenuSeparator />
          )}

          {/* Edit and Delete */}
          {canEdit && (
            <DropdownMenuItem onClick={() => setShowEditDialog(true)} disabled={isPending}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Details
            </DropdownMenuItem>
          )}

          {canDelete && (
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)} 
              disabled={isPending}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove from Event
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invitation</DialogTitle>
            <DialogDescription>
              Update invitation details for {getContactDisplayName(invitation.contacts)}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVITATION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit_is_new_connection" 
                checked={editIsNewConnection}
                onCheckedChange={(checked) => setEditIsNewConnection(checked === true)}
              />
              <Label htmlFor="edit_is_new_connection">Mark as new connection</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_follow_up_notes">Follow-up Notes</Label>
              <Textarea
                id="edit_follow_up_notes"
                placeholder="Add any follow-up notes..."
                value={editFollowUpNotes}
                onChange={(e) => setEditFollowUpNotes(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditDialog(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  'Update Invitation'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Guest from Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {getContactDisplayName(invitation.contacts)} from this event? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted p-4 rounded-md">
            <div className="flex items-center justify-between text-sm">
              <span>Current Status:</span>
              <span className="font-medium">
                {INVITATION_STATUSES.find(s => s.value === invitation.status)?.label || invitation.status}
              </span>
            </div>
            {invitation.is_new_connection && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span>New Connection:</span>
                <span className="font-medium text-purple-600">Yes</span>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Guest
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 