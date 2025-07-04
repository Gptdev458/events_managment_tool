'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  Download, 
  Edit3, 
  UserPlus,
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { Contact } from '@/lib/database.types'
import { CSVExport } from '@/lib/csv-utils'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { deleteContact, updateContact } from '@/lib/actions'
import { CONTACT_TYPES } from '@/lib/constants'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

interface BulkOperationsProps {
  contacts: Contact[]
  selectedContacts: string[]
  onSelectionChange: (selected: string[]) => void
}

export function BulkOperations({ 
  contacts, 
  selectedContacts, 
  onSelectionChange 
}: BulkOperationsProps) {
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [operationProgress, setOperationProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Bulk edit state
  const [editContactType, setEditContactType] = useState('')
  const [editIsCtoClub, setEditIsCtoClub] = useState<boolean | null>(null)
  
  const router = useRouter()

  const selectedContactsData = contacts.filter(contact => 
    selectedContacts.includes(contact.id)
  )

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(contacts.map(c => c.id))
    }
  }

  const handleExportSelected = () => {
    try {
      const csvData = CSVExport.exportContacts(selectedContactsData)
      const timestamp = new Date().toISOString().split('T')[0]
      CSVExport.downloadCSV(csvData, `selected_contacts_${timestamp}.csv`)
    } catch (error) {
      logger.error('Failed to export selected contacts', error instanceof Error ? error : new Error(String(error)))
      alert('Failed to export contacts. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return

    setIsProcessing(true)
    setOperationProgress(0)

    try {
      let successCount = 0
      
      for (let i = 0; i < selectedContacts.length; i++) {
        const contactId = selectedContacts[i]
        
        try {
          const result = await deleteContact(contactId)
          if (result.success) {
            successCount++
          }
        } catch (error) {
          logger.error('Failed to delete contact in bulk operation', error instanceof Error ? error : new Error(String(error)), {
            contactId
          })
        }
        
        // Update progress
        setOperationProgress(Math.round(((i + 1) / selectedContacts.length) * 100))
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      alert(`Bulk delete completed! Successfully deleted ${successCount} of ${selectedContacts.length} contacts.`)
      
      // Reset and refresh
      setBulkDeleteOpen(false)
      onSelectionChange([])
      router.refresh()
      
    } catch (error) {
      logger.error('Failed to complete bulk delete', error instanceof Error ? error : new Error(String(error)))
      alert('Bulk delete failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setOperationProgress(0)
    }
  }

  const handleBulkEdit = async () => {
    if (selectedContacts.length === 0) return
    if (!editContactType && editIsCtoClub === null) {
      alert('Please select at least one field to update.')
      return
    }

    setIsProcessing(true)
    setOperationProgress(0)

    try {
      let successCount = 0
      
      for (let i = 0; i < selectedContacts.length; i++) {
        const contactId = selectedContacts[i]
        const contact = contacts.find(c => c.id === contactId)
        if (!contact) continue
        
        try {
          const formData = new FormData()
          
          // Keep existing values for fields we're not updating
          formData.append('email', contact.email || '')
          formData.append('first_name', contact.first_name || '')
          formData.append('last_name', contact.last_name || '')
          formData.append('company', contact.company || '')
          formData.append('job_title', contact.job_title || '')
          formData.append('linkedin_url', contact.linkedin_url || '')
          formData.append('general_notes', contact.general_notes || '')
          
          // Update the fields we're changing
          formData.append('contact_type', editContactType || contact.contact_type || '')
                     formData.append('is_in_cto_club', (editIsCtoClub !== null ? editIsCtoClub : (contact.is_in_cto_club || false)).toString())

          const result = await updateContact(contactId, formData)
          if (result.success) {
            successCount++
          }
        } catch (error) {
          logger.error('Failed to update contact in bulk operation', error instanceof Error ? error : new Error(String(error)), {
            contactId
          })
        }
        
        // Update progress
        setOperationProgress(Math.round(((i + 1) / selectedContacts.length) * 100))
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      alert(`Bulk edit completed! Successfully updated ${successCount} of ${selectedContacts.length} contacts.`)
      
      // Reset and refresh
      setBulkEditOpen(false)
      onSelectionChange([])
      setEditContactType('')
      setEditIsCtoClub(null)
      router.refresh()
      
    } catch (error) {
      logger.error('Failed to complete bulk edit', error instanceof Error ? error : new Error(String(error)))
      alert('Bulk edit failed. Please try again.')
    } finally {
      setIsProcessing(false)
      setOperationProgress(0)
    }
  }

  if (contacts.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
      {/* Select All Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={selectedContacts.length === contacts.length}
          onCheckedChange={handleSelectAll}
          className="border-gray-400"
        />
        <span className="text-sm font-medium">
          Select All ({selectedContacts.length} of {contacts.length})
        </span>
      </div>

      {/* Bulk Actions */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {selectedContacts.length} selected
          </Badge>

          {/* Export Selected */}
          <Button variant="outline" size="sm" onClick={handleExportSelected}>
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>

          {/* Bulk Edit */}
          <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Selected
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Edit Contacts</DialogTitle>
                <DialogDescription>
                  Update common fields for {selectedContacts.length} selected contacts.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Contacts</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedContactsData.slice(0, 5).map(contact => (
                      <div key={contact.id} className="text-sm text-blue-700">
                        {ContactBusinessLogic.getDisplayName(contact)} - {contact.email}
                      </div>
                    ))}
                    {selectedContactsData.length > 5 && (
                      <div className="text-sm text-blue-600">
                        And {selectedContactsData.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contact Type (optional)
                    </label>
                    <select
                      value={editContactType}
                      onChange={(e) => setEditContactType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Keep existing --</option>
                      {CONTACT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      CTO Club Membership (optional)
                    </label>
                    <select
                      value={editIsCtoClub === null ? '' : editIsCtoClub.toString()}
                      onChange={(e) => {
                        const value = e.target.value
                        setEditIsCtoClub(value === '' ? null : value === 'true')
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Keep existing --</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Updating contacts...</span>
                      <span>{operationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${operationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBulkEditOpen(false)} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkEdit} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update {selectedContacts.length} Contacts
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Bulk Delete */}
          <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Selected Contacts</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete {selectedContacts.length} contacts.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Warning</h4>
                  </div>
                  <p className="text-red-700 text-sm">
                    You are about to delete {selectedContacts.length} contacts. This action is permanent and cannot be undone.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Contacts to be deleted:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 rounded">
                    {selectedContactsData.map(contact => (
                      <div key={contact.id} className="text-sm">
                        {ContactBusinessLogic.getDisplayName(contact)} - {contact.email}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Deleting contacts...</span>
                      <span>{operationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${operationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setBulkDeleteOpen(false)} disabled={isProcessing}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleBulkDelete} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete {selectedContacts.length} Contacts
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  )
} 