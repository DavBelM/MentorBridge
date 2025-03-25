"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Globe, Mail, MapPin, Star } from "lucide-react"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { toast } from "@/components/ui/use-toast"

type MentorProfile = {
  id: number
  fullname: string
  username: string
  email: string
  role: string
  profile?: {
    bio?: string | null
    location?: string | null
    linkedin?: string | null
    twitter?: string | null
    profilePicture?: string | null
    experience?: string | null
    skills?: string | null
    availability?: string | null
    interests?: string | null
  }
  // Additional details we might populate from querying related data
  company?: string | null
  education?: Array<{
    degree: string
    institution: string
    year: string
  }>
  experience?: Array<{
    role: string
    company: string
    duration: string
  }>
  mentorshipAreas?: string[]
  availability?: Array<{
    day: string
    time: string
  }>
  rating?: number
  reviews?: number
}

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requestSent, setRequestSent] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMentorProfile() {
      try {
        // Fetch mentor data
        const response = await fetch(`/api/mentors/${params.id}`)
        if (!response.ok) throw new Error('Failed to fetch mentor profile')
        
        const data = await response.json()
        setMentor(data.mentor)

        // Check if there's already a connection with this mentor
        const connectionsRes = await fetch(`/api/connections/status?mentorId=${params.id}`)
        if (connectionsRes.ok) {
          const { status } = await connectionsRes.json()
          setConnectionStatus(status) // null, 'pending', 'accepted', 'rejected'
          setRequestSent(status === 'pending')
        }
      } catch (error) {
        console.error('Error fetching mentor profile:', error)
        toast({
          title: "Error",
          description: "Could not load mentor profile. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMentorProfile()
  }, [params.id])

  async function sendConnectionRequest() {
    try {
      const response = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: Number(params.id) })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send connection request')
      }

      setRequestSent(true)
      setConnectionStatus('pending')
      toast({
        title: "Request Sent",
        description: "Your connection request has been sent to the mentor."
      })
    } catch (error) {
      console.error('Error sending connection request:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send connection request",
        variant: "destructive"
      })
    }
  }

  function handleBookSession() {
    if (connectionStatus !== 'accepted') {
      toast({
        title: "Cannot book session",
        description: "You need to be connected with this mentor to book a session",
        variant: "destructive"
      })
      return
    }
    
    router.push(`/dashboard/sessions/schedule?mentorId=${params.id}`)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardSkeleton />
      </DashboardShell>
    )
  }

  if (!mentor) {
    return (
      <DashboardShell>
        <DashboardTransition>
          <div className="text-center py-10">
            <h3 className="font-medium text-lg mb-2">Mentor not found</h3>
            <p className="text-muted-foreground mb-6">
              The mentor profile you're looking for doesn't exist or is no longer available.
            </p>
            <Button asChild>
              <Link href="/dashboard/mentors">Back to All Mentors</Link>
            </Button>
          </div>
        </DashboardTransition>
      </DashboardShell>
    )
  }

  // Parse skills into an array
  const skills = mentor.profile?.skills ? 
    mentor.profile.skills.split(',').map(s => s.trim()).filter(Boolean) : 
    []

  // Parse availability into structured format if it's a string
  const availabilitySlots = mentor.profile?.availability ? 
    // This assumes availability is stored as "Monday: 6:00 PM - 8:00 PM, Wednesday: 6:00 PM - 8:00 PM"
    mentor.profile.availability.split(',').map(slot => {
      const [day, time] = slot.split(':').map(s => s.trim())
      return { day, time }
    }) : 
    []

  // Parse mentorship areas if they exist
  const mentorshipAreas = mentor.profile?.interests ? 
    mentor.profile.interests.split(',').map(area => area.trim()).filter(Boolean) :
    []

  // Get initials for avatar fallback
  const initials = mentor.fullname
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <DashboardShell>
      <DashboardTransition>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/dashboard/mentors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mentors
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={mentor.profile?.profilePicture || "/placeholder.svg"} alt={mentor.fullname} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  {mentor.rating && (
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 font-medium">{mentor.rating}</span>
                      <span className="text-sm text-muted-foreground ml-1">({mentor.reviews || 0} reviews)</span>
                    </div>
                  )}

                  {connectionStatus === 'accepted' ? (
                    <Button className="w-full md:w-auto" onClick={handleBookSession}>
                      Schedule Session
                    </Button>
                  ) : connectionStatus === 'pending' ? (
                    <Button className="w-full md:w-auto" disabled>
                      Request Pending
                    </Button>
                  ) : (
                    <Button 
                      className="w-full md:w-auto" 
                      onClick={sendConnectionRequest}
                      disabled={requestSent}
                    >
                      {requestSent ? "Request Sent" : "Request Mentorship"}
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{mentor.fullname}</h1>
                  <p className="text-muted-foreground">
                    {mentor.profile?.experience?.split(',')[0] || "Mentor"}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {mentor.profile?.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {mentor.profile.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-1 h-4 w-4" />
                      {mentor.email}
                    </div>
                    {mentor.profile?.linkedin && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="mr-1 h-4 w-4" />
                        <a 
                          href={mentor.profile.linkedin.startsWith('http') ? 
                            mentor.profile.linkedin : 
                            `https://linkedin.com/in/${mentor.profile.linkedin}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:text-primary"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>

                  {skills.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentor.profile?.bio && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Bio</h3>
                      <p className="text-sm">{mentor.profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="about">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 md:w-[400px]">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {mentor.fullname}</CardTitle>
                  <CardDescription>Learn more about {mentor.fullname}'s background and expertise.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mentor.profile?.experience && (
                    <div>
                      <h3 className="font-medium mb-2">Professional Background</h3>
                      <p className="text-sm">{mentor.profile.experience}</p>
                    </div>
                  )}

                  {mentor.education && mentor.education.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Education</h3>
                      <div className="space-y-2">
                        {mentor.education.map((edu, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-medium">{edu.degree}</p>
                            <p className="text-muted-foreground">
                              {edu.institution}, {edu.year}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {!mentor.profile?.experience && !mentor.education?.length && (
                    <p className="text-sm text-muted-foreground">No detailed information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Experience</CardTitle>
                  <CardDescription>{mentor.fullname}'s work history and professional journey.</CardDescription>
                </CardHeader>
                <CardContent>
                  {(mentor.experience ?? []).length > 0 ? (
                    <div className="space-y-4">
                      {(mentor.experience ?? []).map((exp, index) => (
                        <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                          <h3 className="font-medium">{exp.role}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-xs text-muted-foreground">{exp.duration}</p>
                        </div>
                      ))}
                    </div>
                  ) : mentor.profile?.experience ? (
                    <p className="text-sm">{mentor.profile.experience}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">No experience information available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mentorship">
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Areas</CardTitle>
                  <CardDescription>Topics and areas {mentor.fullname} can help you with.</CardDescription>
                </CardHeader>
                <CardContent>
                  {mentorshipAreas.length > 0 ? (
                    <ul className="space-y-2">
                      {mentorshipAreas.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-sm">{area}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No mentorship areas specified.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                  <CardDescription>{mentor.fullname}'s available time slots for mentorship sessions.</CardDescription>
                </CardHeader>
                <CardContent>
                  {availabilitySlots.length > 0 ? (
                    <div className="space-y-4">
                      {availabilitySlots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{slot.day}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{slot.time}</span>
                          </div>
                          {connectionStatus === 'accepted' && (
                            <Button size="sm" onClick={handleBookSession}>Book Session</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No availability information provided.</p>
                      {connectionStatus === 'accepted' && (
                        <Button className="mt-4" onClick={handleBookSession}>
                          Schedule a Session
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardTransition>
    </DashboardShell>
  )
}

