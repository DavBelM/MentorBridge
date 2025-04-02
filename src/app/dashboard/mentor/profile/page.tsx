"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PenSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileData {
  id: number
  fullname: string
  email: string
  username: string
  role: string
  profile: {
    bio: string | null
    location: string | null
    skills: string[] | null
    experience: string | null
    availability: string | null
    profilePicture: string | null
    linkedin: string | null
    twitter: string | null
    createdAt: string
  }
}

export default function MentorProfilePage() {
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
    router.push("/dashboard/mentor/profile/edit")
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
              {profile?.profile?.profilePicture && (
                <AvatarImage src={profile.profile.profilePicture} alt={profile.fullname || ''} />
              )}
              <AvatarFallback>
                {profile?.fullname ? profile.fullname.charAt(0) : <User className="h-16 w-16" />}
              </AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-semibold">{profile?.fullname}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
            
            <div className="flex gap-2 mt-4">
              {profile?.profile?.linkedin && (
                <a href={profile.profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                  LinkedIn
                </a>
              )}
              {profile?.profile?.twitter && (
                <a href={profile.profile.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                  Twitter
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Mentor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.profile?.bio && (
              <div>
                <h3 className="font-medium">Bio</h3>
                <p className="mt-1">{profile.profile.bio}</p>
              </div>
            )}
            
            {profile?.profile?.location && (
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="mt-1">{profile.profile.location}</p>
              </div>
            )}
            
            {profile?.profile?.skills && (
              <div>
                <h3 className="font-medium">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Array.isArray(profile.profile.skills) ? 
                    profile.profile.skills.map((skill, i) => (
                      <span key={i} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    )) : (
                      <p>{profile.profile.skills}</p>
                    )
                  }
                </div>
              </div>
            )}
            
            {profile?.profile?.experience && (
              <div>
                <h3 className="font-medium">Experience</h3>
                <p className="mt-1">{profile.profile.experience}</p>
              </div>
            )}
            
            {profile?.profile?.availability && (
              <div>
                <h3 className="font-medium">Availability</h3>
                <p className="mt-1">{profile.profile.availability}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium">Member Since</h3>
              <p className="mt-1">
                {profile?.profile?.createdAt 
                  ? new Date(profile.profile.createdAt).toLocaleDateString() 
                  : "N/A"}
              </p>
            </div>
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
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
            
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
            
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}