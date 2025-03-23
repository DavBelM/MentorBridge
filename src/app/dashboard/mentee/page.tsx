"use client"

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

// Types for dashboard data
interface MenteeStats {
  totalMentors: number
  totalSessions: number
  learningProgress: number
  savedResources: number
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

export default function MenteeDashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MenteeStats | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [recommendedResources, setRecommendedResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true)
        
        // Fetch mentee dashboard data
        const dashboardData = await get<{
          stats: MenteeStats
          mentors: Mentor[]
          upcomingSessions: Session[]
          recommendedResources: Resource[]
        }>('/api/dashboard/mentee')
        
        setStats(dashboardData.stats)
        setMentors(dashboardData.mentors)
        setUpcomingSessions(dashboardData.upcomingSessions)
        setRecommendedResources(dashboardData.recommendedResources)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
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
  
  // Get resource icon based on type
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return '📄';
      case 'video':
        return '🎥';
      case 'book':
        return '📚';
      case 'course':
        return '🎓';
      default:
        return '📝';
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.fullname}</h1>
        <p className="text-muted-foreground">Here's an overview of your learning journey.</p>
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
              title="My Mentors" 
              value={stats?.totalMentors || 0} 
              description="Active mentoring relationships"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatsCard 
              title="Sessions Attended" 
              value={stats?.totalSessions || 0}
              description="Total learning sessions"
              icon={<CalendarClock className="h-4 w-4" />}
            />
            <StatsCard 
              title="Learning Progress" 
              value={`${stats?.learningProgress || 0}%`}
              description="Towards your goals"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatsCard 
              title="Saved Resources" 
              value={stats?.savedResources || 0}
              description="Learning materials bookmarked"
              icon={<Bookmark className="h-4 w-4" />}
            />
          </>
        )}
      </div>
      
      {/* Learning Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your progress towards your learning goals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Overall Progress</span>
                  <span>{stats?.learningProgress || 0}%</span>
                </div>
                <Progress value={stats?.learningProgress || 0} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Technical Skills</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Soft Skills</span>
                  <span>78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/learning-path">View Learning Path</Link>
          </Button>
        </CardFooter>
      </Card>
      
      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Mentors */}
        <Card>
          <CardHeader>
            <CardTitle>My Mentors</CardTitle>
            <CardDescription>Your current mentoring connections</CardDescription>
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
            ) : mentors.length > 0 ? (
              <div className="space-y-4">
                {mentors.map(mentor => (
                  <div key={mentor.id} className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={mentor.profile?.profilePicture || ''} />
                      <AvatarFallback>{mentor.fullname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mentor.fullname}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {mentor.profile?.skills || 'No skills listed'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground py-8 text-center">
                You don't have any mentors yet.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/mentors">View All Mentors</Link>
            </Button>
            <Button asChild>
              <Link href="/mentors">Find a Mentor</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled learning sessions</CardDescription>
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
                        <AvatarImage src={session.mentor.profile?.profilePicture || ''} />
                        <AvatarFallback>{session.mentor.fullname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{session.mentor.fullname}</span>
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
      
      {/* Recommended Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Resources</CardTitle>
          <CardDescription>Curated learning materials for your goals</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : recommendedResources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedResources.map(resource => (
                <div key={resource.id} className="border rounded-md p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getResourceIcon(resource.type)}</span>
                    <p className="font-medium">{resource.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {resource.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">
              No resources recommended yet.
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/resources">Browse Resources</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}