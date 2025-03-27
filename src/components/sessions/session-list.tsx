"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Calendar, Clock, CheckCircle, XCircle } from "lucide-react"

interface Session {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: string
  notes?: string
  connection: {
    mentor: {
      id: string
      name: string
    }
    mentee: {
      id: string
      name: string
    }
  }
}

interface SessionListProps {
  connectionId?: string
  onSessionUpdate?: () => void
}

export function SessionList({ connectionId, onSessionUpdate }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSessions()
  }, [connectionId])

  const fetchSessions = async () => {
    try {
      const url = connectionId
        ? `/api/sessions?connectionId=${connectionId}`
        : "/api/sessions"
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch sessions")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (sessionId: string, status: string) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status }),
      })

      if (!response.ok) throw new Error("Failed to update session")

      toast({
        title: "Success",
        description: `Session ${status.toLowerCase()}`,
      })
      fetchSessions()
      onSessionUpdate?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No sessions scheduled
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{session.title}</span>
              <span
                className={`text-sm ${
                  session.status === "COMPLETED"
                    ? "text-green-500"
                    : session.status === "CANCELLED"
                    ? "text-red-500"
                    : "text-blue-500"
                }`}
              >
                {session.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.description && (
                <p className="text-sm text-muted-foreground">
                  {session.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(session.startTime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(session.startTime).toLocaleTimeString()} -{" "}
                    {new Date(session.endTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              {session.notes && (
                <div>
                  <h4 className="text-sm font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {session.notes}
                  </p>
                </div>
              )}
              {session.status === "SCHEDULED" && (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusUpdate(session.id, "COMPLETED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Completed
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusUpdate(session.id, "CANCELLED")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 