import { 
  Project, 
  Task, 
  ProjectInsert, 
  TaskInsert, 
  ProjectUpdate, 
  TaskUpdate,
  ProjectPriority,
  ProjectStatus,
  TaskStatus,
  DetailedRatingsData,
  ProjectWithRatings,
  TaskWithSubtasks,
  ProjectWithTasks,
  BizDevStats,
  KanbanBoardData
} from './database.types'

// Re-export core types for convenience
export type {
  Project,
  Task,
  ProjectInsert,
  TaskInsert,
  ProjectUpdate,
  TaskUpdate,
  ProjectPriority,
  ProjectStatus,
  TaskStatus,
  DetailedRatingsData,
  ProjectWithRatings,
  TaskWithSubtasks,
  ProjectWithTasks,
  BizDevStats,
  KanbanBoardData
}

// BizDev specific business logic types
export interface ProjectFilters {
  status?: ProjectStatus[]
  priority?: ProjectPriority[]
  isIanCollaboration?: boolean
  hasRating?: boolean
  search?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  completed?: boolean
  hasParent?: boolean
  projectId?: string
  search?: string
}

export interface ProjectFormData {
  name: string
  description?: string
  priority?: ProjectPriority
  status?: ProjectStatus
  is_ian_collaboration?: boolean
  detailed_ratings_data?: Partial<DetailedRatingsData>
}

export interface TaskFormData {
  text: string
  status?: TaskStatus
  completed?: boolean
  parent_task_id?: string | null
  order?: number
}

// Rating calculation types
export interface RatingCalculationResult {
  weighted_score: number
  total_possible: number
  percentage: number
  breakdown: {
    [key: string]: {
      score: number
      weight: number
      contribution: number
    }
  }
}

// View modes for the BizDev interface
export type BizDevViewMode = 'overview' | 'ian-collaboration'

// Kanban card data with additional context
export interface KanbanCard extends TaskWithSubtasks {
  project: Pick<Project, 'id' | 'name' | 'priority' | 'is_ian_collaboration'>
  subtask_count?: number
  completed_subtasks?: number
}

// Project summary for overview displays
export interface ProjectSummary {
  id: string
  name: string
  status: ProjectStatus
  priority: ProjectPriority
  is_ian_collaboration: boolean
  rating: number | null
  task_count: number
  completed_tasks: number
  created_at: string
}

// Dashboard stats with additional context
export interface BizDevDashboardStats extends BizDevStats {
  recent_activity: {
    new_projects_this_week: number
    completed_tasks_this_week: number
    updated_projects_this_week: number
  }
  priorities: {
    high: number
    medium: number
    low: number
  }
  collaboration_split: {
    ian_projects: number
    other_projects: number
  }
}

// Sort options for projects and tasks
export type ProjectSortField = 'name' | 'created_at' | 'rating' | 'priority' | 'status'
export type TaskSortField = 'text' | 'created_at' | 'status' | 'order'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig<T extends string> {
  field: T
  direction: SortDirection
}

// Action types for optimistic updates
export type ProjectAction = 
  | { type: 'CREATE'; payload: Project }
  | { type: 'UPDATE'; payload: { id: string; updates: Partial<Project> } }
  | { type: 'DELETE'; payload: { id: string } }

export type TaskAction = 
  | { type: 'CREATE'; payload: Task }
  | { type: 'UPDATE'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE'; payload: { id: string } }
  | { type: 'MOVE'; payload: { id: string; status: TaskStatus; order?: number } }

// Constants for the BizDev module
export const BIZDEV_CONSTANTS = {
  DEFAULT_PROJECT_STATUS: 'potential' as ProjectStatus,
  DEFAULT_TASK_STATUS: 'todo' as TaskStatus,
  DEFAULT_PROJECT_PRIORITY: 'medium' as ProjectPriority,
  
  RATING_METRICS: {
    revenuePotential: { label: 'Revenue Potential', maxWeight: 0.3 },
    insiderSupport: { label: 'Insider Support', maxWeight: 0.2 },
    strategicFitEvolve: { label: 'Strategic Fit (Evolve)', maxWeight: 0.15 },
    strategicFitVerticals: { label: 'Strategic Fit (Verticals)', maxWeight: 0.1 },
    clarityClient: { label: 'Clarity (Client)', maxWeight: 0.05 },
    clarityUs: { label: 'Clarity (Us)', maxWeight: 0.05 },
    effortPotentialClient: { label: 'Effort (Potential Client)', maxWeight: 0.05 },
    effortExistingClient: { label: 'Effort (Existing Client)', maxWeight: 0.0 },
    timingPotentialClient: { label: 'Timing (Potential Client)', maxWeight: 0.1 },
  },
  
  KANBAN_COLUMNS: [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100' },
    { id: 'doing', label: 'Doing', color: 'bg-blue-100' },
    { id: 'waiting', label: 'Waiting', color: 'bg-yellow-100' },
    { id: 'done', label: 'Done', color: 'bg-green-100' },
  ] as const,
  
  PROJECT_PRIORITY_COLORS: {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  } as const,
  
  PROJECT_STATUS_COLORS: {
    potential: 'bg-purple-100 text-purple-800',
    active: 'bg-blue-100 text-blue-800',
    'on-hold': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    archived: 'bg-gray-100 text-gray-800',
  } as const,
} as const

// Helper type for extracting constant values
export type KanbanColumnId = typeof BIZDEV_CONSTANTS.KANBAN_COLUMNS[number]['id'] 