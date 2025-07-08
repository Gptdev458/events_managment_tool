'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Edit, 
  ChevronUp, 
  ChevronDown, 
  Calendar,
  Users,
  Target,
  Trash2
} from "lucide-react"
import { useState, useEffect, useCallback, memo } from 'react'
import type { 
  CtoClubEngagementInitiative, 
  CtoClubEngagementTask 
} from '@/lib/cto-club-engagement-actions'
import { 
  getCtoClubEngagementDataBulk,
  updateCtoClubEngagementTask,
  deleteCtoClubEngagementInitiative,
  deleteCtoClubEngagementTask
} from '@/lib/cto-club-engagement-actions'
import { CreateEngagementInitiativeDialog } from './create-engagement-initiative-dialog'
import { EditEngagementInitiativeDialog } from './edit-engagement-initiative-dialog'
import { CreateEngagementTaskDialog } from './create-engagement-task-dialog'
import { EditEngagementTaskDialog } from './edit-engagement-task-dialog'

interface MemberEngagementTabProps {
  // No props needed since this is global data
}

export function MemberEngagementTab({}: MemberEngagementTabProps) {
  const [initiatives, setInitiatives] = useState<CtoClubEngagementInitiative[]>([])
  const [allTasks, setAllTasks] = useState<CtoClubEngagementTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateInitiativeDialog, setShowCreateInitiativeDialog] = useState(false)
  const [showEditInitiativeDialog, setShowEditInitiativeDialog] = useState(false)
  const [selectedInitiative, setSelectedInitiative] = useState<CtoClubEngagementInitiative | null>(null)

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCtoClubEngagementDataBulk()
      setInitiatives(data.initiatives)
      setAllTasks(data.allTasks)
    } catch (error) {
      console.error('Error loading engagement data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const handleEditInitiative = (initiative: CtoClubEngagementInitiative) => {
    setSelectedInitiative(initiative)
    setShowEditInitiativeDialog(true)
  }

  const handleDeleteInitiative = async (initiativeId: string) => {
    if (confirm('Are you sure you want to delete this initiative? All associated tasks will also be deleted.')) {
      try {
        await deleteCtoClubEngagementInitiative(initiativeId)
        await refreshData()
      } catch (error) {
        console.error('Error deleting initiative:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Member Engagement & Value Delivery</h2>
            <p className="text-gray-600">Loading engagement initiatives...</p>
          </div>
        </div>
      </div>
    )
  }

  if (initiatives.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Member Engagement & Value Delivery</CardTitle>
            <CardDescription>
              Organize and track initiatives to provide additional value to CTO club members through social activities, events, and support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Engagement Initiatives Yet</h3>
              <p className="text-gray-600 mb-4">
                Start creating value-add initiatives for your CTO club members like dinners, workshops, or networking events.
              </p>
              <Button 
                onClick={() => setShowCreateInitiativeDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Engagement Initiative
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CreateEngagementInitiativeDialog
          open={showCreateInitiativeDialog}
          onOpenChange={setShowCreateInitiativeDialog}
          onSuccess={refreshData}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Member Engagement & Value Delivery</h2>
          <p className="text-gray-600">Initiatives to provide additional value to CTO club members</p>
        </div>
        <Button 
          onClick={() => setShowCreateInitiativeDialog(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Initiative
        </Button>
      </div>

      <div className="space-y-4">
        {initiatives.map(initiative => (
          <EngagementInitiativeCard
            key={initiative.id}
            initiative={initiative}
            tasks={allTasks.filter(task => task.initiative_id === initiative.id)}
            onRefresh={refreshData}
            onEditInitiative={handleEditInitiative}
            onDeleteInitiative={handleDeleteInitiative}
          />
        ))}
      </div>

      {/* Dialogs */}
      <CreateEngagementInitiativeDialog
        open={showCreateInitiativeDialog}
        onOpenChange={setShowCreateInitiativeDialog}
        onSuccess={refreshData}
      />

      <EditEngagementInitiativeDialog
        open={showEditInitiativeDialog}
        onOpenChange={setShowEditInitiativeDialog}
        onSuccess={refreshData}
        initiative={selectedInitiative}
      />
    </div>
  )
}

interface EngagementInitiativeCardProps {
  initiative: CtoClubEngagementInitiative
  tasks: CtoClubEngagementTask[]
  onRefresh: () => void
  onEditInitiative: (initiative: CtoClubEngagementInitiative) => void
  onDeleteInitiative: (initiativeId: string) => void
}

const EngagementInitiativeCard = memo(function EngagementInitiativeCard({ 
  initiative, 
  tasks, 
  onRefresh, 
  onEditInitiative,
  onDeleteInitiative 
}: EngagementInitiativeCardProps) {
  const [showTasks, setShowTasks] = useState(false)
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<CtoClubEngagementTask | null>(null)
  const [localTasks, setLocalTasks] = useState(tasks)

  // Sync local tasks with props when tasks change
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const handleTaskStatusToggle = useCallback(async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'done' ? 'to_do' : 'done'
      
      // Optimistically update local state immediately
      setLocalTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus as any } : task
        )
      )
      
      // Update database without refreshing the page
      await updateCtoClubEngagementTask(taskId, { status: newStatus as any })
      
      // Don't call onRefresh() to avoid page restart and initiative collapse
      
    } catch (error) {
      console.error('Error updating task status:', error)
      // Revert optimistic update on error
      setLocalTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: currentStatus as any } : task
        )
      )
      alert('Failed to update task. Please try again.')
    }
  }, [])

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteCtoClubEngagementTask(taskId)
        onRefresh()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    }
  }

  const completedTasks = localTasks.filter(t => t.status === 'done').length
  const totalTasks = localTasks.length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gray-100 text-gray-800'
      case 'on_hold': return 'bg-gray-200 text-gray-700'
      case 'completed': return 'bg-gray-900 text-white'
      case 'archived': return 'bg-gray-300 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'to_do': return 'bg-gray-100 text-gray-800'
      case 'in_progress': return 'bg-gray-200 text-gray-700'
      case 'done': return 'bg-gray-900 text-white'
      case 'cancelled': return 'bg-gray-300 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-lg text-gray-900">{initiative.title}</CardTitle>
              <Badge className={getStatusColor(initiative.status)}>
                {initiative.status.replace('_', ' ')}
              </Badge>
            </div>
            {initiative.description && (
              <CardDescription className="text-gray-600">
                {initiative.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditInitiative(initiative)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteInitiative(initiative.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {totalTasks > 0 && (
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{completedTasks}</span> of <span className="font-medium">{totalTasks}</span> tasks completed
              </div>
              {totalTasks > 0 && (
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                  />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
              className="text-gray-700 hover:text-gray-800"
            >
              {showTasks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTasks ? 'Hide' : 'Show'} Tasks
            </Button>
          </div>
        )}
      </CardHeader>

      {showTasks && (
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-900">Tasks</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateTaskDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>

            {localTasks.length === 0 ? (
              <div className="text-center py-4 text-gray-600">
                No tasks yet. Add a task to get started.
              </div>
            ) : (
              <div className="space-y-2">
                {localTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={() => handleTaskStatusToggle(task.id, task.status)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.name}
                          </span>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </div>
                        )}
                        {task.notes && (
                          <div className="text-xs text-gray-600 mt-1">
                            {task.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task)
                          setShowEditTaskDialog(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Dialogs */}
          <CreateEngagementTaskDialog
            open={showCreateTaskDialog}
            onOpenChange={setShowCreateTaskDialog}
            onSuccess={onRefresh}
            initiativeId={initiative.id}
          />

          <EditEngagementTaskDialog
            open={showEditTaskDialog}
            onOpenChange={setShowEditTaskDialog}
            onSuccess={onRefresh}
            task={selectedTask}
          />
        </CardContent>
      )}
    </Card>
  )
}) 