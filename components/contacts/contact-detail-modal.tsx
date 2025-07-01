'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { getContactEventHistory } from '@/lib/actions'
import { Contact } from '@/lib/supabase'
import { EVENT_TYPES, EVENT_STATUSES, CONTACT_TYPES } from '@/lib/constants'
import { Calendar, Building, Mail, User, ExternalLink, Phone, ClipboardList, Loader2 } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'

interface ContactDetailModalProps {
  contact: Contact
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface EventInvitation {
  id: number
  status: string
  follow_up_notes: string | null
  is_new_connection: boolean | null
  events: {
    id: string
    name: string
    event_date: string
    event_type: string
    status: string | null
    description: string | null
  }
}

export function ContactDetailModal({ contact, open, onOpenChange }: ContactDetailModalProps) {
  const [eventHistory, setEventHistory] = useState<EventInvitation[]>([])
  const [loading, setLoading] = useState(false)

  const getDisplayName = (contact: Contact) => {
    return ContactBusinessLogic.getDisplayName(contact)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'default'
      case 'declined': return 'destructive'
      case 'pending': return 'secondary'
      case 'sourced': return 'outline'
      default: return 'secondary'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-purple-100 text-purple-800'
      case 'engineering': return 'bg-blue-100 text-blue-800'
      case 'startup': return 'bg-green-100 text-green-800'
      case 'cto_club': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    if (open && contact.id) {
      const fetchEventHistory = async () => {
        setLoading(true)
        try {
          const result = await getContactEventHistory(contact.id)
          if (result.success && result.data) {
            setEventHistory(result.data)
          }
        } catch (error) {
          console.error('Failed to fetch event history:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchEventHistory()
    }
  }, [open, contact.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {getDisplayName(contact)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold">{ContactBusinessLogic.getDisplayName(contact)}</h2>
              {contact.job_title && contact.company && (
                <p className="text-muted-foreground">{contact.job_title} at {contact.company}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email Address{ContactBusinessLogic.hasMultipleEmails(contact) ? 'es' : ''}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{ContactBusinessLogic.getPrimaryEmail(contact)}</p>
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                </div>
                {ContactBusinessLogic.getAdditionalEmails(contact).map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <p className="text-muted-foreground">{email}</p>
                    <Badge variant="outline" className="text-xs">Additional</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-sm">{getDisplayName(contact)}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-sm">
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                      >
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    </p>
                  </div>

                  {contact.job_title && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Job Title:</span>
                      <p className="text-sm">{contact.job_title}</p>
                    </div>
                  )}

                  {contact.company && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Company:</span>
                      <p className="text-sm flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {contact.company}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact Type:</span>
                    <p className="text-sm">
                      <Badge variant="outline">
                        {CONTACT_TYPES.find(type => type.value === contact.contact_type)?.label || contact.contact_type}
                      </Badge>
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">CTO Club Member:</span>
                    <p className="text-sm">
                      {contact.is_in_cto_club ? (
                        <Badge variant="default">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </p>
                  </div>

                  {contact.linkedin_url && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">LinkedIn:</span>
                      <p className="text-sm">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="h-8"
                        >
                          <a 
                            href={contact.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Profile
                          </a>
                        </Button>
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-500">Added:</span>
                    <p className="text-sm">{contact.created_at ? formatDate(contact.created_at) : 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Notes
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg min-h-[100px]">
                  {contact.general_notes ? (
                    <p className="text-sm whitespace-pre-wrap">{contact.general_notes}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No notes available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t my-6" />

          {/* Event History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Event History
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-gray-500">Loading event history...</span>
              </div>
            ) : eventHistory.length > 0 ? (
              <div className="space-y-3">
                {eventHistory.map((invitation) => (
                  <div key={invitation.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{invitation.events.name}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(invitation.events.event_type)}`}>
                            {EVENT_TYPES.find(t => t.value === invitation.events.event_type)?.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(invitation.events.event_date)}
                          </span>
                          <Badge variant={getStatusColor(invitation.status) as any}>
                            {invitation.status}
                          </Badge>
                          {invitation.is_new_connection && (
                            <Badge variant="outline" className="text-xs">
                              New Connection
                            </Badge>
                          )}
                        </div>

                        {invitation.events.description && (
                          <p className="text-sm text-gray-600 mb-2">{invitation.events.description}</p>
                        )}

                        {invitation.follow_up_notes && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Follow-up Notes:</span>
                            <p className="text-sm text-gray-700 italic">{invitation.follow_up_notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No event history found</p>
                <p className="text-sm">This contact hasn't attended any events yet.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 