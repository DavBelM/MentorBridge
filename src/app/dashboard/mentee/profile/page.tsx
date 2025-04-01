"use client"

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Mail, MapPin, PenSquare } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfileData {
  id: number
  fullname: string
  email: string
  username: string
  role: string
  profile: {
    bio: string | null
    location: string | null
    interests: string[] | null
    learningGoals: string[] | null
    profilePicture: string | null
    linkedin: string | null
    twitter: string | null
    createdAt: string
  }
}

export default function MenteeProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile")
        if (!response.ok) throw new Error("Failed to fetch profile")
        const data = await response.json()
        setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const handleEditProfile = () => {
    router.push("/dashboard/mentee/profile/edit")
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <Button onClick={handleEditProfile}>
          <PenSquare className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={profile?.profile?.profilePicture || ""} 
                alt={profile?.fullname || "Profile"} 
              />
              <AvatarFallback>{profile?.fullname?.slice(0, 2).toUpperCase() || "ME"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold mt-4">{profile?.fullname}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
            
            <div className="mt-4 flex items-center">
              <Badge variant="secondary">Mentee</Badge>
            </div>
            
            {profile?.profile?.location && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {profile.profile.location}
              </div>
            )}
            
            {profile?.profile?.createdAt && (
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Joined {new Date(profile.profile.createdAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{profile?.profile?.bio || "No bio provided yet. Tell mentors about yourself by editing your profile."}</p>
            
            <h3 className="font-medium mb-2 mt-4">Learning Goals</h3>
            {profile?.profile?.learningGoals && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Learning Goals</h3>
                {Array.isArray(profile.profile.learningGoals) ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {profile.profile.learningGoals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{profile.profile.learningGoals}</p>
                )}
              </div>
            )}
            
            <h3 className="font-medium mb-2 mt-4">Interests</h3>
            {profile?.profile?.interests ? (
              Array.isArray(profile.profile.interests) ? (
                <div className="flex flex-wrap gap-2">
                  {profile.profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{profile.profile.interests}</Badge>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">No interests added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-60 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}