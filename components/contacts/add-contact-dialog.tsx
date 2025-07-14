'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createContact } from '@/lib/actions'
import { CONTACT_TYPES } from '@/lib/constants'
import { CONTACT_AREA_OPTIONS, type ContactArea } from '@/lib/contact-area-utils'
import { ContactTypeSelector } from '@/components/ui/contact-type-selector'
import { Plus, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

const contactFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contact_type: z.union([z.string(), z.null()]).optional(),
  area: z.union([z.enum(['engineering', 'founders', 'product']), z.null()]).optional(),
  is_in_cto_club: z.boolean(),
  general_notes: z.string().optional(),
  additional_emails: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export function AddContactDialog() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      job_title: '',
      linkedin_url: '',
      contact_type: null,
      area: null,
      is_in_cto_club: false,
      general_notes: '',
      additional_emails: '',
    },
  })

  // Watch for CTO club checkbox changes and auto-update contact type
  const watchIsCtoClub = form.watch('is_in_cto_club')
  useEffect(() => {
    if (watchIsCtoClub) {
      form.setValue('contact_type', 'cto_club_member')
    } else {
      // Only clear contact_type if it was set to cto_club_member
      const currentContactType = form.getValues('contact_type')
      if (currentContactType === 'cto_club_member') {
        form.setValue('contact_type', null)
      }
    }
  }, [watchIsCtoClub, form])

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()

      // Add all fields directly - no special handling for area anymore
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      const result = await createContact(formData)
      
      if (result.success) {
        form.reset()
        setOpen(false)
      } else {
        form.setError('root', {
          message: result.error || 'Failed to create contact'
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new person to your network. Email is optional but recommended for communication.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com (optional)"
              />
              <p className="text-sm text-muted-foreground">
                Email is optional but recommended for communication
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_emails">Additional Emails</Label>
              <Input
                id="additional_emails"
                name="additional_emails"
                type="text"
                placeholder="email2@example.com, email3@example.com"
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple emails with commas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Type</FormLabel>
                  <FormControl>
                    <ContactTypeSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select contact type (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business area (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {CONTACT_AREA_OPTIONS.map(area => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
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
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_in_cto_club"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>CTO Club Member</FormLabel>
                    <FormDescription>
                      Is this person a member of the CTO Club?
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="general_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this contact..."
                      className="resize-none"
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 