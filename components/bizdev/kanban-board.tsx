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
  const handleTaskMove = async (taskId: string, newStatus: keyof KanbanBoardData) => {
    if (newStatus !== status) {
      await onTaskStatusUpdate(taskId, newStatus)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className={cn("p-4 rounded-t-lg border-b-2", color)}>
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
      
      <div className="flex-1 p-2 space-y-3 bg-gray-50 min-h-[400px] overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onMove={handleTaskMove}
            onEdit={onTaskEdit}
          />
        ))}
        
        {tasks.length === 0 && (
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
  const getProject = () => {
    // In a real implementation, you'd get this from the task's project relationship
    return null
  }

  const getStatusActions = (currentStatus: string) => {
    const actions = []
    
    if (currentStatus !== 'todo') {
      actions.push({ status: 'todo', label: 'To Do', icon: Clock })
    }
    if (currentStatus !== 'doing') {
      actions.push({ status: 'doing', label: 'Doing', icon: Play })
    }
    if (currentStatus !== 'waiting') {
      actions.push({ status: 'waiting', label: 'Waiting', icon: Pause })
    }
    if (currentStatus !== 'done') {
      actions.push({ status: 'done', label: 'Done', icon: CheckCircle })
    }
    
    return actions
  }

  const statusActions = getStatusActions(task.status || 'todo')
  const subtaskCount = task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{task.text}</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={() => onEdit(task)}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Project Info */}
          {getProject() && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {/* {getProject()?.name} */}
              </Badge>
              {/* {getProject()?.is_ian_collaboration && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Ian
                </Badge>
              )} */}
            </div>
          )}
          
          {/* Subtasks Progress */}
          {subtaskCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <CheckCircle className="h-3 w-3" />
              <span>{completedSubtasks}/{subtaskCount} subtasks</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all"
                  style={{ width: `${subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Completion Status */}
          {task.completed && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          
          {/* Status Change Actions */}
          <div className="flex flex-wrap gap-1">
            {statusActions.map((action) => (
              <Button
                key={action.status}
                size="sm"
                variant="outline"
                className="h-6 text-xs"
                onClick={() => onMove(task.id, action.status as keyof KanbanBoardData)}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[600px]">
        {columns.map((column) => (
          <div key={column.id} className="border rounded-lg overflow-hidden bg-white">
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