"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { StatsCard } from "@/app/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarClock, UserCheck, Star, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Types for dashboard data
interface MentorStats {
  totalMentees: number
  totalSessions: number
  averageRating: number
  upcomingSessionsCount: number
}

interface Mentee {
  id: number
  fullname: string
  profile: {
    profilePicture: string | null
    bio: string | null
  }
}

interface Session {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  menteeId: number
  mentee: {
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MentorStats | null>(null)
  const [recentMentees, setRecentMentees] = useState<Mentee[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        
        // Fetch mentor stats
        const dashboardData = await get<{
          stats: MentorStats
          recentMentees: Mentee[]
          upcomingSessions: Session[]
        }>('/api/dashboard/mentor')
        
        setStats(dashboardData.stats)
        setRecentMentees(dashboardData.recentMentees)
        setUpcomingSessions(dashboardData.upcomingSessions)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Return default/fallback data
        return {
          stats: { totalMentees: 0, totalSessions: 0, averageRating: 0, upcomingSessionsCount: 0 },
          recentMentees: [],
          upcomingSessions: []
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  // Format date for display
  const formatSessionTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.fullname}</h1>
        <p className="text-muted-foreground">Here's an overview of your mentor activities.</p>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24 mt-1" />
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <StatsCard 
              title="Total Mentees" 
              value={stats?.totalMentees || 0} 
              description="Active mentoring relationships"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatsCard 
              title="Sessions Completed" 
              value={stats?.totalSessions || 0}
              description="Total mentoring sessions"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatsCard 
              title="Average Rating" 
              value={stats?.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'N/A'}
              description="Based on mentee feedback"
              icon={<Star className="h-4 w-4" />}
            />
            <StatsCard 
              title="Upcoming Sessions" 
              value={stats?.upcomingSessionsCount || 0}
              description="Sessions in the next 7 days"
              icon={<Clock className="h-4 w-4" />}
            />
          </>
        )}
      </div>
      
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Mentees */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Mentees</CardTitle>
            <CardDescription>Your most recently connected mentees</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMentees.length > 0 ? (
              <div className="space-y-4">
                {recentMentees.map(mentee => (
                  <div key={mentee.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={mentee.profile?.profilePicture || ''} />
                      <AvatarFallback>{mentee.fullname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentee.fullname}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {mentee.profile?.bio || 'No bio provided'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                You don't have any mentees yet.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/mentees">View All Mentees</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled mentoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="border rounded-md p-3">
                    <p className="font-medium">{session.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.mentee.profile?.profilePicture || ''} />
                        <AvatarFallback>{session.mentee.fullname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{session.mentee.fullname}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatSessionTime(session.startTime)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                You don't have any upcoming sessions.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard/sessions">View All Sessions</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}