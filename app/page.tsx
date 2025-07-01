import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { logger } from '@/lib/logger'

async function getDashboardData() {
  try {
    // Get counts for dashboard metrics
    const [contactsResult, eventsResult, pipelineResult] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('relationship_pipeline').select('*', { count: 'exact', head: true })
    ])

    // Get recent events
    const { data: recentEvents } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      totalContacts: contactsResult.count || 0,
      totalEvents: eventsResult.count || 0,
      totalPipeline: pipelineResult.count || 0,
      recentEvents: recentEvents || [],
      connectionStatus: 'connected'
    }
  } catch (error) {
      // Log error for debugging
      console.error('Dashboard data fetch error:', error)
    return {
      totalContacts: 0,
      totalEvents: 0,
      totalPipeline: 0,
      recentEvents: [],
      connectionStatus: 'error'
    }
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your event management system</p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Database connection and health</CardDescription>
        </CardHeader>
        <CardContent>
          {data.connectionStatus === 'connected' ? (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">Connected to Supabase</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="text-red-700 font-medium">Connection Failed</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalContacts}</div>
            <p className="text-xs text-gray-500">People in your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEvents}</div>
            <p className="text-xs text-gray-500">Events managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalPipeline}</div>
            <p className="text-xs text-gray-500">High-value relationships</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest events in your system</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentEvents.length === 0 ? (
            <p className="text-gray-500">No events yet. Create your first event!</p>
          ) : (
            <div className="space-y-3">
              {data.recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-gray-600">{event.event_date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{event.event_type}</Badge>
                    <Badge variant={event.status === 'Completed' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
