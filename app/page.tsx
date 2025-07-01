import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Force this page to be dynamically rendered instead of statically generated
export const dynamic = 'force-dynamic'

async function getDashboardData() {
  try {
    // Check if environment variables are available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables not found')
      return {
        totalContacts: 0,
        totalEvents: 0,
        totalPipeline: 0,
        recentEvents: [],
        connectionStatus: 'error',
        errorMessage: 'Environment variables not configured'
      }
    }

    // Get counts for dashboard metrics
    const [contactsResult, eventsResult, pipelineResult] = await Promise.all([
      supabase.from('contacts').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('relationship_pipeline').select('*', { count: 'exact', head: true })
    ])

    // Check for database errors
    if (contactsResult.error || eventsResult.error || pipelineResult.error) {
      console.error('Database query errors:', {
        contacts: contactsResult.error,
        events: eventsResult.error,
        pipeline: pipelineResult.error
      })
      return {
        totalContacts: 0,
        totalEvents: 0,
        totalPipeline: 0,
        recentEvents: [],
        connectionStatus: 'error',
        errorMessage: 'Database tables not found or accessible'
      }
    }

    // Get recent events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (eventsError) {
      console.error('Recent events query error:', eventsError)
    }

    return {
      totalContacts: contactsResult.count || 0,
      totalEvents: eventsResult.count || 0,
      totalPipeline: pipelineResult.count || 0,
      recentEvents: recentEvents || [],
      connectionStatus: 'connected',
      errorMessage: null
    }
  } catch (error) {
    // Log error for debugging
    console.error('Dashboard data fetch error:', error)
    return {
      totalContacts: 0,
      totalEvents: 0,
      totalPipeline: 0,
      recentEvents: [],
      connectionStatus: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export default async function Dashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events Management Tool</h1>
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
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 font-medium">Connection Failed</span>
              </div>
              {data.errorMessage && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Error: {data.errorMessage}
                </p>
              )}
              <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                <strong>Setup Required:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Create database tables in Supabase (see documentation)</li>
                  <li>Verify environment variables are set correctly</li>
                  <li>Check Supabase project status</li>
                </ol>
              </div>
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
          {data.connectionStatus === 'error' ? (
            <p className="text-gray-500">Unable to load events. Please check your database connection.</p>
          ) : data.recentEvents.length === 0 ? (
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your event management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/contacts" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Manage Contacts</h3>
              <p className="text-sm text-gray-600">Add and organize your network</p>
            </a>
            <a 
              href="/events" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Create Events</h3>
              <p className="text-sm text-gray-600">Plan and manage events</p>
            </a>
            <a 
              href="/pipeline" 
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">Relationship Pipeline</h3>
              <p className="text-sm text-gray-600">Track high-value connections</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
