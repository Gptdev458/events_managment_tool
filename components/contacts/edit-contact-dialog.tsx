'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactTypeSelector } from '@/components/ui/contact-type-selector'
import { CustomTypesDialog } from '@/components/contacts/custom-types-dialog'
import { updateContact, deleteContact } from '@/lib/actions'
import { CONTACT_AREA_OPTIONS, type ContactArea } from '@/lib/contact-area-utils'
import { Contact } from '@/lib/supabase'
import { Edit, Loader2, Trash2 } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'

const contactFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  additional_emails: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contact_type: z.union([z.string(), z.null()]).optional(),
  area: z.union([z.enum(['engineering', 'founders', 'product']), z.null()]).optional(),
  is_in_cto_club: z.boolean(),
  general_notes: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

interface EditContactDialogProps {
  contact: Contact
  onRemoveFromPotentialMembers?: () => Promise<void>
  showPotentialMemberActions?: boolean
  onContactUpdated?: (updatedContact: Contact) => void
}

export function EditContactDialog({ 
  contact, 
  onRemoveFromPotentialMembers,
  showPotentialMemberActions = false,
  onContactUpdated
}: EditContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteAction, setDeleteAction] = useState<'remove' | 'delete' | null>(null)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: contact.name || '',
      email: contact.email || '',
      additional_emails: contact.additional_emails?.join(', ') || '',
      company: contact.company || '',
      job_title: contact.job_title || '',
      linkedin_url: contact.linkedin_url || '',
      contact_type: contact.contact_type || null,
      area: contact.area || null,
      is_in_cto_club: contact.is_in_cto_club || false,
      general_notes: contact.general_notes || '',
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

  // Reset form when contact changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: contact.name || '',
        email: contact.email || '',
        additional_emails: contact.additional_emails?.join(', ') || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        linkedin_url: contact.linkedin_url || '',
        contact_type: contact.contact_type || null,
        area: contact.area || null,
        is_in_cto_club: contact.is_in_cto_club || false,
        general_notes: contact.general_notes || '',
      })
    }
  }, [contact, open, form])

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })

      const result = await updateContact(contact.id, formData)
      
      if (result.success) {
        setOpen(false)
        // Call the callback to update parent component's data
        if (onContactUpdated && result.data) {
          onContactUpdated(result.data)
        }
      } else {
        form.setError('root', { 
          type: 'manual', 
          message: result.error || 'Failed to update contact' 
        })
      }
    } catch (error) {
      console.error('Error updating contact:', error)
      form.setError('root', { 
        type: 'manual', 
        message: 'Something went wrong. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAction = async () => {
    if (!deleteAction) return
    
    setIsSubmitting(true)
    try {
      if (deleteAction === 'remove' && onRemoveFromPotentialMembers) {
        await onRemoveFromPotentialMembers()
        setOpen(false)
      } else if (deleteAction === 'delete') {
        const result = await deleteContact(contact.id)
        if (result.success) {
          setOpen(false)
        } else {
          form.setError('root', {
            message: result.error || 'Failed to delete contact'
          })
        }
      }
    } catch (error) {
      form.setError('root', {
        message: 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
      setDeleteAction(null)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setShowDeleteConfirm(false)
    setDeleteAction(null)
  }

  const handleOpenDialog = () => {
    console.log('Opening edit dialog for contact:', contact.id)
    setOpen(true)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleOpenDialog}>
        <Edit className="h-4 w-4" />
      </Button>
      
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          {showDeleteConfirm ? (
            <>
              <DialogHeader>
                <DialogTitle>Delete Contact</DialogTitle>
                <DialogDescription>
                  What would you like to do with {contact.name || contact.email}?
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {showPotentialMemberActions && onRemoveFromPotentialMembers && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setDeleteAction('remove')}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove from Potential Members Only
                    <span className="text-sm text-gray-500 ml-2">(Keep contact in database)</span>
                  </Button>
                )}
                
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => setDeleteAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Contact Completely
                  <span className="text-sm text-gray-200 ml-2">(Remove from database)</span>
                </Button>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAction}
                  disabled={!deleteAction || isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update contact information for {contact.name || contact.email}
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

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com (optional)" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="additional_emails"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Emails</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="email2@example.com, email3@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
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
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ContactTypeSelector
                                value={field.value}
                                onValueChange={field.onChange}
                                placeholder="Select contact type (optional)"
                              />
                            </div>
                            <CustomTypesDialog onTypesChanged={() => {
                              // Optionally refresh the ContactTypeSelector options here
                              // The ContactTypeSelector should automatically refresh its options
                            }} />
                          </div>
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
                              <SelectValue placeholder="Select area (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {CONTACT_AREA_OPTIONS.map((area) => (
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
                          <Input placeholder="https://linkedin.com/in/username" {...field} />
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
                            This contact is a member of the CTO Club
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
                        <FormLabel>General Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional notes about this contact..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter className="flex justify-between">
                    <div>
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="mr-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Changes
                      </Button>
                    </div>
                  </DialogFooter>

                  {form.formState.errors.root && (
                    <div className="text-sm text-red-600 mt-2">
                      {form.formState.errors.root.message}
                    </div>
                  )}
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 