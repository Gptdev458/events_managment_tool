'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Contact } from "@/lib/database.types"
import { ContactBusinessLogic } from "@/lib/business-logic"
import { addToPotentialMembers, createContactAndAddToPotentialMembers } from "@/lib/cto-club-actions"
import { CONTACT_TYPES } from "@/lib/constants"

interface AddPotentialMemberDialogProps {
  isOpen: boolean
  onClose: () => void
  availableContacts: Contact[]
}

export function AddPotentialMemberDialog({ isOpen, onClose, availableContacts }: AddPotentialMemberDialogProps) {
  const [activeTab, setActiveTab] = useState('from-contacts')
  const [isLoading, setIsLoading] = useState(false)
  
  // From contacts form state
  const [selectedContactId, setSelectedContactId] = useState('')
  const [fromContactsNotes, setFromContactsNotes] = useState('')
  
  // New contact form state
  const [newContactData, setNewContactData] = useState({
    name: '',
    email: '',
    company: '',
    job_title: '',
    linkedin_url: '',
    contact_type: 'none',
    area: 'none',
    general_notes: '',
    notes: '' // This is for potential member notes
  })

  const handleFromContactsSubmit = async () => {
    if (!selectedContactId) return
    
    setIsLoading(true)
    try {
      await addToPotentialMembers(selectedContactId, fromContactsNotes || undefined)
      onClose()
      resetForms()
    } catch (error) {
      console.error('Error adding potential member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewContactSubmit = async () => {
    if (!newContactData.name || !newContactData.email) return
    
    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Handle each field with proper null/empty string conversion
      formData.append('name', newContactData.name)
      formData.append('email', newContactData.email)
      formData.append('company', newContactData.company || '')
      formData.append('job_title', newContactData.job_title || '')
      formData.append('linkedin_url', newContactData.linkedin_url || '')
      
      // Handle contact_type - convert "none" to null for database
      if (newContactData.contact_type && newContactData.contact_type !== 'none') {
        formData.append('contact_type', newContactData.contact_type)
      }
      
      // Handle area - convert "none" to null for database  
      if (newContactData.area && newContactData.area !== 'none') {
        formData.append('area', newContactData.area)
      }
      
      formData.append('general_notes', newContactData.general_notes || '')
      formData.append('notes', newContactData.notes || '') // CTO Club notes
      
      const result = await createContactAndAddToPotentialMembers(formData)
      if (result.success) {
        onClose()
        resetForms()
      } else {
        console.error('Error:', result.error)
      }
    } catch (error) {
      console.error('Error creating contact and adding to potential members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForms = () => {
    setSelectedContactId('')
    setFromContactsNotes('')
    setNewContactData({
      name: '',
      email: '',
      company: '',
      job_title: '',
      linkedin_url: '',
      contact_type: 'none',
      area: 'none',
      general_notes: '',
      notes: ''
    })
    setActiveTab('from-contacts')
  }

  const handleClose = () => {
    onClose()
    resetForms()
  }

  const isFromContactsValid = selectedContactId
  const isNewContactValid = newContactData.name && newContactData.email

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Potential CTO Club Member</DialogTitle>
          <DialogDescription>
            Add someone to track as a potential CTO Club member.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="from-contacts">Add from Contacts</TabsTrigger>
            <TabsTrigger value="add-new">Add New Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="from-contacts" className="space-y-4 mt-4">
            <div className="grid gap-2">
              <Label htmlFor="contact">Select Contact</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {availableContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex flex-col">
                        <span>{ContactBusinessLogic.getDisplayName(contact)}</span>
                        <span className="text-sm text-gray-500">
                          {contact.company} - {contact.job_title}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="from-contacts-notes">Notes (Optional)</Label>
              <Textarea
                id="from-contacts-notes"
                placeholder="Add notes about why this person might be a good fit for the CTO Club..."
                value={fromContactsNotes}
                onChange={(e) => setFromContactsNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="add-new" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newContactData.name}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={newContactData.email}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={newContactData.company}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  placeholder="CTO, CEO, etc."
                  value={newContactData.job_title}
                  onChange={(e) => setNewContactData(prev => ({ ...prev, job_title: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_type">Contact Type</Label>
                <Select value={newContactData.contact_type} onValueChange={(value) => setNewContactData(prev => ({ ...prev, contact_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No contact type</SelectItem>
                    {CONTACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area">Area</Label>
                <Select value={newContactData.area} onValueChange={(value) => setNewContactData(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No area</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="founders">Founders</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                placeholder="https://linkedin.com/in/..."
                value={newContactData.linkedin_url}
                onChange={(e) => setNewContactData(prev => ({ ...prev, linkedin_url: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="general_notes">General Notes</Label>
              <Textarea
                id="general_notes"
                placeholder="General information about this contact..."
                value={newContactData.general_notes}
                onChange={(e) => setNewContactData(prev => ({ ...prev, general_notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="new-contact-notes">CTO Club Notes</Label>
              <Textarea
                id="new-contact-notes"
                placeholder="Add notes about why this person might be a good fit for the CTO Club..."
                value={newContactData.notes}
                onChange={(e) => setNewContactData(prev => ({ ...prev, notes: e.target.value }))}
                className="min-h-[80px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          {activeTab === 'from-contacts' ? (
            <Button 
              onClick={handleFromContactsSubmit} 
              disabled={!isFromContactsValid || isLoading}
            >
              {isLoading ? 'Adding...' : 'Add to Potential Members'}
            </Button>
          ) : (
            <Button 
              onClick={handleNewContactSubmit} 
              disabled={!isNewContactValid || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create & Add to Potential Members'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 