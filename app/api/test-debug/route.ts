import { NextRequest, NextResponse } from 'next/server'
import { getContacts, getRelationshipPipeline } from '@/lib/actions'
import { ContactBusinessLogic } from '@/lib/business-logic'

export async function GET(request: NextRequest) {
  try {
    const [contactsResult, pipelineResult] = await Promise.all([
      getContacts(),
      getRelationshipPipeline()
    ])

    const contacts = contactsResult.data || []
    const pipeline = pipelineResult.data || []
    
    // Get contacts not in pipeline
    const contactsInPipeline = new Set(pipeline.map(p => p.contact_id))
    const availableContacts = contacts.filter(contact => !contactsInPipeline.has(contact.id))

    return NextResponse.json({
      debug: {
        totalContacts: contacts.length,
        contactsInPipeline: pipeline.length,
        availableContacts: availableContacts.length,
        contacts: contacts.map(c => ({
          id: c.id,
          name: ContactBusinessLogic.getDisplayName(c),
          company: c.company,
          job_title: c.job_title,
          contact_type: c.contact_type
        })),
        pipeline: pipeline.map(p => ({
          id: p.id,
          contact_id: p.contact_id,
          stage: p.pipeline_stage
        })),
        availableContactsList: availableContacts.map(c => ({
          id: c.id,
          name: ContactBusinessLogic.getDisplayName(c),
          company: c.company,
          job_title: c.job_title
        }))
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 