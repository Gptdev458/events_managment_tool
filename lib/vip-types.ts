// VIP Management TypeScript Types
// Based on the database schema for strategic relationship management

export type VipInitiativeType = 'give' | 'ask'
export type VipInitiativeStatus = 'active' | 'on_hold' | 'completed' | 'archived'
export type VipTaskStatus = 'to_do' | 'in_progress' | 'done' | 'cancelled'
export type VipActivityType = 'meeting' | 'call' | 'email' | 'event' | 'info_share' | 'future_touchpoint'

export interface VipTag {
  id: string
  created_at: string
  name: string
}

export interface VipContactTag {
  contact_id: string
  tag_id: string
  tag?: VipTag // For joined queries
}

export interface VipInitiative {
  id: string
  created_at: string
  contact_id: string
  title: string
  description: string | null
  type: VipInitiativeType
  status: VipInitiativeStatus
  tasks?: VipTask[] // For joined queries
}

export interface VipTask {
  id: string
  created_at: string
  initiative_id: string
  name: string
  status: VipTaskStatus
  due_date: string | null
  outcome_notes: string | null
  initiative?: VipInitiative // For joined queries
}

export interface VipActivity {
  id: string
  created_at: string
  contact_id: string
  initiative_id: string | null
  activity_date: string
  type: VipActivityType
  summary: string
  notes: string | null
  initiative?: VipInitiative // For joined queries
}

// Extended contact type for VIP management
export interface VipContact {
  id: string
  created_at: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  company: string | null
  job_title: string | null
  linkedin_url: string | null
  contact_type: string
  is_in_cto_club: boolean | null
  general_notes: string | null
  name: string | null
  additional_emails: string[] | null
  
  // VIP-specific fields (populated via joins)
  vip_tags?: VipTag[]
  vip_initiatives?: VipInitiative[]
  vip_activities?: VipActivity[]
  
  // Profile fields (stored in general_notes or separate fields)
  relationship_summary?: string
  current_projects?: string[]
  goals_aspirations?: string[]
  our_goals?: string[]
}

// Dashboard widget data
export interface VipDashboardData {
  contact: VipContact
  active_give_initiatives: VipInitiative[]
  active_ask_initiatives: VipInitiative[]
  upcoming_activities: VipActivity[]
  last_interaction_date: string | null
}

// Form data types
export interface CreateVipInitiativeData {
  contact_id: string
  title: string
  description?: string
  type: VipInitiativeType
  status?: VipInitiativeStatus
}

export interface CreateVipTaskData {
  initiative_id: string
  name: string
  status?: VipTaskStatus
  due_date?: string
  outcome_notes?: string
}

export interface CreateVipActivityData {
  contact_id: string
  initiative_id?: string
  activity_date?: string
  type: VipActivityType
  summary: string
  notes?: string
}

export interface CreateVipTagData {
  name: string
}

// Filter and search types
export interface VipFilters {
  status?: VipInitiativeStatus[]
  type?: VipInitiativeType[]
  tags?: string[]
  search?: string
}

// Statistics types
export interface VipStats {
  total_vips: number
  active_give_initiatives: number
  active_ask_initiatives: number
  total_activities: number
  recent_interactions: number
} 