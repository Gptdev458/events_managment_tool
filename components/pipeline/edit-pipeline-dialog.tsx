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
import { updatePipelineStage } from '@/lib/actions'
import { PIPELINE_STAGES } from '@/lib/constants'
import { Edit, Loader2 } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { Contact } from '@/lib/database.types'

const formSchema = z.object({
  contact_id: z.string().min(1, 'Contact ID is required'),
  stage: z.string().min(1, 'Please select a stage'),
  next_action: z.string().min(1, 'Next action is required'),
  next_action_date: z.string().min(1, 'Next action date is required'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

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

interface EditPipelineDialogProps {
  pipelineItem: PipelineItem
}

export function EditPipelineDialog({ pipelineItem }: EditPipelineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_id: pipelineItem.contact_id,
      stage: pipelineItem.stage,
      next_action: pipelineItem.next_action,
      next_action_date: pipelineItem.next_action_date,
      notes: pipelineItem.notes || '',
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

      const result = await updatePipelineStage(pipelineItem.id, formData)
      
      if (result.success) {
        setOpen(false)
      } else {
        form.setError('root', { 
          type: 'manual', 
          message: result.error || 'Failed to update pipeline stage' 
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

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0]
  }

  // Get tomorrow as minimum date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Pipeline Stage</DialogTitle>
          <DialogDescription>
            Update the stage and next action for {ContactBusinessLogic.getDisplayName(pipelineItem.contacts)}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-900">
                {ContactBusinessLogic.getDisplayName(pipelineItem.contacts)}
              </div>
              <div className="text-sm text-gray-600">
                {pipelineItem.contacts.job_title} at {pipelineItem.contacts.company}
              </div>
            </div>

            <FormField
              control={form.control}
              name="stage"
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
              name="next_action"
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
                      min={minDate}
                      value={formatDateForInput(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add context about this relationship, recent interactions, or strategic importance..."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Stage
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 