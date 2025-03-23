// src/app/mentors/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { get } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { ProtectedRoute } from "@/components/auth/protected-route"

type Mentor = {
  id: number
  fullname: string
  username: string
  profile: {
    bio: string | null
    location: string | null
    profilePicture: string | null
    skills: string | null
    experience: string | null
    availability: string | null
    linkedin: string | null
    twitter: string | null
  }
}

export default function MentorsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(parseInt(searchParams?.get('page') || '1', 10))
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  
  useEffect(() => {
    async function fetchMentors() {
      setIsLoading(true)
      try {
        // Build query parameters
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', '12')
        
        if (searchQuery) {
          params.append('search', searchQuery)
        }
        
        const { mentors, pagination } = await get<{ 
          mentors: Mentor[],
          pagination: { total: number, pages: number }
        }>(`/api/mentors?${params.toString()}`)
        
        setMentors(mentors)
        setTotalPages(pagination.pages)
      } catch (error) {
        console.error('Error fetching mentors:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchMentors()
  }, [page, searchQuery])
  
  // Handle search
  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    // Reset to first page when searching
    setPage(1)
    
    // Update URL with search parameters
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    params.append('page', '1')
    
    // Update URL without reloading the page
    router.push(`/mentors?${params.toString()}`)
  }
  
  function handlePageChange(newPage: number) {
    setPage(newPage)
    
    // Update URL with new page
    const params = new URLSearchParams(searchParams?.toString())
    params.set('page', newPage.toString())
    router.push(`/mentors?${params.toString()}`)
  }
  
  function viewMentorProfile(mentorId: number) {
    router.push(`/mentors/${mentorId}`)
  }

  return (
    <ProtectedRoute>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Browse Mentors</h1>
        
        {/* Search controls */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <Input
              placeholder="Search by name, skills or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Area of Expertise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programming">Programming</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-[100px] bg-muted"></CardHeader>
                <CardContent className="mt-4 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => viewMentorProfile(mentor.id)}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={mentor.profile.profilePicture || ''} 
                      alt={mentor.fullname} 
                    />
                    <AvatarFallback>{mentor.fullname.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{mentor.fullname}</CardTitle>
                    <CardDescription>@{mentor.username}</CardDescription>
                    {mentor.profile.location && (
                      <div className="text-sm text-muted-foreground">{mentor.profile.location}</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm line-clamp-3 mb-3">{mentor.profile.bio || "No bio provided."}</p>
                  
                  {mentor.profile.skills && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mentor.profile.skills.split(',').slice(0, 3).map((skill, i) => (
                        <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">View Profile</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No mentors found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or check back later.
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}