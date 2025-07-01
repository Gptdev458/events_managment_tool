'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, TrendingUp, Users } from 'lucide-react'
import { Contact } from '@/lib/database.types'

interface PipelineItem {
  id: number
  contact_id: string
  pipeline_stage: string
  next_action_description: string | null
  next_action_date: string | null
  contacts: Contact
}

interface PipelineStatsProps {
  pipeline: PipelineItem[]
}

export function PipelineStats({ pipeline }: PipelineStatsProps) {
  // Calculate stage distribution
  const stageStats = pipeline.reduce((acc, item) => {
    acc[item.pipeline_stage] = (acc[item.pipeline_stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate upcoming actions (next 7 days)
  const today = new Date()
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  const upcomingActions = pipeline.filter(item => {
    if (!item.next_action_date) return false
    const actionDate = new Date(item.next_action_date)
    return actionDate >= today && actionDate <= next7Days
  }).length

  // Calculate overdue actions
  const overdueActions = pipeline.filter(item => {
    if (!item.next_action_date) return false
    const actionDate = new Date(item.next_action_date)
    return actionDate < today
  }).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Contacts
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pipeline.length}</div>
          <p className="text-xs text-muted-foreground">
            In relationship pipeline
          </p>
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Due This Week
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{upcomingActions}</div>
          <p className="text-xs text-muted-foreground">
            Actions scheduled
          </p>
        </CardContent>
      </Card>

      {/* Overdue Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overdue Actions
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overdueActions}</div>
          <p className="text-xs text-muted-foreground">
            Need immediate attention
          </p>
        </CardContent>
      </Card>

      {/* Stage Distribution */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Stage Distribution
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stageStats).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stage}</span>
                <Badge variant="secondary" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
            {Object.keys(stageStats).length === 0 && (
              <p className="text-xs text-muted-foreground">No data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 