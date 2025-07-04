export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          additional_emails: string[] | null
          area: Database["public"]["Enums"]["contact_area"] | null
          company: string | null
          contact_type: string | null
          created_at: string | null
          current_projects: string[] | null
          email: string | null
          first_name: string | null
          general_notes: string | null
          goals_aspirations: string[] | null
          id: string
          is_in_cto_club: boolean | null
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          name: string | null
          our_strategic_goals: string[] | null
        }
        Insert: {
          additional_emails?: string[] | null
          area?: Database["public"]["Enums"]["contact_area"] | null
          company?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_projects?: string[] | null
          email?: string | null
          first_name?: string | null
          general_notes?: string | null
          goals_aspirations?: string[] | null
          id?: string
          is_in_cto_club?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          name?: string | null
          our_strategic_goals?: string[] | null
        }
        Update: {
          additional_emails?: string[] | null
          area?: Database["public"]["Enums"]["contact_area"] | null
          company?: string | null
          contact_type?: string | null
          created_at?: string | null
          current_projects?: string[] | null
          email?: string | null
          first_name?: string | null
          general_notes?: string | null
          goals_aspirations?: string[] | null
          id?: string
          is_in_cto_club?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          name?: string | null
          our_strategic_goals?: string[] | null
        }
        Relationships: []
      }
      cto_club_pipeline: {
        Row: {
          contact_id: string
          created_at: string | null
          id: number
          last_action_date: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          status: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: never
          last_action_date?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: never
          last_action_date?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cto_club_pipeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      cto_club_potential_members: {
        Row: {
          added_date: string | null
          contact_id: string
          created_at: string | null
          id: number
          notes: string | null
        }
        Insert: {
          added_date?: string | null
          contact_id: string
          created_at?: string | null
          id?: never
          notes?: string | null
        }
        Update: {
          added_date?: string | null
          contact_id?: string
          created_at?: string | null
          id?: never
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cto_club_potential_members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          contact_id: string
          created_at: string | null
          event_id: string
          follow_up_notes: string | null
          id: number
          invited_by_host_id: string | null
          is_new_connection: boolean | null
          status: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          event_id: string
          follow_up_notes?: string | null
          id?: never
          invited_by_host_id?: string | null
          is_new_connection?: boolean | null
          status?: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          event_id?: string
          follow_up_notes?: string | null
          id?: never
          invited_by_host_id?: string | null
          is_new_connection?: boolean | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_invited_by_host_id_fkey"
            columns: ["invited_by_host_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_type: string
          id: string
          location: string | null
          max_attendees: number | null
          name: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          name: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string | null
          max_attendees?: number | null
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      relationship_pipeline: {
        Row: {
          contact_id: string
          id: number
          next_action_date: string | null
          next_action_description: string | null
          pipeline_stage: string
        }
        Insert: {
          contact_id: string
          id?: never
          next_action_date?: string | null
          next_action_description?: string | null
          pipeline_stage: string
        }
        Update: {
          contact_id?: string
          id?: never
          next_action_date?: string | null
          next_action_description?: string | null
          pipeline_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_pipeline_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: true
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_activities: {
        Row: {
          activity_date: string
          contact_id: string
          created_at: string
          id: string
          initiative_id: string | null
          notes: string | null
          summary: string
          type: Database["public"]["Enums"]["vip_activity_type"]
        }
        Insert: {
          activity_date?: string
          contact_id: string
          created_at?: string
          id?: string
          initiative_id?: string | null
          notes?: string | null
          summary: string
          type: Database["public"]["Enums"]["vip_activity_type"]
        }
        Update: {
          activity_date?: string
          contact_id?: string
          created_at?: string
          id?: string
          initiative_id?: string | null
          notes?: string | null
          summary?: string
          type?: Database["public"]["Enums"]["vip_activity_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vip_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_activities_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "vip_initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vip_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_initiatives: {
        Row: {
          contact_id: string
          created_at: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["vip_initiative_status"]
          title: string
          type: Database["public"]["Enums"]["vip_initiative_type"]
        }
        Insert: {
          contact_id: string
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["vip_initiative_status"]
          title: string
          type: Database["public"]["Enums"]["vip_initiative_type"]
        }
        Update: {
          contact_id?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["vip_initiative_status"]
          title?: string
          type?: Database["public"]["Enums"]["vip_initiative_type"]
        }
        Relationships: [
          {
            foreignKeyName: "vip_initiatives_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      vip_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      vip_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          id: string
          initiative_id: string
          name: string
          outcome_notes: string | null
          status: Database["public"]["Enums"]["vip_task_status"]
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          id?: string
          initiative_id: string
          name: string
          outcome_notes?: string | null
          status?: Database["public"]["Enums"]["vip_task_status"]
        }
        Update: {
          created_at?: string
          due_date?: string | null
          id?: string
          initiative_id?: string
          name?: string
          outcome_notes?: string | null
          status?: Database["public"]["Enums"]["vip_task_status"]
        }
        Relationships: [
          {
            foreignKeyName: "vip_tasks_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "vip_initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_area: "engineering" | "founders" | "product"
      vip_activity_type:
        | "meeting"
        | "call"
        | "email"
        | "event"
        | "info_share"
        | "future_touchpoint"
      vip_initiative_status: "active" | "on_hold" | "completed" | "archived"
      vip_initiative_type: "give" | "ask"
      vip_task_status: "to_do" | "in_progress" | "done" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// ========= TABLE TYPE EXPORTS =========
export type Contact = Tables<'contacts'>
export type Event = Tables<'events'>
export type EventInvitation = Tables<'event_invitations'>
export type RelationshipPipeline = Tables<'relationship_pipeline'>

export type ContactInsert = TablesInsert<'contacts'>
export type EventInsert = TablesInsert<'events'>
export type EventInvitationInsert = TablesInsert<'event_invitations'>
export type RelationshipPipelineInsert = TablesInsert<'relationship_pipeline'>

export type ContactUpdate = TablesUpdate<'contacts'>
export type EventUpdate = TablesUpdate<'events'>
export type EventInvitationUpdate = TablesUpdate<'event_invitations'>
export type RelationshipPipelineUpdate = TablesUpdate<'relationship_pipeline'>

// ========= VIP MANAGEMENT TYPES =========
export type VipTag = Tables<'vip_tags'>
export type VipContactTag = Tables<'vip_contact_tags'>
export type VipInitiative = Tables<'vip_initiatives'>
export type VipTask = Tables<'vip_tasks'>
export type VipActivity = Tables<'vip_activities'>

export type VipTagInsert = TablesInsert<'vip_tags'>
export type VipContactTagInsert = TablesInsert<'vip_contact_tags'>
export type VipInitiativeInsert = TablesInsert<'vip_initiatives'>
export type VipTaskInsert = TablesInsert<'vip_tasks'>
export type VipActivityInsert = TablesInsert<'vip_activities'>

export type VipTagUpdate = TablesUpdate<'vip_tags'>
export type VipContactTagUpdate = TablesUpdate<'vip_contact_tags'>
export type VipInitiativeUpdate = TablesUpdate<'vip_initiatives'>
export type VipTaskUpdate = TablesUpdate<'vip_tasks'>
export type VipActivityUpdate = TablesUpdate<'vip_activities'>

// ========= CTO CLUB TYPES =========
export type CtoClubPotentialMember = Tables<'cto_club_potential_members'>
export type CtoClubPipeline = Tables<'cto_club_pipeline'>

export type CtoClubPotentialMemberInsert = TablesInsert<'cto_club_potential_members'>
export type CtoClubPipelineInsert = TablesInsert<'cto_club_pipeline'>

export type CtoClubPotentialMemberUpdate = TablesUpdate<'cto_club_potential_members'>
export type CtoClubPipelineUpdate = TablesUpdate<'cto_club_pipeline'>

// ========= ENUM EXPORTS =========
export type ContactArea = Database['public']['Enums']['contact_area']

// VIP Management Enums
export type VipInitiativeType = Database['public']['Enums']['vip_initiative_type']
export type VipInitiativeStatus = Database['public']['Enums']['vip_initiative_status']
export type VipTaskStatus = Database['public']['Enums']['vip_task_status']
export type VipActivityType = Database['public']['Enums']['vip_activity_type']

// ========= INTERFACE EXPORTS =========
export interface VipStats {
  total_vips: number
  active_give_initiatives: number
  active_ask_initiatives: number
  total_activities: number
  recent_interactions: number
}

export interface CtoClubStats {
  current_members: number
  potential_members: number
  pipeline_items: number
  ready_for_next_step: number
} 