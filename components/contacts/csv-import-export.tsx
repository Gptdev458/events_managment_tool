'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Eye
} from 'lucide-react'
import { CSVExport, CSVImport, CSVTemplates, parseCSVToContacts } from '@/lib/csv-utils'
import { Contact } from '@/lib/database.types'
import { createContact } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

interface CSVImportExportProps {
  contacts: Contact[]
}

export function CSVImportExport({ contacts }: CSVImportExportProps) {
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  
  // Import states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResults, setImportResults] = useState<{
    valid: Contact[]
    errors: { row: number; errors: string[] }[]
    summary: { total: number; valid: number; errors: number }
  } | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Export Functions
  const handleExportContacts = () => {
    try {
      const csvData = CSVExport.exportContacts(contacts)
      const timestamp = new Date().toISOString().split('T')[0]
      CSVExport.downloadCSV(csvData, `contacts_export_${timestamp}.csv`)
      setExportDialogOpen(false)
    } catch (error) {
      logger.error('Failed to export contacts', error instanceof Error ? error : new Error(String(error)))
    }
  }

  const handleDownloadTemplate = () => {
    CSVTemplates.downloadContactsTemplate()
  }

  // Import Functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validation = CSVImport.validateCSVFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setSelectedFile(file)
    setImportResults(null)
  }

  const handleProcessFile = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    try {
      const csvText = await CSVImport.readFileAsText(selectedFile)
      const results = parseCSVToContacts(csvText)
      setImportResults(results)
    } catch (error) {
      logger.error('Failed to process CSV file', error instanceof Error ? error : new Error(String(error)))
      alert('Failed to process file. Please check the format and try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImportContacts = async () => {
    if (!importResults?.valid.length) return

    setIsImporting(true)
    setImportProgress(0)

    try {
      const validContacts = importResults.valid
      let successCount = 0
      
      for (let i = 0; i < validContacts.length; i++) {
        const contact = validContacts[i]
        
        try {
          const formData = new FormData()
          formData.append('name', contact.name || '')
          formData.append('email', contact.email || '')
          formData.append('additional_emails', Array.isArray(contact.additional_emails) ? contact.additional_emails.join(', ') : (contact.additional_emails || ''))
          formData.append('company', contact.company || '')
          formData.append('job_title', contact.job_title || '')
          formData.append('contact_type', contact.contact_type || 'prospect')
          formData.append('area', contact.area || '')
          formData.append('linkedin_url', contact.linkedin_url || '')
          formData.append('is_in_cto_club', contact.is_in_cto_club ? 'true' : 'false')
          formData.append('current_projects', Array.isArray(contact.current_projects) ? contact.current_projects.join(', ') : (contact.current_projects || ''))
          formData.append('goals_aspirations', Array.isArray(contact.goals_aspirations) ? contact.goals_aspirations.join(', ') : (contact.goals_aspirations || ''))
          formData.append('our_strategic_goals', Array.isArray(contact.our_strategic_goals) ? contact.our_strategic_goals.join(', ') : (contact.our_strategic_goals || ''))
          formData.append('general_notes', contact.general_notes || '')

          console.log(`Importing contact ${i + 1}:`, {
            name: contact.name,
            email: contact.email,
            company: contact.company,
            job_title: contact.job_title
          })

          const result = await createContact(formData)
          console.log(`Contact ${i + 1} result:`, result)
          
          if (result.success) {
            successCount++
            console.log(`✅ Contact ${i + 1} imported successfully`)
          } else {
            console.error(`❌ Contact ${i + 1} failed:`, result.error)
          }
        } catch (error) {
          console.error(`💥 Contact ${i + 1} threw error:`, error)
          logger.error('Failed to import contact', error instanceof Error ? error : new Error(String(error)), {
            contactEmail: contact.email
          })
        }
        
        // Update progress
        setImportProgress(Math.round(((i + 1) / validContacts.length) * 100))
        
        // Small delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Show completion message
      alert(`Import completed! Successfully imported ${successCount} of ${validContacts.length} contacts.`)
      
      // Reset and refresh
      setImportDialogOpen(false)
      setSelectedFile(null)
      setImportResults(null)
      setImportProgress(0)
      router.refresh()
      
    } catch (error) {
      logger.error('Failed to complete import', error instanceof Error ? error : new Error(String(error)))
      alert('Import failed. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportResults(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex gap-2">
      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Contacts</DialogTitle>
            <DialogDescription>
              Download your contacts data as a CSV file for backup or external use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Export Summary</h4>
              <p className="text-blue-700">
                Ready to export <strong>{contacts.length}</strong> contacts with all their information.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExportContacts}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Contacts from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk import contacts. Use our template for best results.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Template Download */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Need a template?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Download our CSV template with sample data to ensure proper formatting.
              </p>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* Process Button */}
            {selectedFile && !importResults && (
              <Button onClick={handleProcessFile} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Import
                  </>
                )}
              </Button>
            )}

            {/* Import Results */}
            {importResults && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Import Preview</h4>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {importResults.summary.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {importResults.summary.valid}
                      </div>
                      <div className="text-sm text-gray-600">Valid</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {importResults.summary.errors}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                  </div>

                  {importResults.errors.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-red-700">Errors Found:</h5>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {importResults.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm bg-red-50 p-2 rounded">
                            <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                          </div>
                        ))}
                        {importResults.errors.length > 5 && (
                          <div className="text-sm text-gray-600">
                            And {importResults.errors.length - 5} more errors...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Import Progress */}
                {isImporting && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Importing contacts...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetImport} disabled={isImporting}>
                    Reset
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={isImporting}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImportContacts}
                      disabled={isImporting || importResults.summary.valid === 0}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Import {importResults.summary.valid} Contacts
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 