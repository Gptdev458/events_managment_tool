import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalendarDays, Users, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getEvents, getContacts, getRelationshipPipeline } from "@/lib/actions"
import { EventBusinessLogic, PipelineBusinessLogic } from "@/lib/business-logic"
import { Badge } from "@/components/ui/badge"

export default async function EventsManagementDashboard() {
  // Fetch all data in parallel
  const [eventsResult, contactsResult, pipelineResult] = await Promise.all([
    getEvents(),
    getContacts(),
    getRelationshipPipeline()
  ])

  // Extract data with fallbacks
  const events = eventsResult.success ? eventsResult.data : []
  const contacts = contactsResult.success ? contactsResult.data : []
  const pipeline = pipelineResult.success ? pipelineResult.data : []

  // Calculate event statistics
  const totalEvents = events.length
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.event_date)
    return eventDate > new Date()
  })
  const activeEvents = events.filter(event => 
    event.status === 'Invitations Sent' || event.status === 'In Progress'
  )

  // Calculate pipeline statistics by stage
  const pipelineStats = pipeline.reduce((acc, item) => {
    acc[item.pipeline_stage] = (acc[item.pipeline_stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Group stages by relationship development phase
  const newConnections = (pipelineStats['New Contact'] || 0) + (pipelineStats['Initial Outreach'] || 0)
  const developing = (pipelineStats['Connected'] || 0) + (pipelineStats['Building Relationship'] || 0)
  const strategic = (pipelineStats['Strong Relationship'] || 0) + (pipelineStats['Strategic Partner'] || 0)

  // Get recent events (last 5, sorted by creation date)
  const recentEvents = events
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5)

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Determine event status for display
  const getDisplayStatus = (event: any) => {
    const eventDate = new Date(event.event_date)
    const now = new Date()
    
    if (eventDate > now) return 'Upcoming'
    if (eventDate.toDateString() === now.toDateString()) return 'Today'
    return 'Completed'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your events, contacts, and pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/events-management/events">
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/events-management/events">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {upcomingEvents.length} upcoming, {activeEvents.length} active
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/events-management/contacts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">Total contacts</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/events-management/pipeline">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pipeline.length}</div>
              <p className="text-xs text-muted-foreground">Relationship building</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest event activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No events yet. Create your first event!</p>
                <Button asChild className="mt-2" size="sm">
                  <Link href="/events-management/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex justify-between items-center">
                    <div>
                      <Link 
                        href={`/events-management/events/${event.id}`}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {event.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">{getDisplayStatus(event)}</p>
                        {event.event_type && (
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatEventDate(event.event_date)}
                    </div>
                  </div>
                ))}
                {recentEvents.length >= 5 && (
                  <div className="pt-2 border-t">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href="/events-management/events">View All Events</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relationship Pipeline</CardTitle>
            <CardDescription>Strategic relationship development</CardDescription>
          </CardHeader>
          <CardContent>
            {pipeline.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No contacts in pipeline yet.</p>
                <Button asChild className="mt-2" size="sm">
                  <Link href="/events-management/pipeline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Pipeline
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>New Connections</span>
                  <span className="font-medium">{newConnections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Developing</span>
                  <span className="font-medium">{developing}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Strategic Partners</span>
                  <span className="font-medium">{strategic}</span>
                </div>
                <div className="pt-2 border-t">
                  <Button asChild variant="ghost" size="sm" className="w-full">
                    <Link href="/events-management/pipeline">View Full Pipeline</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 