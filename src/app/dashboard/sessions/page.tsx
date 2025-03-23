// src/app/dashboard/sessions/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Clock, Check, X } from "lucide-react"

type Session = {
  id: number
  title: string
  description: string | null
  startTime: string
  endTime: string
  status: string
  mentor: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
  mentee: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

export default function SessionsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true)
      try {
        let url = '/api/sessions';
        
        if (activeTab === 'upcoming') {
          url += '?upcoming=true';
        } else if (activeTab === 'completed') {
          url += '?status=completed';
        } else if (activeTab === 'cancelled') {
          url += '?status=cancelled';
        }
        
        const { sessions } = await get<{ sessions: Session[] }>(url)
        setSessions(sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [activeTab])

  const isMentor = user?.role === 'MENTOR'

  // Format session time
  function formatSessionTime(startTime: string, endTime: string) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    return `${format(start, 'MMM d, yyyy')} · ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
  }
  
  // Get status badge variant
  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'scheduled':
        return 'outline';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground">Manage your mentoring sessions</p>
        </div>
        
        <Button className="mt-4 md:mt-0" onClick={() => router.push('/dashboard/sessions/schedule')}>
          Schedule New Session
        </Button>
      </div>
      
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        {/* Sessions List - Same content for all tabs, filtered by API */}
        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 bg-muted rounded-full"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-2/3 mt-2"></div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="h-9 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{session.title}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(session.status)}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>{formatSessionTime(session.startTime, session.endTime)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={isMentor 
                            ? session.mentee.profile?.profilePicture || ''
                            : session.mentor.profile?.profilePicture || ''
                          } 
                          alt={isMentor 
                            ? session.mentee.fullname
                            : session.mentor.fullname
                          } 
                        />
                        <AvatarFallback>
                          {(isMentor 
                            ? session.mentee.fullname
                            : session.mentor.fullname
                          ).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {isMentor ? 'Mentee: ' : 'Mentor: '}
                        <span className="font-medium">
                          {isMentor ? session.mentee.fullname : session.mentor.fullname}
                        </span>
                      </span>
                    </div>
                    
                    {session.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push(`/dashboard/sessions/${session.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No sessions found</h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming sessions scheduled."
                  : activeTab === 'completed'
                  ? "You don't have any completed sessions yet."
                  : "You don't have any cancelled sessions."
                }
              </p>
              {activeTab === 'upcoming' && (
                <Button onClick={() => router.push('/dashboard/sessions/schedule')}>
                  Schedule a Session
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}