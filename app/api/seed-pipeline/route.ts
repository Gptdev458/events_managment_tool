import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { withDevOnlyAccess } from '@/lib/auth-middleware'

const samplePipelineData = [
  {
    contact_id: '', // Will be filled with actual contact IDs
    pipeline_stage: 'Identified',
    next_action_description: 'Send introductory email about CTO Club',
    next_action_date: '2024-12-28',
  },
  {
    contact_id: '', // Will be filled with actual contact IDs
    pipeline_stage: 'Warm Lead',
    next_action_description: 'Schedule coffee meeting to discuss partnership',
    next_action_date: '2024-12-30',
  },
]

async function handlePost(req: NextRequest) {
  try {
    // First, get some existing contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id')
      .limit(2)

    if (contactsError || !contacts || contacts.length < 2) {
      return NextResponse.json({ 
        error: 'Need at least 2 contacts in database. Create some contacts first.',
        contacts: contacts?.length || 0
      }, { status: 400 })
    }

    // Clear existing pipeline data
    await supabase.from('relationship_pipeline').delete().neq('id', 0)

    // Assign contact IDs to pipeline data
    const pipelineWithContactIds = samplePipelineData.map((item, index) => ({
      ...item,
      contact_id: contacts[index].id
    }))

    // Insert pipeline data
    const { data, error } = await supabase
      .from('relationship_pipeline')
      .insert(pipelineWithContactIds)
      .select()

    if (error) {
      console.error('Pipeline seed error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Pipeline seeded successfully', 
      data,
      count: data?.length || 0 
    })
  } catch (error) {
    console.error('Seed pipeline error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed pipeline data' 
    }, { status: 500 })
  }
}

export const POST = withDevOnlyAccess(handlePost) 