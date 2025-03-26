// src/app/dashboard/connections/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" // Make sure to import from next/navigation, not next/router
import { useAuth } from "@/context/auth-context"
import { get, put } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    }
  }
  mentee: {
    id: number
    fullname: string
    profile: {
      profilePicture: string | null
      bio: string | null
    }
  }
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter() // This should work now

  useEffect(() => {
    async function fetchConnections() {
      setIsLoading(true)
      try {
        const response = await get<{ connections: any[] }>('/api/connections')
        if (response) {
          // Transform connections to use the expected property names
          const formattedConnections = response.connections.map(conn => ({
            id: conn.id,
            status: conn.status,
            createdAt: conn.createdAt,
            updatedAt: conn.updatedAt,
            mentor: conn.mentorUser || conn.mentor,
            mentee: conn.menteeUser || conn.mentee
          }));
          
          setConnections(formattedConnections)
        }
      } catch (error) {
        console.error('Error fetching connections:', error)
        toast({
          title: "Error",
          description: "Failed to load connections",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchConnections()
    }
  }, [user, toast])

  // Filter connections based on active tab
  const filteredConnections = connections.filter(connection => {
    if (activeTab === "all") return true
    return connection.status.toLowerCase() === activeTab
  })

  // Determine if the user is the mentor or mentee in a connection
  const getOtherParty = (connection: Connection) => {
    if (user?.role === "MENTOR") {
      return connection.mentee
    } else {
      return connection.mentor
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Connections</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Active</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted"></div>
                  <div>
                    <div className="h-5 w-24 bg-muted rounded mb-1"></div>
                    <div className="h-4 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-muted rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredConnections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => {
            const otherParty = getOtherParty(connection)
            
            return (
              <Card key={connection.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={otherParty.profile?.profilePicture || ''} />
                        <AvatarFallback>{otherParty.fullname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{otherParty.fullname}</CardTitle>
                        <Badge variant={
                          connection.status === 'accepted' ? 'default' : 
                          connection.status === 'pending' ? 'secondary' : 'outline'
                        }>
                          {connection.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {otherParty.profile?.bio || 'No bio provided'}
                  </p>
                  
                  <p className="text-xs text-muted-foreground">
                    Connected since: {new Date(connection.createdAt).toLocaleDateString()}
                  </p>
                  
                  <div className="flex gap-3 mt-4">
                    {connection.status === 'accepted' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Find the right thread ID for this connection
                            const threadId = connection.id;
                            router.push(`/dashboard/messages?thread=${threadId}`);
                          }}
                        >
                          Message
                        </Button>
                        
                        {user?.role === 'MENTEE' && (
                          <Button 
                            size="sm" 
                            onClick={() => router.push(`/dashboard/sessions/schedule?mentorId=${otherParty.id}`)}
                          >
                            Schedule Session
                          </Button>
                        )}
                      </>
                    )}
                    
                    {connection.status === 'pending' && user?.role === 'MENTOR' && (
                      <>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              await put(`/api/connections/${connection.id}/accept`, {});
                              
                              setConnections(prev => 
                                prev.map(c => c.id === connection.id 
                                  ? {...c, status: 'accepted'} 
                                  : c
                                )
                              );
                              
                              toast({
                                title: "Connection accepted",
                                description: "You are now connected with this mentee"
                              });
                            } catch (error: any) {
                              console.error('Error accepting connection:', error);
                              toast({
                                title: "Error",
                                description: error.message || "Failed to accept connection",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              await put(`/api/connections/${connection.id}/reject`, {});
                              
                              // Update local state to reflect the change
                              setConnections(prev => 
                                prev.map(c => c.id === connection.id 
                                  ? {...c, status: 'rejected'} 
                                  : c
                                )
                              );
                              
                              toast({
                                title: "Connection rejected",
                                description: "You have rejected this connection request"
                              });
                            } catch (error: any) {
                              console.error('Error rejecting connection:', error);
                              toast({
                                title: "Error",
                                description: error.message || "Failed to reject connection",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No connections found</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab !== "all" 
              ? `You don't have any ${activeTab} connections at the moment.`
              : user?.role === "MENTEE"
                ? "Connect with mentors to start your learning journey."
                : "Wait for mentees to connect with you or invite them to join."}
          </p>
          
          {user?.role === "MENTEE" && (
            <Button onClick={() => router.push('/dashboard/mentors')}>
              Find Mentors
            </Button>
          )}
        </div>
      )}
    </div>
  )
}