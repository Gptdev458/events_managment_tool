'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createContact, getContacts, updateContact } from '@/lib/actions'
import { Plus, Loader2, UserPlus, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

const vipContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  company: z.string().optional(),
  job_title: z.string().optional(),
  linkedin_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  general_notes: z.string().optional(),
  additional_emails: z.string().optional(),
})

type VipContactFormValues = z.infer<typeof vipContactFormSchema>

interface AddVipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddVipDialog({ open, onOpenChange }: AddVipDialogProps) {
  const [activeTab, setActiveTab] = useState('new')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingContacts, setExistingContacts] = useState<any[]>([])
  const [selectedContactId, setSelectedContactId] = useState<string>('')
  const [loadingContacts, setLoadingContacts] = useState(false)
  const router = useRouter()

  const form = useForm<VipContactFormValues>({
    resolver: zodResolver(vipContactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      job_title: '',
      linkedin_url: '',
      general_notes: '',
      additional_emails: '',
    },
  })

  // Load existing non-VIP contacts when switching to promote tab
  const loadExistingContacts = async () => {
    setLoadingContacts(true)
    try {
      const result = await getContacts()
      if (result.success) {
        // Filter out contacts that are already VIPs
        const nonVips = result.data.filter((contact: any) => contact.contact_type !== 'VIP')
        setExistingContacts(nonVips)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    } finally {
      setLoadingContacts(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === 'promote' && existingContacts.length === 0) {
      loadExistingContacts()
    }
  }

  async function onSubmitNewVip(values: VipContactFormValues) {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })
      
      // Set contact type as VIP
      formData.append('contact_type', 'VIP')

      const result = await createContact(formData)
      
      if (result.success) {
        form.reset()
        onOpenChange(false)
        router.refresh()
      } else {
        form.setError('root', {
          message: result.error || 'Failed to create VIP contact'
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

  async function onPromoteToVip() {
    if (!selectedContactId) return
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      formData.append('contact_type', 'VIP')

      const result = await updateContact(selectedContactId, formData)
      
      if (result.success) {
        setSelectedContactId('')
        onOpenChange(false)
        router.refresh()
      } else {
        // Handle error
        console.error('Failed to promote contact to VIP')
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getContactDisplayName = (contact: any) => {
    return contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add VIP Contact</DialogTitle>
          <DialogDescription>
            Add a new VIP to your strategic relationship network or promote an existing contact.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New VIP
            </TabsTrigger>
            <TabsTrigger value="promote" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Promote Existing
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="new" className="mt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitNewVip)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
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
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          <Input placeholder="CEO" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                  name="general_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Strategic importance, relationship context, initial goals..."
                          className="resize-none"
                          rows={3}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create VIP Contact
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="promote" className="mt-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Contact to Promote</label>
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={loadingContacts ? "Loading contacts..." : "Choose a contact"} />
                  </SelectTrigger>
                  <SelectContent>
                    {existingContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getContactDisplayName(contact)}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {contact.company && `• ${contact.company}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedContactId && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    This will change the contact type to "VIP" and make them appear in your VIP management dashboard.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={onPromoteToVip} 
                  disabled={!selectedContactId || isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <UserPlus className="mr-2 h-4 w-4" />
                  Promote to VIP
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 