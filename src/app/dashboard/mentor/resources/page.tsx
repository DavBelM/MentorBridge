"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { PlusCircle, FolderPlus, Clock, Bookmark, Globe, Lock, File, Video, BookOpen, LinkIcon } from "lucide-react"

type Resource = {
  id: number
  title: string
  description: string | null
  type: string
  url: string | null
  fileUrl: string | null
  isPublic: boolean
  createdAt: string
  createdBy: {
    id: number
    fullname: string
  }
}

export default function MentorResourcesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "all")

  useEffect(() => {
    async function fetchResources() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/resources')
        if (!response.ok) throw new Error('Failed to fetch resources')
        
        const data = await response.json()
        if (data && data.resources) {
          setResources(data.resources)
        }
      } catch (error) {
        console.error('Error fetching resources:', error)
        toast({
          title: "Error",
          description: "Failed to load resources",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResources()
  }, [toast])
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard/mentor/resources?tab=${value}`, { scroll: false })
  }
  
  // Filter resources based on active tab
  const filteredResources = resources.filter(resource => {
    if (activeTab === "all") return true
    if (activeTab === "my-resources") return true // Adjust with logic to check if created by current user
    return resource.type === activeTab
  })
  
  // Icon mapping for resource types
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article": return <File className="h-6 w-6 text-blue-500" />
      case "video": return <Video className="h-6 w-6 text-red-500" />
      case "book": return <BookOpen className="h-6 w-6 text-green-500" />
      case "website": return <Globe className="h-6 w-6 text-purple-500" />
      default: return <File className="h-6 w-6 text-gray-500" />
    }
  }
  
  // Create new resource
  const handleCreateResource = () => {
    router.push("/dashboard/mentor/resources/create")
  }
  
  // View collections
  const handleViewCollections = () => {
    router.push("/dashboard/mentor/resources/collections")
  }
  
  // View resource details
  const handleViewResource = (id: number) => {
    router.push(`/dashboard/mentor/resources/${id}`)
  }
  
  // Share with mentees
  const handleShareWithMentees = (resourceId: number) => {
    router.push(`/dashboard/mentor/resources/${resourceId}/share`)
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Manage and share learning materials with your mentees
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleViewCollections} variant="outline">
            <FolderPlus className="h-4 w-4 mr-2" />
            Collections
          </Button>
          <Button onClick={handleCreateResource}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Resource
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="my-resources">My Resources</TabsTrigger>
          <TabsTrigger value="article">Articles</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
          <TabsTrigger value="book">Books</TabsTrigger>
          <TabsTrigger value="website">Websites</TabsTrigger>
          <TabsTrigger value="document">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="shadow-sm">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="line-clamp-1">{resource.title}</CardTitle>
                      <CardDescription>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getResourceIcon(resource.type)}
                  </CardHeader>
                  <CardContent>
                    {resource.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {resource.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No description provided</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center text-xs">
                      {resource.isPublic ? (
                        <Globe className="h-3 w-3 mr-1" />
                      ) : (
                        <Lock className="h-3 w-3 mr-1" />
                      )}
                      {resource.isPublic ? "Public" : "Private"}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleShareWithMentees(resource.id)}>
                        Share
                      </Button>
                      <Button size="sm" onClick={() => handleViewResource(resource.id)}>
                        View
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <h3 className="font-medium text-lg mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "my-resources" 
                  ? "You haven't created any resources yet."
                  : "No resources match the selected filter."}
              </p>
              <Button onClick={handleCreateResource}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Resource
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}