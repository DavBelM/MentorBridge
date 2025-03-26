// src/app/dashboard/resources/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Book, 
  FileText, 
  Video, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  ExternalLink,
  FolderPlus,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
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
  }[]
}

type Collection = {
  id: number
  name: string
  description: string | null
  isPublic: boolean
  createdById: number
  createdBy: {
    id: number
    fullname: string
  }
  _count: {
    resources: number
  }
}

export default function ResourcesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [resources, setResources] = useState<Resource[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoadingResources, setIsLoadingResources] = useState(true)
  const [isLoadingCollections, setIsLoadingCollections] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedCollection, setSelectedCollection] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pagination, setPagination] = useState<any>(null)
  
  // Fetch resources
  useEffect(() => {
    async function fetchResources() {
      setIsLoadingResources(true);
      setError(null);
      
      try {
        console.log("Fetching resources with filters:", {
          type: selectedType,
          search: searchQuery,
        });
        
        // Build query string
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (selectedType && selectedType !== 'all') params.append('type', selectedType);
        
        const queryString = params.toString();
        const endpoint = queryString ? `/api/resources?${queryString}` : '/api/resources';
        
        // Fetch directly to see detailed errors
        const response = await fetch(endpoint, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log("Resources data:", data);
        
        if (Array.isArray(data.resources)) {
          setResources(data.resources);
          setPagination(data.pagination);
        } else {
          console.error("Invalid resources format:", data);
          setError("Invalid data format from server");
          setResources([]);
        }
      } catch (error) {
        console.error("Error fetching resources:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        setResources([]);
      } finally {
        setIsLoadingResources(false);
      }
    }

    fetchResources();
  }, [searchQuery, selectedType, currentPage]);
  
  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      setIsLoadingCollections(true)
      try {
        const response = await get<{ collections: Collection[] }>('/api/resource-collections');
        if (response) {
          setCollections(response.collections);
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setIsLoadingCollections(false);
      }
    }
    
    if (user) {
      fetchCollections();
    }
  }, [user]);
  
  // Get icon by resource type
  function getResourceIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'book':
        return <Book className="h-5 w-5" />;
      default:
        return <LinkIcon className="h-5 w-5" />;
    }
  }
  
  // Handle search
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    // The search will be triggered by the useEffect dependency on searchQuery
  }
  
  // Reset filters
  function resetFilters() {
    setSearchQuery('');
    setSelectedType('');
    setSelectedCollection('');
  }
  
  const resourceTypes = [
    { value: "all", label: "All Types" }, // Fixed - using "all" instead of empty string
    { value: "article", label: "Articles" },
    { value: "video", label: "Videos" },
    { value: "book", label: "Books" },
    { value: "website", label: "Websites" },
  ];
  
  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">
            Discover and share learning resources
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => router.push('/dashboard/resources/collections/new')}
          >
            <FolderPlus className="h-4 w-4" />
            New Collection
          </Button>
          
          <Button
            className="flex items-center gap-2"
            onClick={() => router.push('/dashboard/resources/new')}
          >
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with collections */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collections</CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              {isLoadingCollections ? (
                <div className="py-4 px-2 text-center text-muted-foreground">
                  Loading collections...
                </div>
              ) : collections.length > 0 ? (
                <div className="space-y-1">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm ${
                      !selectedCollection ? 'bg-muted' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedCollection('')}
                  >
                    All Resources
                  </button>
                  
                  {collections.map((collection) => (
                    <button
                      key={collection.id}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex justify-between items-center ${
                        selectedCollection === collection.id.toString() 
                          ? 'bg-muted' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedCollection(collection.id.toString())}
                    >
                      <span className="truncate">{collection.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {collection._count.resources}
                      </Badge>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 px-2 text-center text-muted-foreground">
                  No collections found
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push('/dashboard/resources/collections')}
              >
                View All Collections
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="md:col-span-3 space-y-6">
          {/* Search and filters */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={resetFilters}
                  className="md:w-auto"
                >
                  Reset
                </Button>
                
                <Button type="submit" className="md:w-auto">
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {/* Tabs and resource list */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="my">My Resources</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-6">
              {isLoadingResources ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">Loading resources...</p>
                </div>
              ) : error ? (
                <div className="border rounded-lg p-8 text-center">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : resources.length === 0 ? (
                <div className="py-12 text-center border rounded-md">
                  <h3 className="text-xl font-medium mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'my' 
                      ? "You haven't added any resources yet." 
                      : "No resources match your search criteria."}
                  </p>
                  
                  <Button onClick={() => router.push('/dashboard/resources/new')}>
                    Add Resource
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {getResourceIcon(resource.type)}
                            </div>
                            <div>
                              <CardTitle className="text-lg line-clamp-1">
                                {resource.title}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                Added by {resource.createdBy.fullname}
                              </p>
                            </div>
                          </div>
                          
                          <Badge variant={resource.isPublic ? 'default' : 'outline'}>
                            {resource.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        {resource.description && (
                          <p className="text-sm line-clamp-2 mb-2">
                            {resource.description}
                          </p>
                        )}
                        
                        {resource.collections.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {resource.collections.map((collection) => (
                              <Badge key={collection.id} variant="outline">
                                {collection.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      
                      <CardFooter className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => router.push(`/dashboard/resources/${resource.id}`)}
                        >
                          View Details
                        </Button>
                        
                        {resource.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            asChild
                          >
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              Visit <ExternalLink className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}