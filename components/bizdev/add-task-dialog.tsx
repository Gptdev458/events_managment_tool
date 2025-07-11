'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createTask } from '@/lib/bizdev-actions'
import { BIZDEV_CONSTANTS } from '@/lib/bizdev-types'
import { Plus, Loader2, CheckSquare } from 'lucide-react'
import type { Project, Task } from '@/lib/database.types'

const taskFormSchema = z.object({
  project_id: z.string().min(1, 'Please select a project'),
  text: z.string().min(1, 'Task description is required'),
  status: z.enum(['todo', 'doing', 'waiting', 'done']).optional(),
  completed: z.boolean(),
  parent_task_id: z.string().optional(),
  order: z.number().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface AddTaskDialogProps {
  projects: Project[]
  parentTask?: Task | null
  defaultProjectId?: string
  triggerButton?: React.ReactNode
}

export function AddTaskDialog({ 
  projects, 
  parentTask, 
  defaultProjectId,
  triggerButton 
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      project_id: defaultProjectId || '',
      text: '',
      status: BIZDEV_CONSTANTS.DEFAULT_TASK_STATUS,
      completed: false,
      parent_task_id: parentTask?.id || undefined,
      order: undefined,
    },
  })

  async function onSubmit(values: TaskFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('project_id', values.project_id)
      formData.append('text', values.text)
      formData.append('completed', values.completed.toString())
      
      if (values.status) formData.append('status', values.status)
      if (values.parent_task_id) formData.append('parent_task_id', values.parent_task_id)
      if (values.order !== undefined) formData.append('order', values.order.toString())

      const result = await createTask(formData)
      
      if (result.success) {
        form.reset()
        setOpen(false)
      } else {
        form.setError('root', {
          message: result.error || 'Failed to create task'
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

  const defaultTrigger = (
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      {parentTask ? 'Add Subtask' : 'Add Task'}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {parentTask ? 'Add Subtask' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {parentTask 
              ? `Add a subtask under "${parentTask.text}"`
              : 'Add a new task to track progress on a project.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!defaultProjectId && (
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-2">
                              {project.name}
                              {project.is_ian_collaboration && (
                                <span className="text-xs text-purple-600">(Ian)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      Check this if the task is already finished
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {parentTask ? 'Add Subtask' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 