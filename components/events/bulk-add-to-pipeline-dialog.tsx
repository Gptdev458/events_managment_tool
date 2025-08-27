'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { ActionSelector } from '@/components/ui/action-selector'
import { bulkAddToPipeline } from '@/lib/actions'
import { PIPELINE_STAGES } from '@/lib/constants'
import { Loader2, Users, CheckCircle } from 'lucide-react'
import { Contact } from '@/lib/database.types'
import { ContactBusinessLogic } from '@/lib/business-logic'

const formSchema = z.object({
  pipeline_stage: z.string().min(1, 'Please select a stage'),
  next_action_description: z.string().min(1, 'Next action is required'),
  next_action_date: z.string().min(1, 'Next action date is required'),
})

type FormData = z.infer<typeof formSchema>

interface BulkAddToPipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedContacts: Contact[]
  onSuccess?: () => void
}

export function BulkAddToPipelineDialog({
  open,
  onOpenChange,
  selectedContacts,
  onSuccess
}: BulkAddToPipelineDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pipeline_stage: '',
      next_action_description: '',
      next_action_date: '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setSuccessMessage(null)
    
    try {
      const formData = new FormData()
      
      // Add contact IDs as comma-separated string
      const contactIds = selectedContacts.map(contact => contact.id).join(',')
      formData.append('contact_ids', contactIds)
      formData.append('pipeline_stage', data.pipeline_stage)
      formData.append('next_action_description', data.next_action_description)
      formData.append('next_action_date', data.next_action_date)

      const result = await bulkAddToPipeline(formData)
      
      if (result.success) {
        setSuccessMessage(result.message || `Successfully added ${selectedContacts.length} contacts to pipeline`)
        form.reset()
        onSuccess?.()
        
        // Auto-close after showing success message
        setTimeout(() => {
          onOpenChange(false)
          setSuccessMessage(null)
        }, 2000)
      } else {
        form.setError('root', { 
          type: 'manual', 
          message: result.error || 'Failed to add contacts to pipeline' 
        })
      }
    } catch (error) {
      form.setError('root', { 
        type: 'manual', 
        message: 'Something went wrong. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get tomorrow as default date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setSuccessMessage(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''} to Pipeline
          </DialogTitle>
          <DialogDescription>
            Add the selected contacts to the relationship pipeline to track strategic engagement
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-600">{successMessage}</p>
          </div>
        ) : (
          <>
            {/* Selected Contacts Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm text-gray-700 mb-2">
                Selected Contacts ({selectedContacts.length}):
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedContacts.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="text-sm text-gray-600">
                    • {ContactBusinessLogic.getDisplayName(contact)}
                    {contact.company && (
                      <span className="text-gray-500"> - {contact.company}</span>
                    )}
                  </div>
                ))}
                {selectedContacts.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... and {selectedContacts.length - 5} more
                  </div>
                )}
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="pipeline_stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pipeline Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PIPELINE_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_action_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Action</FormLabel>
                      <FormControl>
                        <ActionSelector
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter custom action or select from suggestions..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_action_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Action Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          min={defaultDate}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {form.formState.errors.root.message}
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleOpenChange(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''} to Pipeline
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
