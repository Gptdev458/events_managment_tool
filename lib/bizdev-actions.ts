'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { supabase } from './supabase'
import { extractFormData, extractBoolean, extractNullableString, validateData } from './validation'
import { logger } from './logger'
import { calculateProjectRating } from './rating-utils'
import type { 
  ProjectInsert, 
  ProjectUpdate, 
  TaskInsert, 
  TaskUpdate,
  Project,
  Task,
  ProjectPriority,
  ProjectStatus,
  TaskStatus,
  DetailedRatingsData
} from './database.types'
import type { 
  ProjectWithTasks, 
  TaskWithSubtasks, 
  BizDevStats, 
  KanbanBoardData,
  ProjectFilters,
  TaskFilters
} from './bizdev-types'
import { BIZDEV_CONSTANTS } from './bizdev-types'

// Validation schemas
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  status: z.enum(['potential', 'active', 'on-hold', 'completed', 'archived']).optional(),
  is_ian_collaboration: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
})

const taskSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  text: z.string().min(1, 'Task text is required'),
  status: z.enum(['todo', 'doing', 'waiting', 'done']).optional(),
  completed: z.boolean().optional(),
  parent_task_id: z.string().uuid().optional(),
  order: z.number().optional(),
})

// Helper function to extract form data safely
function extractFormDataSafely(formData: FormData, key: string): string | null {
  const value = formData.get(key)
  if (typeof value === 'string') return value
  return null
}

// Enhanced rating validation function
function validateRatingData(detailedRatings: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!detailedRatings || typeof detailedRatings !== 'object') {
    errors.push('Rating data must be an object')
    return { valid: false, errors }
  }
  
  // Check if runway is a valid number
  if (typeof detailedRatings.runway !== 'number' || detailedRatings.runway < 0) {
    errors.push('Runway must be a positive number')
  }
  
  // Validate each rating metric
  const requiredMetrics = Object.keys(BIZDEV_CONSTANTS.RATING_METRICS)
  const totalWeight = Object.values(BIZDEV_CONSTANTS.RATING_METRICS).reduce((sum, metric) => sum + metric.maxWeight, 0)
  
  for (const metricKey of requiredMetrics) {
    const metric = detailedRatings[metricKey]
    const metricInfo = BIZDEV_CONSTANTS.RATING_METRICS[metricKey as keyof typeof BIZDEV_CONSTANTS.RATING_METRICS]
    
    if (!metric || typeof metric !== 'object') {
      errors.push(`Missing or invalid ${metricInfo.label} metric`)
      continue
    }
    
    if (typeof metric.value !== 'number' || metric.value < 0 || metric.value > 5) {
      errors.push(`${metricInfo.label} score must be between 0 and 5`)
    }
    
    if (typeof metric.weight !== 'number' || metric.weight < 0 || metric.weight > metricInfo.maxWeight) {
      errors.push(`${metricInfo.label} weight must be between 0 and ${metricInfo.maxWeight}`)
    }
  }
  
  return { valid: errors.length === 0, errors }
}

// Project Actions
export async function createProject(formData: FormData) {
  try {
    const rawData = {
      name: extractFormData(formData, 'name'),
      description: extractFormData(formData, 'description'),
      priority: extractNullableString(formData, 'priority') as ProjectPriority,
      status: extractNullableString(formData, 'status') as ProjectStatus,
      is_ian_collaboration: extractBoolean(formData, 'is_ian_collaboration'),
    }

    const validation = validateData(projectSchema, rawData)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const validatedData = validation.data

    const { data, error } = await supabase
      .from('projects')
      .insert(validatedData as ProjectInsert)
      .select()
      .single()

    if (error) {
      logger.databaseError('create project', new Error(error.message), { rawData })
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('createProject', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    }
  }
}

export async function updateProject(id: string, formData: FormData) {
  try {
    const rawData = {
      name: extractFormData(formData, 'name'),
      description: extractFormData(formData, 'description'),
      priority: extractNullableString(formData, 'priority') as ProjectPriority,
      status: extractNullableString(formData, 'status') as ProjectStatus,
      is_ian_collaboration: extractBoolean(formData, 'is_ian_collaboration'),
    }

    const validatedData = projectSchema.parse(rawData)

    const { data, error } = await supabase
      .from('projects')
      .update(validatedData as ProjectUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update project error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateProject', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    }
  }
}

export async function updateProjectRating(id: string, detailedRatings: DetailedRatingsData) {
  try {
    const calculatedRating = calculateProjectRating(detailedRatings)
    const overallRating = (calculatedRating.percentage / 100) * 5 // Convert to 0-5 scale

    const { data, error } = await supabase
      .from('projects')
      .update({
        detailed_ratings_data: detailedRatings as any,
        rating: overallRating
      } as ProjectUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data, calculation: calculatedRating }
  } catch (error) {
    logger.serverActionError('updateProjectRating', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project rating' 
    }
  }
}

export async function deleteProject(id: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteProject', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    }
  }
}

// Inline Update Actions
export async function updateProjectStatus(id: string, status: ProjectStatus) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status } as ProjectUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateProjectStatus', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project status' 
    }
  }
}

export async function updateProjectPriority(id: string, priority: ProjectPriority) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ priority } as ProjectUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateProjectPriority', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project priority' 
    }
  }
}

// Task Actions
export async function createTask(formData: FormData) {
  try {
    const rawData = {
      project_id: extractFormData(formData, 'project_id'),
      text: extractFormData(formData, 'text'),
      status: extractNullableString(formData, 'status') as TaskStatus,
      completed: extractBoolean(formData, 'completed'),
      parent_task_id: extractNullableString(formData, 'parent_task_id'),
      order: extractFormData(formData, 'order') ? parseInt(extractFormData(formData, 'order')!) : undefined,
    }

    const validation = validateData(taskSchema, rawData)
    if (!validation.success) {
      return { success: false, error: validation.error }
    }
    
    const validatedData = validation.data

    const { data, error } = await supabase
      .from('tasks')
      .insert(validatedData as TaskInsert)
      .select()
      .single()

    if (error) {
      logger.databaseError('create task', new Error(error.message), { rawData })
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('createTask', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create task' 
    }
  }
}

export async function updateTask(id: string, formData: FormData) {
  try {
    const rawData = {
      text: extractFormData(formData, 'text'),
      status: extractNullableString(formData, 'status') as TaskStatus,
      completed: extractBoolean(formData, 'completed'),
      parent_task_id: extractNullableString(formData, 'parent_task_id'),
      order: extractFormData(formData, 'order') ? parseInt(extractFormData(formData, 'order')!) : undefined,
    }

    const validatedData = taskSchema.partial().parse(rawData)

    const { data, error } = await supabase
      .from('tasks')
      .update(validatedData as TaskUpdate)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update task error:', error)
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateTask', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task' 
    }
  }
}

export async function updateTaskStatus(id: string, status: TaskStatus, completed?: boolean) {
  try {
    const updateData: Partial<TaskUpdate> = { 
      status,
      completed: completed !== undefined ? completed : status === 'done'
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('updateTaskStatus', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update task status' 
    }
  }
}

export async function deleteTask(id: string) {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true }
  } catch (error) {
    logger.serverActionError('deleteTask', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete task' 
    }
  }
}

// Data Fetching Functions
export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
  try {
    let query = supabase.from('projects').select('*')

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }

    if (filters?.isIanCollaboration !== undefined) {
      query = query.eq('is_ian_collaboration', filters.isIanCollaboration)
    }

    if (filters?.hasRating !== undefined) {
      if (filters.hasRating) {
        query = query.not('rating', 'is', null)
      } else {
        query = query.is('rating', null)
      }
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    logger.serverActionError('getProjects', error instanceof Error ? error : new Error('Unknown error'))
    return []
  }
}

export async function getProjectWithTasks(projectId: string): Promise<ProjectWithTasks | null> {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError) {
      throw new Error(projectError.message)
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    if (tasksError) {
      throw new Error(tasksError.message)
    }

    // Organize tasks with subtasks
    const tasksWithSubtasks = tasks?.map(task => ({
      ...task,
      subtasks: tasks?.filter(t => t.parent_task_id === task.id) || []
    })) || []

    // Only include top-level tasks (no parent)
    const topLevelTasks = tasksWithSubtasks.filter(task => !task.parent_task_id)

    return {
      ...project,
      detailed_ratings_data: project.detailed_ratings_data as DetailedRatingsData | null,
      tasks: topLevelTasks
    }
  } catch (error) {
    logger.serverActionError('getProjectWithTasks', error instanceof Error ? error : new Error('Unknown error'))
    return null
  }
}

export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  try {
    let query = supabase.from('tasks').select('*')

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters?.completed !== undefined) {
      query = query.eq('completed', filters.completed)
    }

    if (filters?.hasParent !== undefined) {
      if (filters.hasParent) {
        query = query.not('parent_task_id', 'is', null)
      } else {
        query = query.is('parent_task_id', null)
      }
    }

    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId)
    }

    if (filters?.search) {
      query = query.ilike('text', `%${filters.search}%`)
    }

    query = query.order('order', { ascending: true })

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return data || []
  } catch (error) {
    logger.serverActionError('getTasks', error instanceof Error ? error : new Error('Unknown error'))
    return []
  }
}

export async function getKanbanBoardData(): Promise<KanbanBoardData> {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          priority,
          is_ian_collaboration
        )
      `)
      .order('order', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const kanbanData: KanbanBoardData = {
      todo: [],
      doing: [],
      waiting: [],
      done: []
    }

    tasks?.forEach(task => {
      const taskWithSubtasks: TaskWithSubtasks = {
        ...task,
        subtasks: tasks.filter(t => t.parent_task_id === task.id)
      }

      // Only include top-level tasks in kanban
      if (!task.parent_task_id) {
        const status = task.status as keyof KanbanBoardData
        if (status in kanbanData) {
          kanbanData[status].push(taskWithSubtasks)
        }
      }
    })

    return kanbanData
  } catch (error) {
    logger.serverActionError('getKanbanBoardData', error instanceof Error ? error : new Error('Unknown error'))
    return { todo: [], doing: [], waiting: [], done: [] }
  }
}

export async function getProjectKanbanData(projectId: string): Promise<KanbanBoardData> {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        projects:project_id (
          id,
          name,
          priority,
          is_ian_collaboration
        )
      `)
      .eq('project_id', projectId)
      .order('order', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const kanbanData: KanbanBoardData = {
      todo: [],
      doing: [],
      waiting: [],
      done: []
    }

    tasks?.forEach(task => {
      const taskWithSubtasks: TaskWithSubtasks = {
        ...task,
        subtasks: tasks.filter(t => t.parent_task_id === task.id)
      }

      // Only include top-level tasks in kanban
      if (!task.parent_task_id) {
        const status = task.status as keyof KanbanBoardData
        if (status in kanbanData) {
          kanbanData[status].push(taskWithSubtasks)
        }
      }
    })

    return kanbanData
  } catch (error) {
    logger.serverActionError('getProjectKanbanData', error instanceof Error ? error : new Error('Unknown error'))
    return { todo: [], doing: [], waiting: [], done: [] }
  }
}

export async function getBizDevStats(): Promise<BizDevStats> {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('status, priority, is_ian_collaboration')

    if (projectsError) {
      throw new Error(projectsError.message)
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('completed')

    if (tasksError) {
      throw new Error(tasksError.message)
    }

    const stats: BizDevStats = {
      total_projects: projects?.length || 0,
      active_projects: projects?.filter(p => p.status === 'active').length || 0,
      ian_collaboration_projects: projects?.filter(p => p.is_ian_collaboration).length || 0,
      completed_projects: projects?.filter(p => p.status === 'completed').length || 0,
      total_tasks: tasks?.length || 0,
      completed_tasks: tasks?.filter(t => t.completed).length || 0,
      high_priority_projects: projects?.filter(p => p.priority === 'high').length || 0,
    }

    return stats
  } catch (error) {
    logger.serverActionError('getBizDevStats', error instanceof Error ? error : new Error('Unknown error'))
    return {
      total_projects: 0,
      active_projects: 0,
      ian_collaboration_projects: 0,
      completed_projects: 0,
      total_tasks: 0,
      completed_tasks: 0,
      high_priority_projects: 0,
    }
  }
}

// Bulk Operations
export async function bulkUpdateProjectStatus(projectIds: string[], status: ProjectStatus) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({ status })
      .in('id', projectIds)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('bulkUpdateProjectStatus', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update projects' 
    }
  }
}

export async function bulkUpdateTaskStatus(taskIds: string[], status: TaskStatus) {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        status, 
        completed: status === 'done' 
      })
      .in('id', taskIds)
      .select()

    if (error) {
      throw new Error(error.message)
    }

    revalidatePath('/bizdev')
    return { success: true, data }
  } catch (error) {
    logger.serverActionError('bulkUpdateTaskStatus', error instanceof Error ? error : new Error('Unknown error'))
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update tasks' 
    }
  }
} 