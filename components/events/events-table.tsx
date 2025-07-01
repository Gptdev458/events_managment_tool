'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EditEventDialog } from './edit-event-dialog'
import { DeleteEventDialog } from './delete-event-dialog'
import { Event } from '@/lib/supabase'
import { EVENT_TYPES, EVENT_STATUSES } from '@/lib/constants'
import { Search, Calendar, Edit, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface EventsTableProps {
  events: Event[]
}

export function EventsTable({ events }: EventsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'event_date' | 'created_at'>('event_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Filter and sort events
  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || event.event_type === filterType
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus
      
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      let aVal: string = ''
      let bVal: string = ''
      
      switch (sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'event_date':
          aVal = a.event_date
          bVal = b.event_date
          break
        case 'created_at':
          aVal = a.created_at || ''
          bVal = b.created_at || ''
          break
      }
      
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary'
      case 'confirmed': return 'default'
      case 'cancelled': return 'destructive'
      case 'completed': return 'outline'
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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search events by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {EVENT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {EVENT_STATUSES.map(status => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-')
          setSortBy(field as any)
          setSortOrder(order as 'asc' | 'desc')
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event_date-asc">Date (Earliest)</SelectItem>
            <SelectItem value="event_date-desc">Date (Latest)</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="created_at-desc">Recently Added</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedEvents.length} of {events.length} events
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'No events match your search criteria'
                    : 'No events yet. Create your first event!'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/events/${event.id}`}
                          className="hover:text-primary hover:underline flex items-center gap-1"
                        >
                          {event.name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        {isUpcoming(event.event_date) && (
                          <Badge variant="outline" className="text-xs">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                      {event.description && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {event.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{formatDate(event.event_date)}</div>
                        <div className="text-sm text-gray-500">{formatTime(event.event_date)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                      {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(event.status || 'planning') as any}>
                      {EVENT_STATUSES.find(s => s.value === event.status)?.label || 'Planning'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EditEventDialog event={event} />
                      <DeleteEventDialog event={event} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 