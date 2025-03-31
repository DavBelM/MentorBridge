"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { StatsCard } from "@/app/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarClock, UserCheck, TrendingUp, Bookmark } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

// Types for dashboard data
interface MenteeStats {
  pendingRequests: number
  activeConnections: number
  completedSessions: number
  upcomingSessions: number
  // Add other fields with defaults:
  totalMentors?: number
  totalSessions?: number
  learningProgress?: number
  savedResources?: number
}

interface Mentor {
  id: number
  fullname: string
  profile: {
    profilePicture: string | null
    bio: string | null
    skills: string | null
  }
}

interface Session {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  mentorId: number
  mentor: {
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

interface Resource {
  id: number
  title: string
  type: string
  description: string
}

interface UpcomingSession {
  id: number
  title: string
  mentorName: string
  startTime: string
  endTime: string
}

interface LearningProgress {
  category: string
  value: number
  description: string
}

interface MentorConnection {
  id: number
  mentorName: string
  expertise: string[]
  status: string
}

export default function MenteeDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<{
    stats: MenteeStats;
    mentors: Mentor[];
    sessions: Session[];  // Changed from upcomingSessions
    resources: Resource[];
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("Fetching dashboard data with session:", session)
        const response = await fetch('/api/dashboard/mentee')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("Dashboard data received:", data) // Add this to debug
        setDashboardData(data)
      } catch (err: unknown) {
        console.error("Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchDashboardData()
    }
  }, [session])
  
  if (loading) return <div className="flex items-center justify-center h-full"><Skeleton className="w-full h-[500px]" /></div>
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-md">Error loading dashboard: {error}</div>
  if (!dashboardData) return <div className="p-4">No dashboard data available</div>
  
  return (
    <div className="space-y-4 md:space-y-6 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 md:mb-6">Mentee Dashboard</h1>
      
      {/* Stats section - already responsive but improved spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard 
          title="Active Mentors" 
          value={dashboardData.stats.activeConnections} 
          icon={<UserCheck className="h-5 w-5 md:h-6 md:w-6" />}
          description="Mentors currently guiding you"
        />
        <StatsCard 
          title="Scheduled Sessions" 
          value={dashboardData.stats.upcomingSessions} 
          icon={<CalendarClock className="h-5 w-5 md:h-6 md:w-6" />}
          description="Upcoming learning sessions"
        />
        <StatsCard 
          title="Learning Progress" 
          value={`${dashboardData.stats.learningProgress || 0}%`}
          icon={<TrendingUp className="h-5 w-5 md:h-6 md:w-6" />}
          description="Toward your goals"
        />
        <StatsCard 
          title="Saved Resources" 
          value={dashboardData.resources.length} 
          icon={<Bookmark className="h-5 w-5 md:h-6 md:w-6" />}
          description="Materials for your learning"
        />
      </div>
      
      {/* Upcoming sessions - improved for mobile */}
      <Card className="overflow-hidden">
        <CardHeader className="px-4 md:px-6 py-4">
          <CardTitle className="text-lg md:text-xl">Upcoming Sessions</CardTitle>
          <CardDescription className="text-xs md:text-sm">Your scheduled mentoring sessions</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 py-2 md:py-4">
          {dashboardData.sessions && dashboardData.sessions.length > 0 ? (
            <div className="space-y-3 md:space-y-4">
              {dashboardData.sessions.map(session => (
                <div key={session.id} className="flex flex-col sm:flex-row items-start sm:items-center p-2 sm:p-3 border rounded-lg">
                  <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3">
                      <AvatarImage src={session.mentor.profile.profilePicture || ""} />
                      <AvatarFallback>{session.mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm md:text-base">{session.title}</h4>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        With {session.mentor.fullname}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground block sm:hidden">
                        {new Date(session.startTime).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center w-full sm:w-auto ml-0 sm:ml-auto">
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block mr-4">
                      {new Date(session.startTime).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </p>
                    <Badge className="text-xs whitespace-nowrap">{session.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No upcoming sessions scheduled</p>
          )}
        </CardContent>
        <CardFooter className="px-4 md:px-6 py-3 md:py-4">
          <Link href="/dashboard/mentee/sessions" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-sm">View All Sessions</Button>
          </Link>
        </CardFooter>
      </Card>
      
      {/* Learning Progress - improved for mobile */}
      <Card>
        <CardHeader className="px-4 md:px-6 py-4">
          <CardTitle className="text-lg md:text-xl">Learning Progress</CardTitle>
          <CardDescription className="text-xs md:text-sm">Track your skills development</CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 py-2 md:py-4">
          <div className="space-y-3 md:space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs md:text-sm font-medium">Overall Progress</span>
                <span className="text-xs md:text-sm font-medium">{dashboardData.stats.learningProgress || 0}%</span>
              </div>
              <Progress value={dashboardData.stats.learningProgress || 0} className="h-1.5 md:h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}