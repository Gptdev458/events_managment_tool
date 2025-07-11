import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Starting to clear BizDev data...')
    
    // Delete all tasks first (due to foreign key constraints)
    const { error: tasksError } = await supabase
      .from('tasks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (tasksError) {
      console.error('Error deleting tasks:', tasksError)
      return NextResponse.json({ 
        error: 'Failed to delete tasks', 
        details: tasksError 
      }, { status: 500 })
    }

    // Delete all projects
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (projectsError) {
      console.error('Error deleting projects:', projectsError)
      return NextResponse.json({ 
        error: 'Failed to delete projects', 
        details: projectsError 
      }, { status: 500 })
    }

    console.log('Successfully cleared all BizDev data')

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully cleared all BizDev data'
    })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to clear BizDev data' 
  })
} 