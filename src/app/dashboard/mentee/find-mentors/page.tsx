"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Mentor = {
  id: number
  fullname: string
  role: string
  profile?: {
    bio?: string | null
    skills?: string | null
    location?: string | null
    profilePicture?: string | null
  }
}

export default function FindMentorsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [connecting, setConnecting] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    async function fetchMentors() {
      try {
        const response = await fetch("/api/users?role=MENTOR")
        if (!response.ok) throw new Error("Failed to fetch mentors")
        const data = await response.json()
        setMentors(data)
      } catch (error) {
        console.error("Error fetching mentors:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMentors()
  }, [])

  const handleConnect = async (mentorId: number) => {
    if (!session?.user?.id) return
    
    setConnecting(prev => ({ ...prev, [mentorId]: true }))
    
    try {
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          menteeId: session.user.id,
        }),
      })
      
      if (!response.ok) throw new Error("Failed to send connection request")
      
      // Optionally update UI after successful connection
      router.refresh()
    } catch (error) {
      console.error("Error connecting with mentor:", error)
    } finally {
      setConnecting(prev => ({ ...prev, [mentorId]: false }))
    }
  }

  const handleViewProfile = (mentorId: number) => {
    router.push(`/dashboard/mentee/find-mentors/${mentorId}`)
  }

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = !skillFilter || 
      (mentor.profile?.skills && mentor.profile.skills.toLowerCase().includes(skillFilter.toLowerCase()))
    return matchesSearch && matchesSkill
  })

  const parsedSkills = (skills?: string | null) => {
    if (!skills) return []
    return skills.split(',').map(s => s.trim()).filter(Boolean)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Find Mentors</h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search mentors by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="Filter by skill (e.g. JavaScript, Python)"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <MentorCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filteredMentors.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No mentors found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map(mentor => (
                <Card key={mentor.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.profile?.profilePicture || ""} alt={mentor.fullname} />
                        <AvatarFallback>{mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{mentor.fullname}</CardTitle>
                        {mentor.profile?.location && (
                          <CardDescription>{mentor.profile.location}</CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm line-clamp-3 mb-3">
                      {mentor.profile?.bio || "No bio available"}
                    </p>
                    
                    {mentor.profile?.skills && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {parsedSkills(mentor.profile.skills).map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewProfile(mentor.id)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnect(mentor.id)}
                      disabled={connecting[mentor.id]}
                    >
                      {connecting[mentor.id] ? "Connecting..." : "Connect"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MentorCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="flex gap-1 mt-4">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}