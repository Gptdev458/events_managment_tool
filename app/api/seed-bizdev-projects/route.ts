import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const sampleProjects = [
  // BizDev Overview Projects (is_ian_collaboration = false)
  {
    name: 'Apollo',
    description: 'High revenue potential client with strong strategic fit',
    status: 'active',
    priority: 'medium',
    is_ian_collaboration: false,
    detailed_ratings_data: {
      revenuePotential: { value: 5, weight: 0.2 },
      insiderSupport: { value: 4, weight: 0.15 },
      strategicFitEvolve: { value: 5, weight: 0.2 },
      strategicFitVerticals: { value: 4, weight: 0.1 },
      clarityClient: { value: 4, weight: 0.1 },
      clarityUs: { value: 5, weight: 0.1 },
      effortPotentialClient: { value: 4, weight: 0.1 },
      effortExistingClient: { value: 4, weight: 0.05 },
      timingPotentialClient: { value: 4, weight: 0.05 },
      runway: 12
    }
  },
  {
    name: 'ASC',
    description: 'Strong across all business metrics',
    status: 'active',
    priority: 'medium',
    is_ian_collaboration: false,
    detailed_ratings_data: {
      revenuePotential: { value: 4, weight: 0.2 },
      insiderSupport: { value: 4, weight: 0.15 },
      strategicFitEvolve: { value: 4, weight: 0.2 },
      strategicFitVerticals: { value: 4, weight: 0.1 },
      clarityClient: { value: 4, weight: 0.1 },
      clarityUs: { value: 4, weight: 0.1 },
      effortPotentialClient: { value: 4, weight: 0.1 },
      effortExistingClient: { value: 4, weight: 0.05 },
      timingPotentialClient: { value: 4, weight: 0.05 },
      runway: 10
    }
  },
  {
    name: 'WEX',
    description: 'High strategic potential opportunity',
    status: 'active',
    priority: 'high',
    is_ian_collaboration: false,
    detailed_ratings_data: {
      revenuePotential: { value: 4, weight: 0.2 },
      insiderSupport: { value: 3, weight: 0.15 },
      strategicFitEvolve: { value: 4, weight: 0.2 },
      strategicFitVerticals: { value: 3, weight: 0.1 },
      clarityClient: { value: 3, weight: 0.1 },
      clarityUs: { value: 4, weight: 0.1 },
      effortPotentialClient: { value: 3, weight: 0.1 },
      effortExistingClient: { value: 3, weight: 0.05 },
      timingPotentialClient: { value: 4, weight: 0.05 },
      runway: 8
    }
  },
  {
    name: 'Built',
    description: 'Promising potential client',
    status: 'potential',
    priority: 'medium',
    is_ian_collaboration: false,
    detailed_ratings_data: {
      revenuePotential: { value: 4, weight: 0.2 },
      insiderSupport: { value: 4, weight: 0.15 },
      strategicFitEvolve: { value: 4, weight: 0.2 },
      strategicFitVerticals: { value: 3, weight: 0.1 },
      clarityClient: { value: 4, weight: 0.1 },
      clarityUs: { value: 4, weight: 0.1 },
      effortPotentialClient: { value: 4, weight: 0.1 },
      effortExistingClient: { value: 4, weight: 0.05 },
      timingPotentialClient: { value: 3, weight: 0.05 },
      runway: 6
    }
  },
  // Ian Collaboration Projects (is_ian_collaboration = true)
  {
    name: 'CTO Club',
    description: 'Strategic CTO community initiative',
    status: 'potential',
    priority: 'high',
    is_ian_collaboration: true,
    detailed_ratings_data: {
      revenuePotential: { value: 3, weight: 0.2 },
      insiderSupport: { value: 3, weight: 0.15 },
      strategicFitEvolve: { value: 3, weight: 0.2 },
      strategicFitVerticals: { value: 3, weight: 0.1 },
      clarityClient: { value: 3, weight: 0.1 },
      clarityUs: { value: 3, weight: 0.1 },
      effortPotentialClient: { value: 3, weight: 0.1 },
      effortExistingClient: { value: 3, weight: 0.05 },
      timingPotentialClient: { value: 3, weight: 0.05 },
      runway: 12
    }
  },
  {
    name: 'Events and Partnerships',
    description: 'Industry events and strategic partnerships',
    status: 'active',
    priority: 'medium',
    is_ian_collaboration: true,
    detailed_ratings_data: {
      revenuePotential: { value: 3, weight: 0.2 },
      insiderSupport: { value: 4, weight: 0.15 },
      strategicFitEvolve: { value: 4, weight: 0.2 },
      strategicFitVerticals: { value: 3, weight: 0.1 },
      clarityClient: { value: 4, weight: 0.1 },
      clarityUs: { value: 4, weight: 0.1 },
      effortPotentialClient: { value: 3, weight: 0.1 },
      effortExistingClient: { value: 3, weight: 0.05 },
      timingPotentialClient: { value: 4, weight: 0.05 },
      runway: 9
    }
  }
]

export async function POST() {
  try {
    console.log('Starting to seed BizDev projects...')
    
    // Insert projects
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert(sampleProjects)
      .select()

    if (projectError) {
      console.error('Error inserting projects:', projectError)
      return NextResponse.json({ 
        error: 'Failed to insert projects', 
        details: projectError 
      }, { status: 500 })
    }

    console.log(`Successfully inserted ${projects?.length || 0} projects`)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${projects?.length || 0} BizDev projects`,
      projects: projects 
    })
  } catch (error) {
    console.error('Error seeding projects:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to seed BizDev projects' 
  })
} 