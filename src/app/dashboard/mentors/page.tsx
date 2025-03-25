"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Filter } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"

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

export default function MentorsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("")
  const [connectionRequests, setConnectionRequests] = useState<number[]>([])

  // Fetch mentors
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        const mentorsData = await apiClient('/api/mentors')
        if (mentorsData && mentorsData.mentors) {
          setMentors(mentorsData.mentors)
        }
        
        // Fetch pending connection requests 
        const connectionsData = await apiClient('/api/connections?status=pending')
        if (connectionsData && connectionsData.connections) {
          setConnectionRequests(
            connectionsData.connections
              .map((c: any) => c.mentorId)
          )
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter mentors based on search and skill filter
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = searchQuery.trim() === "" || 
      mentor.fullname.toLowerCase().includes(searchQuery.toLowerCase())
    
    const mentorSkills = mentor.profile?.skills || ""
    const matchesSkill = skillFilter === "" || 
      mentorSkills.toLowerCase().includes(skillFilter.toLowerCase())
    
    return matchesSearch && matchesSkill
  })

  // Function to handle sending a connection request
  async function sendConnectionRequest(mentorId: number) {
    try {
      await apiClient('/api/connections', {
        method: 'POST',
        body: JSON.stringify({ mentorId })
      })

      // Update local state
      setConnectionRequests([...connectionRequests, mentorId])
      
      toast({
        title: "Request Sent",
        description: "Your connection request has been sent to the mentor."
      })
    } catch (error) {
      console.error('Error sending connection request:', error)
      // Toast is already handled by apiClient
    }
  }

  // Get unique skills for filter dropdown
  const allSkills = mentors
    .flatMap(mentor => (mentor.profile?.skills || "").split(','))
    .map(skill => skill.trim())
    .filter((skill, index, self) => 
      skill !== "" && self.indexOf(skill) === index
    )

  return (
    <DashboardShell>
      <DashboardTransition>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Find Mentors</h1>
            <p className="text-muted-foreground">
              Browse and connect with mentors who can help you grow in your career.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search mentors by name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by skill" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Skills</SelectItem>
                {allSkills.map((skill, i) => (
                  <SelectItem key={i} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 h-64" />
                </Card>
              ))}
            </div>
          ) : filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => {
                // Get initials from fullname
                const initials = mentor.fullname
                  .split(" ")
                  .map(name => name[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2)
                
                const hasSentRequest = connectionRequests.includes(mentor.id)
                
                // Get skills as array
                const skills = mentor.profile?.skills 
                  ? mentor.profile.skills.split(',').map(s => s.trim()).filter(Boolean)
                  : []
                
                return (
                  <Card key={mentor.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage 
                              src={mentor.profile?.profilePicture || "/placeholder.svg"} 
                              alt={mentor.fullname} 
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={`/dashboard/mentors/${mentor.id}`}>View Profile</Link>
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-bold">{mentor.fullname}</h3>
                          <p className="text-sm text-muted-foreground">{mentor.role}</p>
                          {mentor.profile?.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span>{mentor.profile.location}</span>
                            </div>
                          )}
                          
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
                      </div>
                      
                      <div className="bg-muted/50 p-4">
                        <Button 
                          className="w-full"
                          onClick={() => sendConnectionRequest(mentor.id)}
                          disabled={hasSentRequest}
                        >
                          {hasSentRequest ? "Request Sent" : "Request Mentorship"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="font-medium text-lg mb-2">No mentors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find more mentors.
              </p>
            </div>
          )}
        </div>
      </DashboardTransition>
    </DashboardShell>
  )
}

