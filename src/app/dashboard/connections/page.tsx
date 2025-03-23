// src/app/dashboard/connections/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { get, post } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/router"

type Connection = {
  id: number
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
  status: string
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchConnections() {
      setIsLoading(true)
      try {
        const { connections } = await get<{ connections: Connection[] }>('/api/connections')
        setConnections(connections)
      } catch (error) {
        console.error('Error fetching connections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnections()
  }, [])

  async function manageConnection(connectionId: number, action: 'accept' | 'reject') {
    try {
      await post('/api/connections/manage', { connectionId, action })
      setConnections(connections.filter(connection => connection.id !== connectionId))
    } catch (error) {
      console.error('Error managing connection:', error)
      alert('Failed to manage connection')
    }
  }

  const isMentor = user?.role === 'MENTOR'

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Manage Connections</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-[100px] bg-muted"></CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <Card key={connection.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={isMentor 
                        ? connection.mentee.profile?.profilePicture || ''
                        : connection.mentor.profile?.profilePicture || ''
                      } 
                      alt={isMentor 
                        ? connection.mentee.fullname
                        : connection.mentor.fullname
                      } 
                    />
                    <AvatarFallback>
                      {(isMentor 
                        ? connection.mentee.fullname
                        : connection.mentor.fullname
                      ).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">
                      {isMentor 
                        ? connection.mentee.fullname
                        : connection.mentor.fullname
                      }
                    </CardTitle>
                    <Badge variant={
                      connection.status === 'pending' ? 'outline' :
                      connection.status === 'accepted' ? 'default' : 'secondary'
                    }>
                      {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {connection.status === 'pending' && (
                    <p className="text-sm text-muted-foreground mb-4">
                      This connection request is pending your approval.
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                  {connection.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => manageConnection(connection.id, 'accept')} 
                        className="w-full sm:w-auto"
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => manageConnection(connection.id, 'reject')}
                        className="w-full sm:w-auto"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {connection.status === 'accepted' && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full sm:w-auto"
                        onClick={() => router.push(`/dashboard/messages?thread=${connection.id}`)}
                      >
                        Message
                      </Button>
                      <Button className="w-full sm:w-auto">
                        Schedule Session
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No connections found</h3>
            <p className="text-muted-foreground mb-6">
              {isMentor 
                ? "You don't have any mentee connection requests yet."
                : "You don't have any mentor connections yet."
              }
            </p>
            {!isMentor && (
              <Button asChild>
                <a href="/mentors">Find a Mentor</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}