'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  UserCheck
} from 'lucide-react'
import { 
  bulkUpdateInvitationStatus, 
  bulkUpdateInvitationNotes, 
  bulkToggleNewConnection, 
  bulkRemoveInvitations 
} from '@/lib/actions'
import { INVITATION_STATUSES } from '@/lib/constants'
import { useRouter } from 'next/navigation'

export type BulkEditMode = 'status' | 'notes' | 'new_connection' | 'remove'

interface BulkEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedInvitationIds: number[]
  selectedGuestNames: string[]
  mode: BulkEditMode
  onSuccess: () => void
}

export function BulkEditDialog({ 
  open, 
  onOpenChange, 
  selectedInvitationIds, 
  selectedGuestNames,
  mode,
  onSuccess 
}: BulkEditDialogProps) {
  const [status, setStatus] = useState('Sourced')
  const [followUpNotes, setFollowUpNotes] = useState('')
  const [isNewConnection, setIsNewConnection] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const getModeConfig = () => {
    switch (mode) {
      case 'status':
        return {
          title: 'Update Status',
          description: `Change the status for ${selectedInvitationIds.length} selected guest${selectedInvitationIds.length !== 1 ? 's' : ''}`,
          icon: Edit3,
          confirmText: 'Update Status',
          isDestructive: false
        }
      case 'notes':
        return {
          title: 'Add Follow-up Notes',
          description: `Add or update follow-up notes for ${selectedInvitationIds.length} selected guest${selectedInvitationIds.length !== 1 ? 's' : ''}`,
          icon: Edit3,
          confirmText: 'Update Notes',
          isDestructive: false
        }
      case 'new_connection':
        return {
          title: 'Toggle New Connection',
          description: `Mark ${selectedInvitationIds.length} selected guest${selectedInvitationIds.length !== 1 ? 's' : ''} as new connection${selectedInvitationIds.length !== 1 ? 's' : ''}`,
          icon: UserCheck,
          confirmText: 'Update Connection Status',
          isDestructive: false
        }
      case 'remove':
        return {
          title: 'Remove Guests',
          description: `Remove ${selectedInvitationIds.length} selected guest${selectedInvitationIds.length !== 1 ? 's' : ''} from this event`,
          icon: Trash2,
          confirmText: 'Remove Guests',
          isDestructive: true
        }
      default:
        return {
          title: 'Bulk Edit',
          description: 'Edit multiple guests',
          icon: Users,
          confirmText: 'Apply Changes',
          isDestructive: false
        }
    }
  }

  const config = getModeConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedInvitationIds.length === 0) {
      setError('No guests selected')
      return
    }

    setError(null)
    setSuccess(null)
    
    startTransition(async () => {
      try {
        let result
        
        switch (mode) {
          case 'status':
            result = await bulkUpdateInvitationStatus(selectedInvitationIds, status)
            break
          case 'notes':
            result = await bulkUpdateInvitationNotes(selectedInvitationIds, followUpNotes)
            break
          case 'new_connection':
            result = await bulkToggleNewConnection(selectedInvitationIds, isNewConnection)
            break
          case 'remove':
            result = await bulkRemoveInvitations(selectedInvitationIds)
            break
          default:
            setError('Invalid operation')
            return
        }

        if (result.success) {
          setSuccess(result.message || 'Operation completed successfully')
          setTimeout(() => {
            onSuccess()
            onOpenChange(false)
            router.refresh()
          }, 1500)
        } else {
          setError(result.error || 'Operation failed')
        }
        
      } catch (error) {
        setError('An unexpected error occurred')
        console.error('Bulk edit error:', error)
      }
    })
  }

  const handleCancel = () => {
    setStatus('Sourced')
    setFollowUpNotes('')
    setIsNewConnection(false)
    setError(null)
    setSuccess(null)
    onOpenChange(false)
  }

  const renderForm = () => {
    switch (mode) {
      case 'status':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk_status">New Status</Label>
              <Select value={status} onValueChange={setStatus}>
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
          </div>
        )
      
      case 'notes':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk_notes">Follow-up Notes</Label>
              <Textarea
                id="bulk_notes"
                placeholder="Add notes that will be applied to all selected guests..."
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                This will replace any existing follow-up notes for the selected guests.
              </p>
            </div>
          </div>
        )
      
      case 'new_connection':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="bulk_is_new_connection" 
                checked={isNewConnection}
                onCheckedChange={(checked) => setIsNewConnection(checked === true)}
              />
              <Label htmlFor="bulk_is_new_connection">Mark as new connections</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {isNewConnection 
                ? 'Selected guests will be marked as new connections made at this event.'
                : 'Selected guests will be unmarked as new connections.'
              }
            </p>
          </div>
        )
      
      case 'remove':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="text-sm text-red-800">
                <strong>Warning:</strong> This action cannot be undone. The selected guests will be permanently removed from this event.
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <config.icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Guests Preview */}
          <div className="space-y-2">
            <Label>Selected Guests ({selectedInvitationIds.length})</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
              <div className="flex flex-wrap gap-1">
                {selectedGuestNames.slice(0, 10).map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
                {selectedGuestNames.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    +{selectedGuestNames.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          {renderForm()}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">{success}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || selectedInvitationIds.length === 0}
              variant={config.isDestructive ? "destructive" : "default"}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                config.confirmText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 