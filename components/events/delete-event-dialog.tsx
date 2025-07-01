'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { deleteEvent } from '@/lib/actions'
import { Event } from '@/lib/supabase'
import { Trash2, Loader2 } from 'lucide-react'

interface DeleteEventDialogProps {
  event: Event
}

export function DeleteEventDialog({ event }: DeleteEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleDelete() {
    setIsDeleting(true)
    setError('')
    
    try {
      const result = await deleteEvent(event.id)
      
      if (result.success) {
        setOpen(false)
      } else {
        setError(result.error || 'Failed to delete event')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{event.name}"</strong> scheduled for <strong>{formatDate(event.event_date)}</strong>? 
            <br /><br />
            This action cannot be undone and will also remove all associated guest lists and invitations.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 