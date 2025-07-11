import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Direct Supabase connection for import script
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://imvclloqzzpiukhtozav.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltdmNsbG9xenppuXVraHRvenl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMzOTQ0NzcsImV4cCI6MjA0ODk3MDQ3N30.mVDnN0TDzfG8JvbfG2O8rFH7vH4z-PGzAqX0EjIgK34'
)

// Function to transform old rating data to new format
function transformRatingData(oldRatings: any) {
  if (!oldRatings || typeof oldRatings !== 'object') {
    return null
  }

  // Map old rating structure to new structure
  const newFormat = {
    revenuePotential: {
      value: oldRatings.revenue_potential || 3,
      weight: 0.2 // Default weight
    },
    insiderSupport: {
      value: oldRatings.insider_support || 3,
      weight: 0.15
    },
    strategicFitEvolve: {
      value: oldRatings.strategic_fit || 3,
      weight: 0.2
    },
    strategicFitVerticals: {
      value: oldRatings.strategic_fit || 3,
      weight: 0.1
    },
    clarityClient: {
      value: oldRatings.stability_clarity || 3,
      weight: 0.1
    },
    clarityUs: {
      value: oldRatings.stability_clarity || 3,
      weight: 0.1
    },
    effortPotentialClient: {
      value: oldRatings.effort || 3,
      weight: 0.05
    },
    effortExistingClient: {
      value: oldRatings.effort || 3,
      weight: 0.05
    },
    timingPotentialClient: {
      value: oldRatings.timing || 3,
      weight: 0.05
    },
    runway: 12 // Default runway months
  }

  return newFormat
}

// Function to map old task status to new format
function mapTaskStatus(oldStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'todo': 'to-do',
    'doing': 'doing',
    'waiting': 'waiting-feedback',
    'done': 'done'
  }
  return statusMap[oldStatus] || 'to-do'
}

async function importBizDevData() {
  try {
    console.log('🔄 Starting BizDev data import...')

    // Read the backup file
    const backupPath = path.join(process.cwd(), 'database-backups', 'COMPLETE-bizdev-data-backup.json')
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))

    console.log(`📊 Found ${backupData.projects.length} projects and ${backupData.tasks.length} tasks`)

    // Import projects
    console.log('📁 Importing projects...')
    for (const project of backupData.projects) {
      const transformedProject = {
        id: project.id,
        name: project.name,
        description: project.description || '',
        priority: project.priority,
        status: project.status,
        is_ian_collaboration: project.is_ian_collaboration,
        rating: parseFloat(project.rating) || null,
        detailed_ratings_data: transformRatingData(project.detailed_ratings_data),
        created_at: project.created_at
      }

      const { error } = await supabase
        .from('projects')
        .upsert(transformedProject, { onConflict: 'id' })

      if (error) {
        console.error(`❌ Error importing project ${project.name}:`, error)
      } else {
        console.log(`✅ Imported project: ${project.name}`)
      }
    }

    // Import tasks
    console.log('📋 Importing tasks...')
    for (const task of backupData.tasks) {
      const transformedTask = {
        id: task.id,
        project_id: task.project_id,
        text: task.text,
        status: mapTaskStatus(task.status),
        completed: task.completed,
        parent_task_id: task.parent_task_id,
        order: task.order,
        created_at: task.created_at
      }

      const { error } = await supabase
        .from('tasks')
        .upsert(transformedTask, { onConflict: 'id' })

      if (error) {
        console.error(`❌ Error importing task ${task.text}:`, error)
      } else {
        console.log(`✅ Imported task: ${task.text}`)
      }
    }

    console.log('🎉 BizDev data import completed successfully!')

  } catch (error) {
    console.error('💥 Error during import:', error)
    process.exit(1)
  }
}

// Run the import
importBizDevData() 