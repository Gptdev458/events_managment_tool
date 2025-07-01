import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple API key authentication for internal API routes
 * In production, this should be replaced with proper authentication
 */
export function withAuth(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Check for API key in header or query parameter
    const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('api_key')
    
    // For now, we'll use a simple check - in production this should be more secure
    if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized - Valid API key required' },
        { status: 401 }
      )
    }

    return handler(req)
  }
}

/**
 * Environment-based authentication check
 * Only allows seeding in development
 */
export function withDevOnlyAccess(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding endpoints are disabled in production' },
        { status: 403 }
      )
    }

    return handler(req)
  }
} 