'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserPlus, 
  Search, 
  Loader2,
  Mail,
  Building,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react'
import { addContactToEvent, getContactEventHistory } from '@/lib/actions'
import { INVITATION_STATUSES, CONTACT_TYPES, EVENT_TYPES } from '@/lib/constants'
import { CONTACT_AREA_OPTIONS } from '@/lib/contact-area-utils'
import { Contact } from '@/lib/supabase'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { useRouter } from 'next/navigation'
import { logger } from '@/lib/logger'

interface ContactEventHistory {
  [contactId: string]: string[] // Array of event types attended
}

interface AddGuestDialogProps {
  eventId: string
  availableContacts: Contact[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddGuestDialog({ 
  eventId, 
  availableContacts, 
  open, 
  onOpenChange 
}: AddGuestDialogProps) {
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [status, setStatus] = useState('Sourced')
  const [isNewConnection, setIsNewConnection] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [contactTypeFilter, setContactTypeFilter] = useState<string>('all')
  const [eventTypeAttendedFilter, setEventTypeAttendedFilter] = useState<string>('all')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [contactEventHistory, setContactEventHistory] = useState<ContactEventHistory>({})
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // Load event history for filtering when dialog opens
  useEffect(() => {
    if (open && availableContacts.length > 0) {
      const loadEventHistory = async () => {
        setLoadingHistory(true)
        try {
          const historyPromises = availableContacts.map(async (contact) => {
            const result = await getContactEventHistory(contact.id)
            if (result.success && result.data) {
              const eventTypes = result.data
                .map(invitation => invitation.events?.event_type)
                .filter(Boolean) as string[]
              return { contactId: contact.id, eventTypes }
            }
            return { contactId: contact.id, eventTypes: [] }
          })

          const histories = await Promise.all(historyPromises)
          const historyMap: ContactEventHistory = {}
          histories.forEach(({ contactId, eventTypes }) => {
            historyMap[contactId] = eventTypes
          })
          setContactEventHistory(historyMap)
        } catch (error) {
          console.error('Failed to load contact event history:', error)
        } finally {
          setLoadingHistory(false)
        }
      }

      loadEventHistory()
    }
  }, [open, availableContacts])

  // Filter contacts based on search and filters
  const filteredContacts = availableContacts.filter(contact => {
    // Search filter - use the name field and business logic
    const displayName = ContactBusinessLogic.getDisplayName(contact).toLowerCase()
    const email = (contact.email || '').toLowerCase()
    const company = (contact.company || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    
    const matchesSearch = displayName.includes(search) || email.includes(search) || company.includes(search)
    
    // Contact type filter
    const matchesContactType = contactTypeFilter === 'all' || contact.contact_type === contactTypeFilter
    
    // Event type attended filter
    let matchesEventTypeAttended = true
    if (eventTypeAttendedFilter !== 'all') {
      const attendedEventTypes = contactEventHistory[contact.id] || []
      if (eventTypeAttendedFilter === 'never_attended') {
        matchesEventTypeAttended = attendedEventTypes.length === 0
      } else {
        matchesEventTypeAttended = attendedEventTypes.includes(eventTypeAttendedFilter)
      }
    }

    // Area filter
    const matchesArea = areaFilter === 'all' || contact.area === areaFilter
    
    return matchesSearch && matchesContactType && matchesEventTypeAttended && matchesArea
  })

  const getContactTypeLabel = (value: string | null) => {
    if (!value) return 'None'
    return CONTACT_TYPES.find(type => type.value === value)?.label || value
  }

  const getEventTypeLabel = (value: string) => {
    return EVENT_TYPES.find(type => type.value === value)?.label || value
  }

  const handleContactToggle = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const handleSelectAllVisible = () => {
    const filteredContactIds = filteredContacts.map(contact => contact.id)
    const newSelected = [...new Set([...selectedContactIds, ...filteredContactIds])]
    setSelectedContactIds(newSelected)
  }

  const handleClearSelection = () => {
    setSelectedContactIds([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedContactIds.length === 0) {
      setError('Please select at least one contact to invite')
      return
    }

    setError(null)
    
    startTransition(async () => {
      try {
        // Add each selected contact to the event
        const results = await Promise.all(
          selectedContactIds.map(async (contactId) => {
            const formData = new FormData()
            formData.append('event_id', eventId)
            formData.append('contact_id', contactId)
            formData.append('status', status)
            formData.append('is_new_connection', isNewConnection.toString())
            
            return await addContactToEvent(formData)
          })
        )

        // Check if any failed
        const failures = results.filter(result => !result.success)
        if (failures.length > 0) {
          setError(`Failed to add ${failures.length} contact(s): ${failures[0].error}`)
          return
        }

        // Success - reset form and close dialog
        setSelectedContactIds([])
        setStatus('Sourced')
        setIsNewConnection(false)
        setSearchTerm('')
        setContactTypeFilter('all')
        setEventTypeAttendedFilter('all')
        onOpenChange(false)
        router.refresh()
        
      } catch (error) {
        setError('An unexpected error occurred')
        logger.error('Failed to add guests to event', error instanceof Error ? error : new Error(String(error)), { 
          eventId,
          selectedContactIds,
          status,
          isNewConnection
        })
      }
    })
  }

  const handleCancel = () => {
    setSelectedContactIds([])
    setStatus('Sourced')
    setIsNewConnection(false)
    setSearchTerm('')
    setContactTypeFilter('all')
    setEventTypeAttendedFilter('all')
    setAreaFilter('all')
    setError(null)
    onOpenChange(false)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-[96vw] max-h-[90vh] h-[90vh] overflow-hidden flex flex-col p-8" style={{ width: '96vw', maxWidth: '96vw' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Guests to Event
          </DialogTitle>
          <DialogDescription>
            Select contacts to invite to this event. You can invite multiple contacts at once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 gap-10 overflow-hidden min-h-0">
          {/* Left Panel - Settings */}
          <div className="w-1/4 min-w-[320px] max-w-[380px] flex flex-col space-y-6 flex-shrink-0">
            {/* Invitation Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="is_new_connection" 
                    checked={isNewConnection}
                    onCheckedChange={(checked) => setIsNewConnection(checked === true)}
                  />
                  <Label htmlFor="is_new_connection">Mark as new connection</Label>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Label className="font-medium">Filters</Label>
                {loadingHistory && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_type_filter">Contact Type</Label>
                <Select value={contactTypeFilter} onValueChange={setContactTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All contact types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contact Types</SelectItem>
                    {CONTACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type_attended_filter">Event Type Attended</Label>
                <Select value={eventTypeAttendedFilter} onValueChange={setEventTypeAttendedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Event Type</SelectItem>
                    <SelectItem value="never_attended">Never Attended</SelectItem>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        Attended {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="area_filter">Area</Label>
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Area</SelectItem>
                    {CONTACT_AREA_OPTIONS.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Count */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                <strong>{selectedContactIds.length}</strong> contact{selectedContactIds.length !== 1 ? 's' : ''} selected
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>{filteredContacts.length}</strong> contact{filteredContacts.length !== 1 ? 's' : ''} visible
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>{availableContacts.length}</strong> total available
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Create New Contact */}
            <div className="border-t pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => window.open('/contacts', '_blank')} 
                disabled={isPending}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Contact
              </Button>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button type="submit" disabled={isPending || selectedContactIds.length === 0} className="w-full">
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding Guests...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add {selectedContactIds.length} Guest{selectedContactIds.length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending} className="w-full">
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Panel - Contact Selection */}
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Search */}
            <div className="space-y-2">
              <Label>Select Contacts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search contacts by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Bulk Selection Controls */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAllVisible}
                disabled={filteredContacts.length === 0}
                className="flex items-center gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                Select All Visible ({filteredContacts.length})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedContactIds.length === 0}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Clear Selection
              </Button>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto border rounded-lg bg-gray-50 min-h-0">
              {filteredContacts.length > 0 ? (
                <div className="p-6 space-y-4">
                  {filteredContacts.map((contact) => {
                    const attendedEventTypes = contactEventHistory[contact.id] || []
                    const displayName = ContactBusinessLogic.getDisplayName(contact)
                    return (
                      <div
                        key={contact.id}
                        className={`flex items-center space-x-5 p-6 rounded-lg border bg-white cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedContactIds.includes(contact.id) ? 'bg-blue-50 border-blue-200 shadow-sm' : 'border-gray-200'
                        }`}
                        onClick={() => handleContactToggle(contact.id)}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedContactIds.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedContactIds(prev => [...prev, contact.id])
                              } else {
                                setSelectedContactIds(prev => prev.filter(id => id !== contact.id))
                              }
                            }}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{displayName}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                {getContactTypeLabel(contact.contact_type)}
                              </Badge>
                              {contact.area && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {contact.area}
                                </Badge>
                              )}
                              {attendedEventTypes.length > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {attendedEventTypes.length} event{attendedEventTypes.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{contact.email}</span>
                              </div>
                            )}
                            {contact.company && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{contact.company}</span>
                              </div>
                            )}
                            {contact.job_title && (
                              <div className="text-sm text-gray-500 truncate">
                                {contact.job_title}
                              </div>
                            )}
                            {attendedEventTypes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {[...new Set(attendedEventTypes)].map((eventType) => (
                                  <Badge key={eventType} variant="outline" className="text-xs bg-blue-50">
                                    {getEventTypeLabel(eventType)}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  {searchTerm || contactTypeFilter !== 'all' || eventTypeAttendedFilter !== 'all' || areaFilter !== 'all' ? (
                    <div>
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">No contacts match your criteria</h3>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div>
                      <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="font-medium mb-2">All contacts have been invited</h3>
                      <p className="text-sm">There are no remaining contacts to invite to this event</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </DialogContent>


    </Dialog>
  )
} 