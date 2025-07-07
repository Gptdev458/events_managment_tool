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
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea'
import { ActionSelector } from '@/components/ui/action-selector'
import { addToPipeline } from '@/lib/actions'
import { PIPELINE_STAGES } from '@/lib/constants'
import { Plus, Loader2, Users } from 'lucide-react'
import { Contact } from '@/lib/database.types'
import { ContactBusinessLogic } from '@/lib/business-logic'

const formSchema = z.object({
  contact_id: z.string().min(1, 'Please select a contact'),
  pipeline_stage: z.string().min(1, 'Please select a stage'),
  next_action_description: z.string().min(1, 'Next action is required'),
  next_action_date: z.string().min(1, 'Next action date is required'),
})

type FormData = z.infer<typeof formSchema>

interface AddToPipelineDialogProps {
  availableContacts: Contact[]
}

export function AddToPipelineDialog({ availableContacts }: AddToPipelineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_id: '',
      pipeline_stage: '',
      next_action_description: '',
      next_action_date: '',
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = await addToPipeline(formData)
      
      if (result.success) {
        setOpen(false)
        form.reset()
        // No need to reload - the component will update automatically
      } else {
        form.setError('root', { 
          type: 'manual', 
          message: result.error || 'Failed to add contact to pipeline' 
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

  // Check if there are no available contacts
  const hasAvailableContacts = availableContacts && availableContacts.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasAvailableContacts}>
          <Plus className="h-4 w-4 mr-2" />
          Add to Pipeline
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Contact to Pipeline</DialogTitle>
          <DialogDescription>
            Add a contact to the relationship pipeline to track strategic engagement
          </DialogDescription>
        </DialogHeader>

        {!hasAvailableContacts ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Contacts</h3>
            <p className="text-gray-600 mb-4">
              All your contacts are either already in the pipeline or you haven't added any contacts yet.
            </p>
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.location.href = '/contacts'}>
                Go to Contacts
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contact_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact ({availableContacts.length} available)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contact" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableContacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {ContactBusinessLogic.getDisplayName(contact)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {contact.job_title || 'No title'} {contact.company ? `at ${contact.company}` : ''}
                              </span>
                            </div>
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
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add to Pipeline
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
} 