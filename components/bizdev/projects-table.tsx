'use client'

import { useState, useMemo } from 'react'
import { useDebounce } from '@/lib/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { EditProjectDialog } from './edit-project-dialog'
import { DeleteProjectDialog } from './delete-project-dialog'
import { ProjectRatingDialog } from './project-rating-dialog'
import { ProjectRatingCompact } from './project-rating-display'
import { InlineSelectEditor } from '@/components/ui/inline-select-editor'
import { updateProjectStatus, updateProjectPriority } from '@/lib/bizdev-actions'
import { calculateProjectRating } from '@/lib/rating-utils'
import { Search, Edit, Trash2, Star, Calendar, Target, Users } from 'lucide-react'
import { BIZDEV_CONSTANTS } from '@/lib/bizdev-types'
import type { Project, ProjectStatus, ProjectPriority } from '@/lib/database.types'
import { cn } from '@/lib/utils'

interface ProjectsTableProps {
  projects: Project[]
  showIanCollaboration?: boolean
}

export function ProjectsTable({ projects, showIanCollaboration = false }: ProjectsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'rating' | 'priority'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [ratingProject, setRatingProject] = useState<Project | null>(null)

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filter projects based on Ian collaboration setting
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (showIanCollaboration) {
        // In collaboration tab, show only Ian collaboration projects
        return project.is_ian_collaboration === true
      } else {
        // In BizDev Overview tab, show only non-Ian collaboration projects
        return project.is_ian_collaboration === false
      }
    })
  }, [projects, showIanCollaboration])

  // Filter and sort projects with memoization
  const filteredAndSortedProjects = useMemo(() => filteredProjects
    .filter(project => {
      const name = project.name || ''
      const description = project.description || ''
      
      const matchesSearch = 
        name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus
      const matchesPriority = filterPriority === 'all' || project.priority === filterPriority

      return matchesSearch && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      let aVal: any = ''
      let bVal: any = ''
      
      switch (sortBy) {
        case 'name':
          aVal = a.name || ''
          bVal = b.name || ''
          break
        case 'created_at':
          aVal = a.created_at || ''
          bVal = b.created_at || ''
          break
        case 'rating':
          // Use the simple rating field directly for sorting
          aVal = Number(a.rating) || 0
          bVal = Number(b.rating) || 0
          break
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
      }
      
      if (sortOrder === 'asc') {
        return typeof aVal === 'string' ? aVal.localeCompare(bVal) : aVal - bVal
      } else {
        return typeof bVal === 'string' ? bVal.localeCompare(aVal) : bVal - aVal
      }
    }), [filteredProjects, debouncedSearchTerm, filterStatus, filterPriority, sortBy, sortOrder])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return 'bg-gray-100 text-gray-800'
    return BIZDEV_CONSTANTS.PROJECT_PRIORITY_COLORS[priority as keyof typeof BIZDEV_CONSTANTS.PROJECT_PRIORITY_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    return BIZDEV_CONSTANTS.PROJECT_STATUS_COLORS[status as keyof typeof BIZDEV_CONSTANTS.PROJECT_STATUS_COLORS] || 'bg-gray-100 text-gray-800'
  }

  const renderRating = (project: Project) => {
    if (!project.rating || project.rating === 0) {
      return (
        <div className="text-gray-400 text-sm cursor-pointer" onClick={() => setRatingProject(project)}>
          Not rated
        </div>
      )
    }

    return (
      <div className="text-blue-600 font-medium text-sm cursor-pointer" onClick={() => setRatingProject(project)}>
        {Number(project.rating).toFixed(2)}
      </div>
    )
  }

  const handleStatusUpdate = async (projectId: string, newStatus: string) => {
    try {
      const result = await updateProjectStatus(projectId, newStatus as ProjectStatus)
      if (!result.success) {
        console.error('Failed to update status:', result.error)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handlePriorityUpdate = async (projectId: string, newPriority: string) => {
    try {
      const result = await updateProjectPriority(projectId, newPriority as ProjectPriority)
      if (!result.success) {
        console.error('Failed to update priority:', result.error)
      }
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const statusOptions = [
    { value: 'potential', label: 'Potential', className: 'bg-purple-100 text-purple-800' },
    { value: 'active', label: 'Active', className: 'bg-blue-100 text-blue-800' },
    { value: 'on-hold', label: 'On Hold', className: 'bg-orange-100 text-orange-800' },
    { value: 'completed', label: 'Completed', className: 'bg-green-100 text-green-800' },
    { value: 'archived', label: 'Archived', className: 'bg-gray-100 text-gray-800' },
  ]

  const priorityOptions = [
    { value: 'high', label: 'High', className: 'bg-red-100 text-red-800' },
    { value: 'medium', label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
    { value: 'low', label: 'Low', className: 'bg-green-100 text-green-800' },
  ]

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="potential">Potential</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
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
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="rating-desc">Highest Rated</SelectItem>
            <SelectItem value="rating-asc">Lowest Rated</SelectItem>
            <SelectItem value="priority-desc">High Priority First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rating</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {debouncedSearchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                    ? 'No projects match your filters'
                    : showIanCollaboration 
                      ? 'No Ian collaboration projects yet'
                      : 'No projects yet. Create your first project to get started.'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    {renderRating(project)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{project.name}</span>
                        {project.is_ian_collaboration && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            Ian
                          </Badge>
                        )}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.priority ? (
                      <InlineSelectEditor
                        value={project.priority}
                        options={priorityOptions}
                        onSave={(newPriority) => handlePriorityUpdate(project.id, newPriority)}
                        placeholder="Select priority"
                      />
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 capitalize">
                        Unknown
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.status ? (
                      <InlineSelectEditor
                        value={project.status}
                        options={statusOptions}
                        onSave={(newStatus) => handleStatusUpdate(project.id, newStatus)}
                        placeholder="Select status"
                      />
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 capitalize">
                        Unknown
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingProject(project)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
        />
      )}

      {deletingProject && (
        <DeleteProjectDialog
          project={deletingProject}
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
        />
      )}

      {ratingProject && (
        <ProjectRatingDialog
          projectId={ratingProject.id}
          projectName={ratingProject.name}
          currentRating={ratingProject.detailed_ratings_data as any}
          onUpdate={() => {
            setRatingProject(null)
            // Refresh would be handled by parent component
          }}
        />
      )}
    </div>
  )
} 