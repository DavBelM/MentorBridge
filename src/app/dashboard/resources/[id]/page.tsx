// src/app/dashboard/resources/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get, del } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  ArrowLeft,
  Book, 
  Calendar, 
  Edit2, 
  ExternalLink, 
  FileText, 
  Folder, 
  LinkIcon,
  Share2, 
  Trash2, 
  User, 
  Video 
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type Resource = {
  id: number
  title: string
  description: string | null
  type: string
  url: string | null
  fileUrl: string | null
  isPublic: boolean
  createdById: number
  createdAt: string
  updatedAt: string
  createdBy: {
    id: number
    fullname: string
    username: string
    profile: {
      profilePicture: string | null
    }
  }
  collections: {
    id: number
    name: string
    description: string | null
  }[]
}

export default function ResourceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const [resource, setResource] = useState<Resource | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Get the resource ID from URL
  const resourceId = params?.id as string
  
  // Check if user is the creator
  const isCreator = resource?.createdBy.id === user?.id
  
  // Fetch resource data
  useEffect(() => {
    async function fetchResource() {
      if (!resourceId) return
      
      setIsLoading(true)
      try {
        const { resource } = await get<{ resource: Resource }>(`/api/resources/${resourceId}`)
        setResource(resource)
      } catch (error) {
        console.error('Error fetching resource:', error)
        toast({
          title: "Error",
          description: "Failed to load resource details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchResource()
  }, [resourceId, toast])
  
  // Handle resource deletion
  async function handleDelete() {
    if (!resourceId) return
    
    try {
      await del(`/api/resources/${resourceId}`)
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      })
      router.push('/dashboard/resources')
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }
  
  // Get icon based on resource type
  function getResourceIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'article':
        return <FileText className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'book':
        return <Book className="h-5 w-5" />
      default:
        return <LinkIcon className="h-5 w-5" />
    }
  }
  
  // Format date
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="h-8 w-24 bg-muted animate-pulse rounded mb-6"></div>
          <div className="h-10 w-3/4 bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-4 w-1/3 bg-muted animate-pulse rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted animate-pulse rounded"></div>
            <div className="h-12 bg-muted animate-pulse rounded"></div>
            <div className="h-12 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!resource) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Resource not found</h1>
          <p className="text-muted-foreground mb-6">
            The resource you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => router.push('/dashboard/resources')}>
            Back to Resources
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={resource.isPublic ? 'default' : 'outline'}>
            {resource.isPublic ? 'Public' : 'Private'}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            {getResourceIcon(resource.type)}
            <span className="capitalize">{resource.type}</span>
          </Badge>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
        
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            <span>Added by {resource.createdBy.fullname}</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            <span>{formatDate(resource.createdAt)}</span>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardContent className="pt-6">
            {resource.description ? (
              <p className="whitespace-pre-wrap">{resource.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}
            
            {resource.url && (
              <div className="mt-6">
                <Button variant="outline" asChild>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Open Resource <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {resource.collections.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {resource.collections.map((collection) => (
                  <div 
                    key={collection.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted"
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span>{collection.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {isCreator && (
          <>
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Resource</h2>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => router.push(`/dashboard/resources/${resource.id}/edit`)}
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this resource
              and remove it from all collections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}