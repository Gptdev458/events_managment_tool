'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteProject } from '@/lib/bizdev-actions'
import { Loader2, Trash2, AlertTriangle } from 'lucide-react'
import type { Project } from '@/lib/database.types'

interface DeleteProjectDialogProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteProjectDialog({ project, open, onOpenChange }: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)
    
    try {
      const result = await deleteProject(project.id)
      
      if (result.success) {
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to delete project')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Project
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-red-800">
                  This action cannot be undone
                </p>
                <p className="text-sm text-red-700">
                  This will permanently delete all tasks associated with this project.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p>Are you sure you want to delete this project?</p>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="font-medium text-gray-900">{project.name}</p>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {project.priority && (
                    <span className="capitalize">Priority: {project.priority}</span>
                  )}
                  {project.status && (
                    <span className="capitalize">Status: {project.status}</span>
                  )}
                  {project.is_ian_collaboration && (
                    <span className="text-purple-600">Ian Collaboration</span>
                  )}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 