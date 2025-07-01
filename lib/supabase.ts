import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'
import { env } from './env'

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Re-export types for convenience
export type {
  Contact,
  Event,
  EventInvitation,
  RelationshipPipeline,
  ContactInsert,
  EventInsert,
  EventInvitationInsert,
  RelationshipPipelineInsert,
  ContactUpdate,
  EventUpdate,
  EventInvitationUpdate,
  RelationshipPipelineUpdate,
} from './database.types' 