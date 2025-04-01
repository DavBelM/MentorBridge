"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { FolderPlus, MoreHorizontal, Pencil, Share, Trash2, Book, FileText, Globe, Lock } from "lucide-react"
import { get, post, del } from "@/lib/api-helpers"

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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

export default function MentorCollectionsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });
  
  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      setIsLoading(true)
      try {
        const response = await get<Collection[] | null>('/api/resource-collections')
        if (response) {
          setCollections(response)
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
  
  // Handle collection creation
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await post<Collection>('/api/resource-collections', values)
      
      if (response) {
        toast({
          title: "Success",
          description: "Collection created successfully",
        })
        
        // Add the new collection to the list
        setCollections([response, ...collections])
        
        // Reset form and close dialog
        form.reset()
        setIsCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      toast({
        title: "Error",
        description: "Failed to create collection",
        variant: "destructive",
      })
    }
  }
  
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
  
  // Go to collection detail page
  const viewCollection = (id: number) => {
    router.push(`/dashboard/mentor/resources/collections/${id}`)
  }
  
  // Edit collection
  const editCollection = (id: number) => {
    router.push(`/dashboard/mentor/resources/collections/${id}/edit`)
  }
  
  // Share collection with mentees
  const shareCollection = (id: number) => {
    router.push(`/dashboard/mentor/resources/collections/${id}/share`)
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Resource Collections</h1>
          <p className="text-muted-foreground mt-1">
            Organize your resources into collections for easier sharing with mentees
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Create a new collection to organize your resources.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Frontend Development" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what this collection is about..." 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description for your collection.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Public Collection</FormLabel>
                        <FormDescription>
                          Make this collection visible to all mentees
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Create Collection</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
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
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card key={collection.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="line-clamp-1">{collection.name}</CardTitle>
                  <CardDescription>
                    Created {new Date(collection.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Book className="h-6 w-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                {collection.description ? (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {collection.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No description provided</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm">
                    {collection._count.resources} {collection._count.resources === 1 ? 'resource' : 'resources'}
                  </span>
                  {collection.isPublic ? (
                    <span className="flex items-center text-xs ml-2">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </span>
                  ) : (
                    <span className="flex items-center text-xs ml-2">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" onClick={() => viewCollection(collection.id)}>
                  View
                </Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => shareCollection(collection.id)}>
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editCollection(collection.id)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setCollectionToDelete(collection.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No collections found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create collections to organize your resources and share them with your mentees.
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <FolderPlus className="h-4 w-4 mr-2" />
            Create Your First Collection
          </Button>
        </div>
      )}
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={collectionToDelete !== null} onOpenChange={(open) => !open && setCollectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the collection
              and remove it from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}