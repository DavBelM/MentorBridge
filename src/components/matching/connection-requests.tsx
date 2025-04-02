"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

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
  message: string
  status: string
  createdAt: string
}

// Update these constants to match your database enum values
const STATUS_ACCEPTED = "ACCEPTED"
const STATUS_REJECTED = "DECLINED" // Change to match your schema (DECLINED vs REJECTED)

interface ConnectionRequestsProps {
  onConnectionUpdate?: () => void;
}

export function ConnectionRequests({ onConnectionUpdate }: ConnectionRequestsProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

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
      toast({
        title: "Error",
        description: "Failed to load connection requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponse = async (connectionId: string, status: typeof STATUS_ACCEPTED | typeof STATUS_REJECTED) => {
    setActionLoading(connectionId + status)
    try {
      console.log(`Sending request to update connection ${connectionId} to ${status}`)
      
      const response = await fetch("/api/matching", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      })
      
      const data = await response.json()
      console.log("Response from server:", data)
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update connection")
      }
      
      toast({
        title: status === STATUS_ACCEPTED ? "Connection Accepted" : "Connection Declined",
        description: status === STATUS_ACCEPTED 
          ? "You can now start mentoring this mentee" 
          : "Connection request has been declined",
      })
      
      // Important: Refresh the list of pending requests
      fetchConnections()
      
      // If parent component has an onUpdate callback, call it to refresh the main page
      if (typeof onConnectionUpdate === 'function') {
        onConnectionUpdate()
      }
    } catch (error) {
      console.error("Error updating connection:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update connection request",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (connections.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No pending connection requests
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{connection.mentee.name}</span>
              <span className="text-sm text-muted-foreground">
                {new Date(connection.createdAt).toLocaleDateString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{connection.message}</p>
              {connection.mentee.profile?.bio && (
                <div>
                  <h4 className="text-sm font-medium">About</h4>
                  <p className="text-sm text-muted-foreground">
                    {connection.mentee.profile.bio}
                  </p>
                </div>
              )}
              {connection.mentee.profile?.skills && (
                <div>
                  <h4 className="text-sm font-medium">Skills</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {connection.mentee.profile.skills.map((skill) => (
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
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleResponse(connection.id, STATUS_ACCEPTED)}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === (connection.id + STATUS_ACCEPTED) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting</>
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleResponse(connection.id, STATUS_REJECTED)}
                  disabled={actionLoading !== null}
                >
                  {actionLoading === (connection.id + STATUS_REJECTED) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Declining</>
                  ) : (
                    "Decline"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

