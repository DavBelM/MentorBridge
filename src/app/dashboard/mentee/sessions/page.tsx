"use client"

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Video, FileText, ChevronRight, Plus } from "lucide-react"
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

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
}

export default function SessionsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState("upcoming")

  useEffect(() => {
    async function fetchSessions() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/sessions?role=MENTEE")
        if (!response.ok) throw new Error("Failed to fetch sessions")
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Error fetching sessions:", error)
        toast({
          title: "Error",
          description: "Failed to load your sessions",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.id) {
      fetchSessions()
    }
  }, [session, toast])

  const handleNavigateToSession = (sessionId: number) => {
    router.push(`/dashboard/mentee/sessions/${sessionId}`)
  }

  const handleScheduleSession = () => {
    router.push("/dashboard/mentee/sessions/schedule")
  }

  // Filter sessions based on active tab
  const upcomingSessions = sessions.filter(
    s => s.status === "SCHEDULED" && isAfter(parseISO(s.startTime), new Date())
  )
  
  const pastSessions = sessions.filter(
    s => s.status === "COMPLETED" || (s.status === "SCHEDULED" && isBefore(parseISO(s.endTime), new Date()))
  )
  
  const pendingSessions = sessions.filter(
    s => s.status === "PENDING"
  )
  
  const cancelledSessions = sessions.filter(
    s => s.status === "CANCELLED"
  )

  // Helper function to format date
  const formatSessionTime = (startTime: string, endTime: string) => {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    
    return `${format(start, "MMM d, yyyy")} · ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`
  }

  // Get status badge
  const getStatusBadge = (status: string, startTime: string) => {
    if (status === "SCHEDULED") {
      const isToday = format(parseISO(startTime), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
      
      if (isToday) {
        return <Badge className="bg-orange-500">Today</Badge>
      }
      
      const isTomorrow = format(parseISO(startTime), "yyyy-MM-dd") === 
        format(addDays(new Date(), 1), "yyyy-MM-dd")
      
      if (isTomorrow) {
        return <Badge className="bg-yellow-500">Tomorrow</Badge>
      }
      
      return <Badge className="bg-blue-500">Upcoming</Badge>
    }
    
    if (status === "COMPLETED") {
      return <Badge variant="secondary">Completed</Badge>
    }
    
    if (status === "CANCELLED") {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    
    if (status === "PENDING") {
      return <Badge variant="outline">Pending</Badge>
    }
    
    return <Badge>{status}</Badge>
  }
  
  // Session card component
  const SessionCard = ({ session }: { session: Session }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle>{session.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatSessionTime(session.startTime, session.endTime)}
              </div>
            </CardDescription>
          </div>
          {getStatusBadge(session.status, session.startTime)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage 
              src={session.mentor.profile.profilePicture || ""} 
              alt={session.mentor.fullname} 
            />
            <AvatarFallback>{session.mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">With {session.mentor.fullname}</p>
            <p className="text-sm text-muted-foreground">Mentor</p>
          </div>
        </div>
        
        {session.description && (
          <p className="mt-4 text-sm text-muted-foreground">
            {session.description}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex w-full justify-between">
          {session.status === "SCHEDULED" && isAfter(parseISO(session.startTime), new Date()) && (
            <Button variant="outline" className="mr-2">
              <Calendar className="h-4 w-4 mr-2" />
              Add to Calendar
            </Button>
          )}
          <Button 
            className="ml-auto"
            onClick={() => handleNavigateToSession(session.id)}
          >
            <ChevronRight className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button onClick={handleScheduleSession}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Session
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            Upcoming
            {upcomingSessions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcomingSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingSessions.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingSessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {isLoading ? (
            <SessionsLoading />
          ) : upcomingSessions.length === 0 ? (
            <EmptyState
              title="No upcoming sessions"
              description="Schedule a session with one of your mentors"
              action={handleScheduleSession}
              actionText="Schedule Session"
            />
          ) : (
            upcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="past">
          {isLoading ? (
            <SessionsLoading />
          ) : pastSessions.length === 0 ? (
            <EmptyState
              title="No past sessions"
              description="Your completed sessions will appear here"
              action={handleScheduleSession}
              actionText="Schedule Session"
            />
          ) : (
            pastSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {isLoading ? (
            <SessionsLoading />
          ) : pendingSessions.length === 0 ? (
            <EmptyState
              title="No pending sessions"
              description="Sessions awaiting confirmation will appear here"
              action={handleScheduleSession}
              actionText="Schedule Session"
            />
          ) : (
            pendingSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          {isLoading ? (
            <SessionsLoading />
          ) : cancelledSessions.length === 0 ? (
            <EmptyState
              title="No cancelled sessions"
              description="Cancelled sessions will appear here"
              action={handleScheduleSession}
              actionText="Schedule Session"
            />
          ) : (
            cancelledSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading state component
function SessionsLoading() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="mb-4">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <Skeleton className="h-6 w-[250px] mb-2" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
              <Skeleton className="h-6 w-[100px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-5 w-[150px] mb-1" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-[120px] mr-2" />
            <Skeleton className="h-10 w-[120px] ml-auto" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

// Empty state component
function EmptyState({ 
  title, 
  description, 
  action, 
  actionText 
}: { 
  title: string
  description: string
  action: () => void
  actionText: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          {description}
        </p>
        <Button onClick={action}>
          <Plus className="h-4 w-4 mr-2" />
          {actionText}
        </Button>
      </CardContent>
    </Card>
  )
}