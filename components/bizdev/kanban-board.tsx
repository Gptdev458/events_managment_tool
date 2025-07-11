'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AddTaskDialog } from './add-task-dialog'
import { EditTaskDialog } from './edit-task-dialog'
import { updateTaskStatus } from '@/lib/bizdev-actions'
import { BIZDEV_CONSTANTS } from '@/lib/bizdev-types'
import { Plus, Edit, CheckCircle, Clock, Play, Pause, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, Project } from '@/lib/database.types'
import type { TaskWithSubtasks, KanbanBoardData } from '@/lib/bizdev-types'

interface KanbanBoardProps {
  kanbanData: KanbanBoardData
  projects: Project[]
}

interface KanbanColumnProps {
  title: string
  tasks: TaskWithSubtasks[]
  status: keyof KanbanBoardData
  color: string
  icon: React.ReactNode
  projects: Project[]
  onTaskStatusUpdate: (taskId: string, newStatus: keyof KanbanBoardData) => void
  onTaskEdit: (task: Task) => void
}

function KanbanColumn({ 
  title, 
  tasks, 
  status, 
  color, 
  icon, 
  projects, 
  onTaskStatusUpdate, 
  onTaskEdit 
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleTaskMove = async (taskId: string, newStatus: keyof KanbanBoardData) => {
    if (newStatus !== status) {
      await onTaskStatusUpdate(taskId, newStatus)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only remove drag-over state if we're actually leaving the container
    const container = e.currentTarget as HTMLElement
    if (!container.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    console.log('🔴 DROP EVENT FIRED!', status)
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData('text/plain')
    console.log('   Dragged task ID:', taskId, 'to status:', status)

    if (!taskId) {
      console.error('❌ No task ID found in drop event')
      return
    }

    // Find the dragged card element
    const draggedCard = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement
    if (!draggedCard) {
      console.error('❌ Could not find dragged card element')
      return
    }

    const currentContainer = draggedCard.parentElement?.closest('.cards-container')
    const currentStatus = currentContainer?.getAttribute('data-status')

    console.log('   Moving from', currentStatus, 'to', status)

    // Don't process if dropping in the same container
    if (currentStatus === status) {
      console.log('⚠️ Dropped in same container, no action needed')
      return
    }

    // Update task status
    try {
      await onTaskStatusUpdate(taskId, status)
      console.log('✅ Task status updated successfully')
      
      // Add success animation
      draggedCard.classList.add('card-move-success')
      setTimeout(() => {
        draggedCard.classList.remove('card-move-success')
      }, 500)
      
    } catch (error) {
      console.error('❌ Failed to update task status:', error)
      
      // Add error feedback
      draggedCard.style.border = '2px solid #ef4444'
      setTimeout(() => {
        draggedCard.style.border = ''
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col">
      <div className={cn("column-header p-3 rounded-t-lg border-b-2", `${status}-header`, color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          <AddTaskDialog 
            projects={projects}
            triggerButton={
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      </div>
      
      <div 
        className={cn(
          "p-3 space-y-3 bg-gray-50 cards-container",
          isDragOver && "drag-over"
        )}
        data-status={status}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onMove={handleTaskMove}
            onEdit={onTaskEdit}
          />
        ))}
        
        {tasks.length === 0 && !isDragOver && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No {title.toLowerCase()} tasks
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskCardProps {
  task: TaskWithSubtasks
  onMove: (taskId: string, newStatus: keyof KanbanBoardData) => void
  onEdit: (task: Task) => void
}

function TaskCard({ task, onMove, onEdit }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    console.log('🟢 DRAGSTART EVENT FIRED!', task.id)
    setIsDragging(true)
    
    // Set drag data
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Add visual feedback
    const element = e.currentTarget as HTMLElement
    element.style.opacity = '0.5'
    element.style.transform = 'rotate(2deg)'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('🏁 DRAGEND EVENT FIRED!', task.id)
    setIsDragging(false)
    
    // Reset visual feedback
    const element = e.currentTarget as HTMLElement
    element.style.opacity = '1'
    element.style.transform = ''
  }

  return (
    <Card 
      className={cn(
        "kanban-card cursor-move hover:shadow-md transition-shadow bg-white border border-gray-200 group",
        isDragging && "dragging opacity-50"
      )}
      draggable={true}
      data-task-id={task.id}
      data-project-id={task.project_id}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-4">
        {/* Task Text - Main Content */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-normal break-words whitespace-normal">
              {task.text?.trim() || 'Untitled Task'}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-100 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            title="Edit"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function KanbanBoard({ kanbanData, projects }: KanbanBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleTaskStatusUpdate = async (taskId: string, newStatus: keyof KanbanBoardData) => {
    try {
      await updateTaskStatus(taskId, newStatus, newStatus === 'done')
      // The parent component should handle the refresh
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const columns = BIZDEV_CONSTANTS.KANBAN_COLUMNS.map(column => ({
    ...column,
    tasks: kanbanData[column.id as keyof KanbanBoardData] || [],
    icon: getColumnIcon(column.id),
  }))

  function getColumnIcon(columnId: string) {
    switch (columnId) {
      case 'todo': return <Clock className="h-4 w-4" />
      case 'doing': return <Play className="h-4 w-4" />
      case 'waiting': return <Pause className="h-4 w-4" />
      case 'done': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Task Board</h2>
          <p className="text-sm text-gray-600">
            Drag and drop tasks between columns to update their status
          </p>
        </div>
        <AddTaskDialog projects={projects} />
      </div>
      
      <div className="kanban-board grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="border rounded-lg overflow-hidden bg-white shadow-sm h-fit">
            <KanbanColumn
              title={column.label}
              tasks={column.tasks}
              status={column.id as keyof KanbanBoardData}
              color={column.color}
              icon={column.icon}
              projects={projects}
              onTaskStatusUpdate={handleTaskStatusUpdate}
              onTaskEdit={setEditingTask}
            />
          </div>
        ))}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  )
}

interface ProjectKanbanBoardProps {
  projectId: string
  project: Project
  kanbanData: KanbanBoardData
  onRefresh?: () => void
}

export function ProjectKanbanBoard({ projectId, project, kanbanData, onRefresh }: ProjectKanbanBoardProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleTaskStatusUpdate = async (taskId: string, newStatus: keyof KanbanBoardData) => {
    try {
      await updateTaskStatus(taskId, newStatus, newStatus === 'done')
      onRefresh?.()
    } catch (error) {
      console.error('Failed to update task status:', error)
    }
  }

  const columns = BIZDEV_CONSTANTS.KANBAN_COLUMNS.map(column => ({
    ...column,
    tasks: kanbanData[column.id as keyof KanbanBoardData] || [],
    icon: getColumnIcon(column.id),
  }))

  function getColumnIcon(columnId: string) {
    switch (columnId) {
      case 'todo': return <Clock className="h-4 w-4" />
      case 'doing': return <Play className="h-4 w-4" />
      case 'waiting': return <Pause className="h-4 w-4" />
      case 'done': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Project Tasks - Kanban Board</h3>
          <p className="text-sm text-gray-600">
            {project.name} task management
          </p>
        </div>
        <AddTaskDialog 
          projects={[project]} 
          defaultProjectId={projectId}
          triggerButton={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          }
        />
      </div>
      
      <div className="kanban-board grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="border rounded-lg overflow-hidden bg-white shadow-sm h-fit">
            <KanbanColumn
              title={column.label}
              tasks={column.tasks}
              status={column.id as keyof KanbanBoardData}
              color={column.color}
              icon={column.icon}
              projects={[project]}
              onTaskStatusUpdate={handleTaskStatusUpdate}
              onTaskEdit={setEditingTask}
            />
          </div>
        ))}
      </div>

      {/* Edit Task Dialog */}
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
        />
      )}
    </div>
  )
} 