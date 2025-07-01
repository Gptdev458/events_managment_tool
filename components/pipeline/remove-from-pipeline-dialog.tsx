'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { removeFromPipeline } from '@/lib/actions'
import { Trash2, Loader2 } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { Contact } from '@/lib/database.types'

interface PipelineItem {
  id: number
  contact_id: string
  stage: string
  next_action: string
  next_action_date: string
  notes: string
  created_at: string
  contacts: Contact
}

interface RemoveFromPipelineDialogProps {
  pipelineItem: PipelineItem
}

export function RemoveFromPipelineDialog({ pipelineItem }: RemoveFromPipelineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRemove() {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await removeFromPipeline(pipelineItem.id)
      
      if (result.success) {
        setOpen(false)
      } else {
        setError(result.error || 'Failed to remove contact from pipeline')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove from Pipeline</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this contact from the relationship pipeline?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {ContactBusinessLogic.getDisplayName(pipelineItem.contacts)}
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {pipelineItem.contacts.job_title} at {pipelineItem.contacts.company}
            </div>
            <div className="text-sm text-gray-600">
              Current stage: <span className="font-medium">{pipelineItem.stage}</span>
            </div>
            <div className="text-sm text-gray-600">
              Next action: <span className="font-medium">{pipelineItem.next_action}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Warning
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    This action cannot be undone. The contact will be removed from your pipeline but will remain in your contacts list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleRemove}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Remove from Pipeline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 