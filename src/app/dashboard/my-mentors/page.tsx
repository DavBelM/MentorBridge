"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

type Connection = {
  id: number
  status: string
  mentor: {
    id: number
    fullname: string
    profile?: {
      profilePicture?: string | null
      bio?: string | null
      skills?: string | null
    }
  }
}

export default function MyMentorsPage() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchConnections() {
      try {
        setIsLoading(true)
        // Update this to fetch from the correct endpoint
        const response = await fetch('/api/connections?status=accepted')
        
        if (!response.ok) throw new Error('Failed to fetch connections')
        
        const data = await response.json()
        // Filter for accepted connections only (if not already filtered by API)
        const acceptedConnections = data.connections.filter(
          (connection: Connection) => connection.status === 'accepted'
        )
        setConnections(acceptedConnections)
      } catch (error) {
        console.error('Error fetching mentors:', error)
        toast({
          title: "Error",
          description: "Failed to load your mentors. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConnections()
  }, [])

  return (
    <DashboardShell>
      <DashboardTransition>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
            <p className="text-muted-foreground">
              Here are all the mentors you are currently connected with.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : connections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((connection) => {
                const mentor = connection.mentor
                // Get initials from fullname
                const initials = mentor.fullname
                  .split(" ")
                  .map(name => name[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
                
                // Parse skills if they exist
                const skills = mentor.profile?.skills 
                  ? mentor.profile.skills.split(',').map(s => s.trim()).filter(Boolean)
                  : []
                
                return (
                  <Card key={connection.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage 
                            src={mentor.profile?.profilePicture || "/placeholder.svg"} 
                            alt={mentor.fullname} 
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-bold">{mentor.fullname}</h3>
                        
                        <div className="flex flex-wrap gap-1 mt-2">
                          {skills.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs line-clamp-2 text-muted-foreground mt-2">
                          {mentor.profile?.bio || "No bio available."}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                        >
                          <Link href={`/dashboard/messages?userId=${mentor.id}`}>
                            Message
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          asChild
                        >
                          <Link href={`/dashboard/sessions/schedule?mentorId=${mentor.id}`}>
                            Schedule Session
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="font-medium text-lg mb-2">No mentors yet</h3>
              <p className="text-muted-foreground mb-6">
                You don't have any accepted mentor connections yet. Browse available mentors to send connection requests.
              </p>
              <Button asChild>
                <Link href="/dashboard/mentors">Browse Mentors</Link>
              </Button>
            </div>
          )}
        </div>
      </DashboardTransition>
    </DashboardShell>
  )
}