"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ConnectionRequests } from "@/components/matching/connection-requests"
import { SessionList } from "@/components/sessions/session-list"
import { ChatWindow } from "@/components/messaging/chat-window"
import { useToast } from "@/components/ui/use-toast"
import { ActiveConnectionCard } from "@/components/matching/active-connection-card"

interface Connection {
  id: string
  mentee: {
    id: string
    name: string
    profile?: {
      bio?: string
      skills?: string[]
    }
  }
  status: string
}

export default function MentorConnectionsPage() {
  const { toast } = useToast()
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [activeTab, setActiveTab] = useState("requests")
  const [isLoading, setIsLoading] = useState(false)
  
  // Calculate pending count for badge
  const pendingCount = useMemo(() => {
    return connections.filter(c => c.status === "PENDING").length
  }, [connections])

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching all connections...")
      
      const response = await fetch("/api/matching?role=MENTOR")
      if (!response.ok) {
        throw new Error("Failed to fetch connections")
      }
      
      const data = await response.json()
      console.log("All connections:", data)
      
      // Store all connections so we can filter them by tab
      setConnections(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching connections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch connections",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Add this to filter connections based on active tab
  const filteredConnections = useMemo(() => {
    if (activeTab === "requests") {
      return connections.filter(c => c.status === "PENDING")
    } else if (activeTab === "active") {
      return connections.filter(c => c.status === "ACCEPTED")
    } else if (activeTab === "declined") {
      return connections.filter(c => c.status === "DECLINED")
    }
    return connections
  }, [connections, activeTab])

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="requests" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requests">
            Pending Requests
            {pendingCount > 0 && <Badge className="ml-2">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">Active Connections</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests">
          <ConnectionRequests onConnectionUpdate={fetchConnections} />
        </TabsContent>
        
        <TabsContent value="active">
          {isLoading ? (
            <div>Loading...</div>
          ) : filteredConnections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map(connection => (
                <ActiveConnectionCard key={connection.id} connection={connection} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No active connections yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="declined">
          {isLoading ? (
            <div>Loading...</div>
          ) : filteredConnections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConnections.map(connection => (
                <Card key={connection.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{connection.mentee.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connection.mentee.profile?.bio && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {connection.mentee.profile.bio}
                      </p>
                    )}
                    
                    {connection.mentee.profile?.skills && (
                      <div className="mt-2">
                        <h4 className="font-medium text-sm mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {connection.mentee.profile.skills.map((skill, i) => (
                            <span key={i} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      Request declined
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No declined connections.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}