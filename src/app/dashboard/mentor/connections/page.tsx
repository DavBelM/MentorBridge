"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionRequests } from "@/components/matching/connection-requests"
import { SessionList } from "@/components/sessions/session-list"
import { ChatWindow } from "@/components/messaging/chat-window"

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
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [activeTab, setActiveTab] = useState("requests")

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/matching?role=MENTOR")
      if (!response.ok) throw new Error("Failed to fetch connections")
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Failed to fetch connections:", error)
    }
  }

  const activeConnections = connections.filter(
    (conn) => conn.status === "ACCEPTED"
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Connections</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="requests">Connection Requests</TabsTrigger>
          <TabsTrigger value="active">Active Connections</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <ConnectionRequests onConnectionUpdate={fetchConnections} />
        </TabsContent>
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Active Connections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeConnections.map((connection) => (
                      <div
                        key={connection.id}
                        className={`p-4 rounded-lg border cursor-pointer ${
                          selectedConnection?.id === connection.id
                            ? "border-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedConnection(connection)}
                      >
                        <h3 className="font-medium">{connection.mentee.name}</h3>
                        {connection.mentee.profile?.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {connection.mentee.profile.bio}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              {selectedConnection ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Chat with {selectedConnection.mentee.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ChatWindow
                        connectionId={selectedConnection.id}
                        otherUser={selectedConnection.mentee}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SessionList connectionId={selectedConnection.id} />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a connection to view chat and sessions
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 