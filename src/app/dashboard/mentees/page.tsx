"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

type Mentee = {
  id: number
  fullname: string
  profile: {
    profilePicture: string | null
    bio: string | null
  }
  connectionId: number
  connectionStatus: string
  sessionCount: number
}

export default function MenteesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect if not a mentor
    if (user && user.role !== "MENTOR") {
      router.push("/dashboard")
      return
    }
    
    async function fetchMentees() {
      setIsLoading(true)
      try {
        const { mentees } = await get<{ mentees: Mentee[] }>('/api/mentees')
        setMentees(mentees)
      } catch (error) {
        console.error('Error fetching mentees:', error)
        toast({
          title: "Error",
          description: "Failed to load mentees",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchMentees()
    }
  }, [user, router, toast])

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Mentees</h1>

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
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : mentees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentees.map((mentee) => (
            <Card key={mentee.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={mentee.profile?.profilePicture || ''} 
                      alt={mentee.fullname} 
                    />
                    <AvatarFallback>
                      {mentee.fullname.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mentee.fullname}</CardTitle>
                    <Badge variant={
                      mentee.connectionStatus === 'accepted' ? 'default' : 'outline'
                    }>
                      {mentee.connectionStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {mentee.profile?.bio || "No bio provided"}
                </p>
                <div className="flex justify-between text-sm">
                  <span>Sessions: {mentee.sessionCount}</span>
                  <span>Connected since: 2 months ago</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push(`/dashboard/messages?thread=${mentee.connectionId}`)}>
                  Message
                </Button>
                <Button onClick={() => router.push(`/dashboard/sessions/schedule?menteeId=${mentee.id}`)}>
                  Schedule Session
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h3 className="text-xl font-medium mb-2">No mentees yet</h3>
          <p className="text-muted-foreground mb-6">
            You don't have any mentees yet. Once mentees connect with you, they'll appear here.
          </p>
        </div>
      )}
    </div>
  )
}