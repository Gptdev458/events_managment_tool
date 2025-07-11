'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { updateTask } from '@/lib/bizdev-actions'
import { Loader2, Edit3 } from 'lucide-react'
import type { Task } from '@/lib/database.types'

const taskFormSchema = z.object({
  text: z.string().min(1, 'Task description is required'),
  status: z.enum(['todo', 'doing', 'waiting', 'done']).optional(),
  completed: z.boolean(),
  order: z.number().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface EditTaskDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      text: '',
      status: 'todo',
      completed: false,
      order: undefined,
    },
  })

  // Update form values when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        text: task.text || '',
        status: (task.status as 'todo' | 'doing' | 'waiting' | 'done') || 'todo',
        completed: task.completed || false,
        order: task.order || undefined,
      })
    }
  }, [task, form])

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('text', values.text)
      formData.append('completed', values.completed.toString())
      
      if (values.status) formData.append('status', values.status)
      if (values.order !== undefined) formData.append('order', values.order.toString())

      const result = await updateTask(task.id, formData)
      
      if (result.success) {
        onOpenChange(false)
      } else {
        form.setError('root', {
          message: result.error || 'Failed to update task'
        })
      }
    } catch (error) {
      form.setError('root', {
        message: 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit Task
          </DialogTitle>
          <DialogDescription>
            Update the task details. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what needs to be done..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="doing">Doing</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1, 2, 3..."
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="completed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Mark as completed</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      This will also update the status to "done" if checked
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Task
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 