"use client"

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface MentorProfile {
  profilePicture?: string;
  location?: string;
  skills?: string | string[];
  bio?: string;
  experience?: string;
  availability?: string;
}

interface Mentor {
  id: string;
  fullname: string;
  profile?: MentorProfile;
}

export default function MentorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  const mentorId = params.id

  useEffect(() => {
    async function fetchMentorProfile() {
      try {
        const response = await fetch(`/api/mentors/${mentorId}`)
        if (!response.ok) throw new Error("Failed to fetch mentor profile")
        const data = await response.json()
        setMentor(data.mentor)
      } catch (error) {
        console.error("Error fetching mentor profile:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (mentorId) {
      fetchMentorProfile()
    }
  }, [mentorId])

  useEffect(() => {
    async function checkConnectionStatus() {
      if (!session?.user?.id || !mentorId) return;
      
      try {
        const response = await fetch(`/api/matching/status?mentorId=${mentorId}&menteeId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setConnectionStatus(data.status || null);
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      }
    }
    
    if (session?.user?.id) {
      checkConnectionStatus();
    }
  }, [session, mentorId]);

  const handleConnect = async () => {
    if (!session?.user?.id || !mentor) return
    
    setConnecting(true)
    
    try {
      const requestData = {
        mentorId: mentor.id,
        menteeId: session.user.id,
        message: "I'd like to connect with you as my mentor."
      };
      console.log("Sending connection request:", requestData);
      
      const response = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      
      // Get the detailed error response
      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response body:", responseText);
      
      if (!response.ok) {
        const errorData = JSON.parse(responseText);
        
        if (errorData.error === "Connection already exists") {
          setConnectionStatus(errorData.status || "PENDING");
          // Redirect to my mentors page with pending tab selected
          router.push("/dashboard/mentee/my-mentors?tab=pending");
          return;
        }
        
        throw new Error(`Failed to send connection request: ${responseText}`);
      }
      
      // Redirect to the pending tab
      router.push("/dashboard/mentee/my-mentors?tab=pending");
    } catch (error) {
      console.error("Error connecting with mentor:", error);
    } finally {
      setConnecting(false);
    }
  }

  if (isLoading) {
    return <MentorProfileSkeleton />
  }

  if (!mentor) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <p className="text-center">Mentor profile not found</p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
// Type for a skill which could be a string or array
type SkillInput = string | string[] | undefined;

function parsedSkills(skills: SkillInput): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
        return skills.split(',').map(skill => skill.trim());
    }
    return [];
}

  const renderActionButton = () => {
    if (connectionStatus === "ACCEPTED") {
      return (
        <Button disabled className="w-full md:w-auto">
          Already Connected
        </Button>
      );
    } else if (connectionStatus === "PENDING") {
      return (
        <Button disabled className="w-full md:w-auto">
          Request Pending
        </Button>
      );
    } else if (connectionStatus === "REJECTED") {
      return (
        <Button onClick={handleConnect} className="w-full md:w-auto">
          Request Again
        </Button>
      );
    } else {
      return (
        <Button 
          className="w-full md:w-auto"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? "Sending Request..." : "Request Mentorship"}
        </Button>
      );
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        Back to Mentors
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={mentor.profile?.profilePicture || ""} alt={mentor.fullname} />
              <AvatarFallback>{mentor.fullname.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl mb-2">{mentor.fullname}</CardTitle>
              {mentor.profile?.location && (
                <CardDescription className="text-base mb-2">{mentor.profile.location}</CardDescription>
              )}
              
              {mentor.profile?.skills && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {parsedSkills(mentor.profile.skills).map((skill, idx) => (
                    <Badge key={idx} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p>{mentor.profile?.bio || "No bio available"}</p>
          </div>
          
          {mentor.profile?.experience && (
            <div>
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              <p>{mentor.profile.experience}</p>
            </div>
          )}
          
          {mentor.profile?.availability && (
            <div>
              <h3 className="text-lg font-medium mb-2">Availability</h3>
              <p>{mentor.profile.availability}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          {renderActionButton()}
        </CardFooter>
      </Card>
    </div>
  )
}

function MentorProfileSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="outline" disabled className="mb-4">
        Back to Mentors
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
              
              <div className="flex gap-1 mt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div>
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
        
        <CardFooter>
          <Skeleton className="h-10 w-full md:w-40" />
        </CardFooter>
      </Card>
    </div>
  )
}