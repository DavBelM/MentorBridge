// src/app/dashboard/resources/collections/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { get, del } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FolderPlus, Pencil, Trash } from "lucide-react"

type Collection = {
  id: number
  name: string
  description: string | null
  isPublic: boolean
  createdById: number
  createdAt: string
  createdBy: {
    id: number
    fullname: string
  }
  _count: {
    resources: number
  }
}

export default function CollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null)
  
  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      setIsLoading(true)
      try {
        const response = await get<{ collections: Collection[] } | null>('/api/resource-collections')
        if (response && response.collections) {
          setCollections(response.collections)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
        toast({
          title: "Error",
          description: "Failed to load collections",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCollections()
  }, [toast])
  
  // Handle collection deletion
  async function handleDelete() {
    if (!collectionToDelete) return
    
    try {
      await del(`/api/resource-collections/${collectionToDelete}`)
      
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      })
      
      // Update the collections list
      setCollections(collections.filter(collection => collection.id !== collectionToDelete))
    } catch (error) {
      console.error('Error deleting collection:', error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
    } finally {
      setCollectionToDelete(null)
    }
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/mentee/resources')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Resources
        </Button>
        
        <Button
          onClick={() => router.push('/dashboard/mentee/resources/collections/new')}
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Resource Collections</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{collection.name}</CardTitle>
                  <Badge variant={collection.isPublic ? 'default' : 'outline'}>
                    {collection.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {collection.description ? (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                    {collection.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm italic mb-2">
                    No description
                  </p>
                )}
                
                <div className="mt-4">
                  <Badge variant="outline">
                    {collection._count.resources} resources
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/resources/collections/${collection.id}`)}
                >
                  View
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/dashboard/resources/collections/${collection.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollectionToDelete(collection.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No collections yet</h2>
          <p className="text-muted-foreground mb-6">
            Create collections to organize your resources
          </p>
          <Button onClick={() => router.push('/dashboard/mentee/resources/collections/new')}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Collection
          </Button>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!collectionToDelete} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete the collection, but not the resources inside it.
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