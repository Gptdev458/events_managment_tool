'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { InlineActionEditor } from '@/components/ui/inline-action-editor'
import { InlineDateEditor } from '@/components/ui/inline-date-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EditPipelineDialog } from './edit-pipeline-dialog'
import { RemoveFromPipelineDialog } from './remove-from-pipeline-dialog'
import { PIPELINE_STAGES } from '@/lib/constants'
import { Calendar, Clock, ArrowUpDown, Search, Filter } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { Contact } from '@/lib/supabase'
import { updatePipelineStage } from '@/lib/actions'
import { getUpdatedRelationshipStage } from '@/lib/pipeline-stage-auto-update'

interface PipelineItem {
  id: number
  contact_id: string
  pipeline_stage: string
  next_action_description: string | null
  next_action_date: string | null
  last_action_date: string | null
  notes?: string | null
  created_at?: string | null
  contacts: Contact
}

interface PipelineTableProps {
  pipeline: PipelineItem[]
  contacts: Contact[]
}

type SortField = 'name' | 'company' | 'stage' | 'next_action_date' | 'last_action_date'
type SortDirection = 'asc' | 'desc'

export function PipelineTable({ pipeline, contacts }: PipelineTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('next_action_date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Helper function to get contact by ID
  const getContactById = (contactId: string) => {
    return pipeline.find(p => p.contact_id === contactId)?.contacts
  }

  // Filter and sort pipeline
  const filteredAndSortedPipeline = pipeline
    .filter((item) => {
      const contact = item.contacts
      if (!contact) return false

      const displayName = ContactBusinessLogic.getDisplayName(contact)
      
      const matchesSearch = !searchTerm || 
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pipeline_stage.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.next_action_description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStage = stageFilter === 'all' || item.pipeline_stage === stageFilter

      return matchesSearch && matchesStage
    })
    .sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = ContactBusinessLogic.getDisplayName(a.contacts).toLowerCase()
          bValue = ContactBusinessLogic.getDisplayName(b.contacts).toLowerCase()
          break
        case 'company':
          aValue = a.contacts?.company?.toLowerCase() || ''
          bValue = b.contacts?.company?.toLowerCase() || ''
          break
        case 'stage':
          aValue = a.pipeline_stage.toLowerCase()
          bValue = b.pipeline_stage.toLowerCase()
          break
        case 'next_action_date':
          aValue = a.next_action_date ? new Date(a.next_action_date).getTime() : 0
          bValue = b.next_action_date ? new Date(b.next_action_date).getTime() : 0
          break
        case 'last_action_date':
          aValue = a.last_action_date ? new Date(a.last_action_date).getTime() : 0
          bValue = b.last_action_date ? new Date(b.last_action_date).getTime() : 0
          break
        default:
          aValue = ''
          bValue = ''
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false
    return new Date(dateString) < new Date()
  }

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'Initial Outreach': return 'secondary'
      case 'Forming the Relationship': return 'default'
      case 'Maintaining the Relationship': return 'outline'
      default: return 'secondary'
    }
  }

  // Add handler for inline updates with auto-stage detection
  const handleInlineUpdate = async (itemId: number, field: 'next_action' | 'next_action_date' | 'last_action_date', value: string) => {
    const item = pipeline.find(p => p.id === itemId)
    if (!item) return

    try {
      let updatedStage = item.pipeline_stage
      
      // Auto-update stage when next action is changed
      if (field === 'next_action') {
        console.log('Event Auto-update: Current stage:', item.pipeline_stage, 'Action:', value)
        updatedStage = getUpdatedRelationshipStage(item.pipeline_stage, value)
        console.log('Event Auto-update: New stage:', updatedStage)
      }
      
      const formData = new FormData()
      formData.append('contact_id', item.contact_id)
      formData.append('pipeline_stage', updatedStage)
      
      if (field === 'next_action') {
        formData.append('next_action_description', value)
        formData.append('next_action_date', item.next_action_date || new Date().toISOString())
        if (item.last_action_date) {
          formData.append('last_action_date', item.last_action_date)
        }
      } else if (field === 'next_action_date') {
        formData.append('next_action_description', item.next_action_description || '')
        formData.append('next_action_date', value)
        if (item.last_action_date) {
          formData.append('last_action_date', item.last_action_date)
        }
      } else if (field === 'last_action_date') {
        formData.append('next_action_description', item.next_action_description || '')
        formData.append('next_action_date', item.next_action_date || new Date().toISOString())
        formData.append('last_action_date', value)
      }

      const result = await updatePipelineStage(itemId, formData)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update')
      }
      
      // No need to reload - the component will update automatically
    } catch (error) {
      console.error('Failed to update pipeline item:', error)
      throw error
    }
  }

  if (pipeline.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts in pipeline</h3>
        <p className="text-gray-600 mb-4">
          Start building strategic relationships by adding contacts to your pipeline.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, company, or next action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {PIPELINE_STAGES.map((stage) => (
                <SelectItem key={stage.value} value={stage.value}>
                  {stage.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || stageFilter !== 'all') && (
        <div className="text-sm text-gray-600">
          Showing {filteredAndSortedPipeline.length} of {pipeline.length} contacts
          {searchTerm && ` matching "${searchTerm}"`}
          {stageFilter !== 'all' && ` in ${stageFilter} stage`}
        </div>
      )}

      {/* Pipeline Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="h-auto p-0 font-semibold"
                >
                  Contact
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('company')}
                  className="h-auto p-0 font-semibold"
                >
                  Company
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('stage')}
                  className="h-auto p-0 font-semibold"
                >
                  Stage
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Next Action</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('last_action_date')}
                  className="h-auto p-0 font-semibold"
                >
                  Last Action Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('next_action_date')}
                  className="h-auto p-0 font-semibold"
                >
                  Next Action Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPipeline.map((item) => {
              const contact = item.contacts
              const overdue = isOverdue(item.next_action_date)
              
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {ContactBusinessLogic.getDisplayName(contact)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {contact.job_title}
                      </span>
                      {contact.email ? (
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No email</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{contact.company || 'No Company'}</span>
                      <Badge variant="outline" className="text-xs w-fit">
                        {contact.contact_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStageBadgeVariant(item.pipeline_stage)} className="whitespace-normal break-words max-w-[150px] text-center">
                      {item.pipeline_stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <InlineActionEditor
                      value={item.next_action_description || ''}
                      onSave={(value) => handleInlineUpdate(item.id, 'next_action', value)}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineDateEditor
                      value={item.last_action_date}
                      onSave={(value) => handleInlineUpdate(item.id, 'last_action_date', value)}
                      allowPastDates={true}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineDateEditor
                      value={item.next_action_date}
                      onSave={(value) => handleInlineUpdate(item.id, 'next_action_date', value)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-sm text-gray-600">
                      —
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <EditPipelineDialog pipelineItem={{
                        ...item,
                        stage: item.pipeline_stage,
                        next_action: item.next_action_description || '',
                        next_action_date: item.next_action_date || new Date().toISOString(),
                        notes: item.notes || '',
                        created_at: item.created_at || new Date().toISOString(),
                        last_action_date: item.last_action_date || ''
                      }} />
                      <RemoveFromPipelineDialog pipelineItem={{
                        ...item,
                        stage: item.pipeline_stage,
                        next_action: item.next_action_description || '',
                        next_action_date: item.next_action_date || new Date().toISOString(),
                        notes: item.notes || '',
                        created_at: item.created_at || new Date().toISOString()
                      }} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredAndSortedPipeline.length === 0 && (searchTerm || stageFilter !== 'all') && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No contacts match your search criteria.</p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('')
              setStageFilter('all')
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
} 