import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting data cleanup...')

    // Fix 1: Reset all auto-assigned areas to null for manual assignment
    const { error: areaResetError, count: areaResetCount } = await supabase
      .from('contacts')
      .update({ area: null })
      .not('area', 'is', null)

    if (areaResetError) {
      console.error('Area reset error:', areaResetError)
      return NextResponse.json({ error: 'Failed to reset area assignments' }, { status: 500 })
    }

    // Fix 2: Clean up future dates
    const { error: dateFixError, count: dateFixCount } = await supabase
      .from('contacts')
      .update({ created_at: new Date().toISOString() })
      .gt('created_at', new Date().toISOString())

    if (dateFixError) {
      console.error('Date fix error:', dateFixError)
      return NextResponse.json({ error: 'Failed to fix future dates' }, { status: 500 })
    }

    // Get verification data
    const { data: verificationData, error: verifyError } = await supabase
      .from('contacts')
      .select('name, job_title, area, contact_type, is_in_cto_club, created_at')
      .eq('is_in_cto_club', true)

    if (verifyError) {
      console.error('Verification error:', verifyError)
    }

    return NextResponse.json({
      message: 'Data cleanup completed successfully',
      changes: {
        areasReset: areaResetCount || 0,
        datesFixed: dateFixCount || 0,
      },
      note: 'All areas are now unassigned and must be set manually for accuracy',
      ctoClubMembers: verificationData || []
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({
      error: 'Failed to clean up data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 