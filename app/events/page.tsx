import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getEvents } from '@/lib/actions'
import { EventsTable } from '@/components/events/events-table'
import { AddEventDialog } from '@/components/events/add-event-dialog'

export default async function EventsPage() {
  const { data: events, error } = await getEvents()

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your exclusive events and guest lists</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading events: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const upcomingEvents = events.filter(event => new Date(event.event_date) > new Date())
  const pastEvents = events.filter(event => new Date(event.event_date) <= new Date())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your exclusive events and guest lists</p>
        </div>
        <AddEventDialog />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{events.length}</div>
            <p className="text-sm text-gray-600">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{upcomingEvents.length}</div>
            <p className="text-sm text-gray-600">Upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{pastEvents.length}</div>
            <p className="text-sm text-gray-600">Past Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">
              {events.filter(e => e.status === 'Invitations Sent' || e.status === 'In Progress').length}
            </div>
            <p className="text-sm text-gray-600">Active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Events</span>
            <Badge variant="secondary">{events.length} total</Badge>
          </CardTitle>
          <CardDescription>
            Create, manage, and track your exclusive events with guest lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventsTable events={events} />
        </CardContent>
      </Card>
    </div>
  )
} 