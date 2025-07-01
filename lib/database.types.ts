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
          company: string | null
          contact_type: string
          created_at: string | null
          email: string | null
          first_name: string | null
          general_notes: string | null
          id: string
          is_in_cto_club: boolean | null
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          name: string | null
          additional_emails: string[] | null
        }
        Insert: {
          company?: string | null
          contact_type: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          general_notes?: string | null
          id?: string
          is_in_cto_club?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          name?: string | null
          additional_emails?: string[] | null
        }
        Update: {
          company?: string | null
          contact_type?: string
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          general_notes?: string | null
          id?: string
          is_in_cto_club?: boolean | null
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          name?: string | null
          additional_emails?: string[] | null
        }
        Relationships: []
      }
      event_invitations: {
        Row: {
          contact_id: string
          event_id: string
          follow_up_notes: string | null
          id: number
          invited_by_host_id: string | null
          is_new_connection: boolean | null
          status: string
        }
        Insert: {
          contact_id: string
          event_id: string
          follow_up_notes?: string | null
          id?: never
          invited_by_host_id?: string | null
          is_new_connection?: boolean | null
          status?: string
        }
        Update: {
          contact_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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

// Convenience type aliases for easier usage
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