"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MessageSquare, UserX, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

type Connection = {
  id: number
  status: string
  createdAt: string
  updatedAt: string
  mentor: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
      bio: string | null
      skills: string | null
    }
  }
}

export default function MyMentorsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "active")
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [session])

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/matching?role=MENTEE");
      if (!response.ok) throw new Error("Failed to fetch connections");
      const data = await response.json();
      
      // Set the data
      setConnections(data);
      
      // If we have a connection and tab is the default "active", 
      // but there are no active connections yet, switch to "pending" tab
      if (activeTab === "active" && 
          data.filter((conn: Connection) => conn.status === "ACCEPTED").length === 0 && 
          data.filter((conn: Connection) => conn.status === "PENDING").length > 0) {
        setActiveTab("pending");
        router.push("/dashboard/mentee/my-mentors?tab=pending", { scroll: false });
      }
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast({
        title: "Error",
        description: "Failed to load your mentors. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProfile = (mentorId: number) => {
    router.push(`/dashboard/mentee/find-mentors/${mentorId}`)
  }

  const handleMessage = (mentorId: number) => {
    router.push(`/dashboard/mentee/messages?userId=${mentorId}`)
  }

  const handleScheduleSession = (mentorId: number) => {
    router.push(`/dashboard/mentee/sessions/schedule?mentorId=${mentorId}`)
  }

  const handleCancelConnection = async (connectionId: number) => {
    setProcessingId(connectionId)
    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      })
      
      if (!response.ok) throw new Error("Failed to cancel connection")
      
      // Update local state
      setConnections(prev => prev.filter(conn => conn.id !== connectionId))
      
      toast({
        title: "Connection Cancelled",
        description: "You've successfully cancelled this mentoring connection."
      })
    } catch (error) {
      console.error("Error cancelling connection:", error)
      toast({
        title: "Error",
        description: "Failed to cancel connection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessingId(null)
    }
  }

  const activeConnections = connections.filter(conn => conn.status === "ACCEPTED")
  const pendingConnections = connections.filter(conn => conn.status === "PENDING")
  const rejectedConnections = connections.filter(conn => conn.status === "REJECTED")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-300">Declined</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const parsedSkills = (skills?: string | null) => {
    if (!skills) return []
    return skills.split(',').map(s => s.trim()).filter(Boolean)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Mentors</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchConnections}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          router.push(`/dashboard/mentee/my-mentors?tab=${value}`, { scroll: false });
        }}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active Connections
            {activeConnections.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeConnections.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Requests
            {pendingConnections.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingConnections.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Declined
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <ConnectionSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {activeConnections.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <CheckCircle className="h-12 w-12 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">You don't have any active mentors yet</p>
                      <Button onClick={() => router.push('/dashboard/mentee/find-mentors')}>
                        Find Mentors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeConnections.map(connection => (
                    <Card key={connection.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={connection.mentor.profile?.profilePicture || ""} alt={connection.mentor.fullname} />
                              <AvatarFallback>{connection.mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{connection.mentor.fullname}</CardTitle>
                              <div className="flex items-center mt-1">
                                {getStatusBadge(connection.status)}
                                <span className="text-xs text-muted-foreground ml-2">
                                  Connected {new Date(connection.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2 mb-3">
                          {connection.mentor.profile?.bio || "No bio available"}
                        </p>
                        
                        {connection.mentor.profile?.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {parsedSkills(connection.mentor.profile.skills).slice(0, 5).map((skill, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {parsedSkills(connection.mentor.profile.skills).length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{parsedSkills(connection.mentor.profile.skills).length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewProfile(connection.mentor.id)}>
                            View Profile
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleMessage(connection.mentor.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleScheduleSession(connection.mentor.id)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelConnection(connection.id)}
                            disabled={processingId === connection.id}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            End Connection
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <ConnectionSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {pendingConnections.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Clock className="h-12 w-12 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">You don't have any pending connection requests</p>
                      <Button onClick={() => router.push('/dashboard/mentee/find-mentors')}>
                        Find Mentors
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingConnections.map(connection => (
                    <Card key={connection.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={connection.mentor.profile?.profilePicture || ""} alt={connection.mentor.fullname} />
                              <AvatarFallback>{connection.mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{connection.mentor.fullname}</CardTitle>
                              <div className="flex items-center mt-1">
                                {getStatusBadge(connection.status)}
                                <span className="text-xs text-muted-foreground ml-2">
                                  Requested {new Date(connection.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm line-clamp-2">
                          {connection.mentor.profile?.bio || "No bio available"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => handleViewProfile(connection.mentor.id)}>
                          View Profile
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleCancelConnection(connection.id)}
                          disabled={processingId === connection.id}
                        >
                          Cancel Request
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="rejected">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <ConnectionSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {rejectedConnections.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle className="h-12 w-12 text-muted-foreground opacity-30" />
                      <p className="text-muted-foreground">No declined connection requests</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {rejectedConnections.map(connection => (
                    <Card key={connection.id} className="opacity-75">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={connection.mentor.profile?.profilePicture || ""} alt={connection.mentor.fullname} />
                              <AvatarFallback>{connection.mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{connection.mentor.fullname}</CardTitle>
                              <div className="flex items-center mt-1">
                                {getStatusBadge(connection.status)}
                                <span className="text-xs text-muted-foreground ml-2">
                                  Updated {new Date(connection.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelConnection(connection.id)}
                          disabled={processingId === connection.id}
                        >
                          Remove
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConnectionSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
        
        <div className="flex gap-1 mt-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-36" />
        </div>
      </CardFooter>
    </Card>
  )
}