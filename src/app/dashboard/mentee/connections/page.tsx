"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionRequest } from "@/components/matching/connection-request"
import { SessionList } from "@/components/sessions/session-list"
import { ChatWindow } from "@/components/messaging/chat-window"
import { SessionScheduler } from "@/components/sessions/session-scheduler"

interface Connection {
  id: string
  mentor: {
    id: string
    name: string
    profile?: {
      bio?: string
      skills?: string[]
    }
  }
  status: string
}

interface Mentor {
  id: string
  name: string
  profile?: {
    bio?: string
    skills?: string[]
  }
}

export default function MenteeConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)
  const [activeTab, setActiveTab] = useState("active")
  const [showScheduler, setShowScheduler] = useState(false)

  useEffect(() => {
    fetchConnections()
    fetchMentors()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/matching?role=MENTEE")
      if (!response.ok) throw new Error("Failed to fetch connections")
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Failed to fetch connections:", error)
    }
  }

  const fetchMentors = async () => {
    try {
      const response = await fetch("/api/users?role=MENTOR")
      if (!response.ok) throw new Error("Failed to fetch mentors")
      const data = await response.json()
      setMentors(data)
    } catch (error) {
      console.error("Failed to fetch mentors:", error)
    }
  }

  const activeConnections = connections.filter(
    (conn) => conn.status === "ACCEPTED"
  )

  const availableMentors = mentors.filter(
    (mentor) =>
      !connections.some(
        (conn) =>
          conn.mentor.id === mentor.id && conn.status !== "REJECTED"
      )
  )

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Connections</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Connections</TabsTrigger>
          <TabsTrigger value="find">Find Mentors</TabsTrigger>
        </TabsList>
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
                        <h3 className="font-medium">{connection.mentor.name}</h3>
                        {connection.mentor.profile?.bio && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {connection.mentor.profile.bio}
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
                      <CardTitle>Chat with {selectedConnection.mentor.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                      <ChatWindow
                        connectionId={selectedConnection.id}
                        otherUser={selectedConnection.mentor}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SessionList connectionId={selectedConnection.id} />
                      <Button
                        className="mt-4"
                        onClick={() => setShowScheduler(!showScheduler)}
                      >
                        {showScheduler ? "Hide Scheduler" : "Schedule New Session"}
                      </Button>
                      {showScheduler && (
                        <div className="mt-4">
                          <SessionScheduler
                            connectionId={selectedConnection.id}
                            onSuccess={() => {
                              setShowScheduler(false)
                              // Refresh session list
                              const event = new Event("sessionUpdate")
                              window.dispatchEvent(event)
                            }}
                          />
                        </div>
                      )}
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
        <TabsContent value="find">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableMentors.map((mentor) => (
              <Card key={mentor.id}>
                <CardHeader>
                  <CardTitle>{mentor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentor.profile?.bio && (
                      <p className="text-sm text-muted-foreground">
                        {mentor.profile.bio}
                      </p>
                    )}
                    {mentor.profile?.skills && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {mentor.profile.skills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <ConnectionRequest
                      mentorId={mentor.id}
                      mentorName={mentor.name}
                      onSuccess={fetchConnections}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 