import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalendarDays, Users, TrendingUp, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EventsManagementDashboard() {
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
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active events</p>
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
              <div className="text-2xl font-bold">247</div>
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
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Active prospects</p>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Tech Conference 2024</p>
                  <p className="text-sm text-gray-500">Upcoming</p>
                </div>
                <div className="text-sm text-gray-500">Mar 15</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Networking Mixer</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="text-sm text-gray-500">Feb 20</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Status</CardTitle>
            <CardDescription>Current prospects overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>New Leads</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span>In Progress</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Ready to Close</span>
                <span className="font-medium">4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 