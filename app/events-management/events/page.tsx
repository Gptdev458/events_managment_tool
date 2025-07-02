import { EventsTable } from '@/components/events/events-table'
import { AddEventDialog } from '@/components/events/add-event-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getEvents } from '@/lib/actions'

export default async function EventsManagementEventsPage() {
  const { data: events, error } = await getEvents()

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your event portfolio</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600">Manage your event portfolio</p>
        </div>
        <AddEventDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Events</span>
            <Badge variant="secondary">{events.length} total</Badge>
          </CardTitle>
          <CardDescription>
            Create, track, and manage all your events and guest lists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventsTable events={events} />
        </CardContent>
      </Card>
    </div>
  )
} 