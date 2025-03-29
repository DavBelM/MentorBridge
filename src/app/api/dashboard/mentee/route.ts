import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    // Provide mock data for now to prevent API errors
    return NextResponse.json({
      stats: {
        pendingRequests: 0,
        activeConnections: 0,
        completedSessions: 0,
        upcomingSessions: 0
      },
      mentors: [],
      sessions: [],
      resources: []
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}