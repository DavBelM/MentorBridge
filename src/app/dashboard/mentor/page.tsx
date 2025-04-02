"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { useSession } from "next-auth/react"  // Add this import
import { get } from "@/lib/api-client"
import { StatsCard } from "@/app/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarClock, UserCheck, Star, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"

// Types for dashboard data
interface MentorStats {
  totalMentees: number
  activeSessions: number
  completedSessions: number
  pendingRequests: number
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

interface UpcomingSession {
  id: number
  title: string
  menteeName: string
  startTime: string
  endTime: string
}

interface ProgressData {
  category: string
  value: number
  description: string
}

export default function MentorDashboardPage() {
  const { user } = useAuth()
  const { data: session } = useSession()  // Add this line
  const [stats, setStats] = useState<MentorStats>({
    totalMentees: 0,
    activeSessions: 0,
    completedSessions: 0,
    pendingRequests: 0
  })
  const [recentMentees, setRecentMentees] = useState<Mentee[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [dashboardData, sessionsData, progressData, notificationsData] = await Promise.all([
          get<{
            stats: MentorStats
            recentMentees: Mentee[]
          }>('/api/mentor/dashboard-stats'),
          get<UpcomingSession[]>('/api/mentor/upcoming-sessions'),
          get<ProgressData[]>('/api/mentor/progress'),
          get<any[]>('/api/notifications')
        ])
        
        if (dashboardData) {
          setStats(dashboardData.stats)
          setRecentMentees(dashboardData.recentMentees)
        }
        if (sessionsData) setUpcomingSessions(sessionsData)
        if (progressData) setProgress(progressData)
        if (notificationsData) setNotifications(notificationsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [toast])
  
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

  const fetchUpcomingSessions = async () => {
    try {
      const response = await fetch('/api/mentor/upcoming-sessions')
      const data = await response.json()
      setUpcomingSessions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch upcoming sessions",
        variant: "destructive",
      })
    }
  }

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/mentor/progress')
      const data = await response.json()
      setProgress(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch progress data",
        variant: "destructive",
      })
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || session?.user?.name || "Mentor"}
        </h1>
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
              value={stats.totalMentees} 
              description="Active mentoring relationships"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatsCard 
              title="Active Sessions" 
              value={stats.activeSessions}
              description="Total active mentoring sessions"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatsCard 
              title="Completed Sessions" 
              value={stats.completedSessions}
              description="Total completed mentoring sessions"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatsCard 
              title="Pending Requests" 
              value={stats.pendingRequests}
              description="Total pending mentoring requests"
              icon={<UserCheck className="h-4 w-4" />}
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
              <Link href="/dashboard/mentor/mentees">View All Mentees</Link>
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
                        <AvatarImage src="" alt={session.menteeName} />
                        <AvatarFallback>{session.menteeName ? session.menteeName.charAt(0) : '?'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{session.menteeName}</span>
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

      {/* Progress Tracking */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ))}
              </div>
            ) : progress.length > 0 ? (
              progress.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{item.category}</span>
                    <span>{item.value}%</span>
                  </div>
                  <Progress value={item.value} />
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No progress data available yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p>No new notifications</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{notification.title}</h4>
                    <p className="text-sm text-gray-600">{notification.content}</p>
                  </div>
                  <Badge variant={notification.isRead ? "secondary" : "default"}>
                    {notification.isRead ? "Read" : "New"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}