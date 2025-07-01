'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { deleteContact } from '@/lib/actions'
import { Contact } from '@/lib/supabase'
import { Trash2, Loader2 } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'

interface DeleteContactDialogProps {
  contact: Contact
}

export function DeleteContactDialog({ contact }: DeleteContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string>('')

  async function handleDelete() {
    setIsDeleting(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('id', contact.id)
      
      const result = await deleteContact(contact.id)
      
      if (result.success) {
        setOpen(false)
      } else {
        setError(result.error || 'Failed to delete contact')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const displayName = ContactBusinessLogic.getDisplayName(contact)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{displayName}</strong>? This action cannot be undone.
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
            Delete Contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 