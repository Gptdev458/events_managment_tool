import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, MapPin, Users, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getEventWithDetails, getEventInvitations, getAvailableContactsForEvent } from '@/lib/actions'
import { EVENT_TYPES, EVENT_STATUSES, INVITATION_STATUSES } from '@/lib/constants'
import { GuestListSection } from '@/components/events/guest-list-section'
import { isDateInFuture, isDateInPast, isDateToday, formatDisplayDateTime, getDaysBetween } from '@/lib/date-utils'

interface EventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params

  // Fetch all data in parallel
  const [eventResult, invitationsResult, availableContactsResult] = await Promise.all([
    getEventWithDetails(id),
    getEventInvitations(id),
    getAvailableContactsForEvent(id),
  ])

  if (!eventResult.success || !eventResult.data) {
    notFound()
  }

  const event = eventResult.data
  const invitations = invitationsResult.success ? invitationsResult.data : []
  const availableContacts = availableContactsResult.success ? availableContactsResult.data : []

  // Calculate guest list stats
  const totalInvited = invitations.length
  const rsvpYes = invitations.filter(inv => inv.status === 'RSVP_Yes').length
  const attended = invitations.filter(inv => inv.status === 'Attended').length
  const newConnections = invitations.filter(inv => inv.is_new_connection === true).length

  // Get event type and status labels
  const eventType = EVENT_TYPES.find(type => type.value === event.event_type)
  const eventStatus = EVENT_STATUSES.find(status => status.value === event.status)

  // Format date and time with proper timezone handling
  const eventDate = new Date(event.event_date)
  const isUpcoming = isDateInFuture(event.event_date)
  const isPast = isDateInPast(event.event_date)
  const isTodayEvent = isDateToday(event.event_date)
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/events" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </Button>
      </div>

      {/* Event Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <CardDescription className="text-base">
                {event.description || 'No description provided'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">
                {eventType?.label || event.event_type}
              </Badge>
              <Badge 
                variant={
                  event.status === 'Completed' ? 'default' :
                  event.status === 'Cancelled' ? 'destructive' :
                  event.status === 'In Progress' ? 'default' : 'secondary'
                }
              >
                {eventStatus?.label || event.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {eventDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {eventDate.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}

            {/* Capacity */}
            {event.max_attendees && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Capacity</p>
                  <p className="text-sm text-muted-foreground">
                    {rsvpYes} / {event.max_attendees} confirmed
                  </p>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isUpcoming ? 'Upcoming' : isPast ? 'Past Event' : 'Today'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isUpcoming 
                    ? `${Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to go`
                    : isPast 
                    ? `${Math.ceil((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))} days ago`
                    : 'Happening now'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest List Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalInvited}</div>
            <p className="text-sm text-muted-foreground">Total Invited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{rsvpYes}</div>
            <p className="text-sm text-muted-foreground">RSVP Yes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{attended}</div>
            <p className="text-sm text-muted-foreground">Attended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{newConnections}</div>
            <p className="text-sm text-muted-foreground">New Connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List Management */}
      <GuestListSection 
        eventId={id}
        invitations={invitations
          .filter(inv => inv.contacts !== null)
          .map(inv => ({
            ...inv,
            contacts: inv.contacts!,
            is_new_connection: inv.is_new_connection || false,
            status: inv.status || 'Sourced'
          }))}
        availableContacts={availableContacts}
        eventStatus={event.status || 'Upcoming'}
        isUpcoming={isUpcoming}
        isPast={isPast}
      />
    </div>
  )
} 