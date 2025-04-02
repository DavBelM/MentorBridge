"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Search, MessageSquare, Calendar, BarChart3, Target, MoreHorizontal, Filter, Users, Book, Clock, ArrowUpRight } from "lucide-react"
import { get } from "@/lib/api-client"; // Adjust the path based on your project structure

type Mentee = {
  id: number
  fullname: string
  email: string
  profile: {
    bio: string | null
    profilePicture: string | null
    interests?: any[] // Make interests optional
    learningGoals?: any[] // Make learningGoals optional
  }
  connectionId: number
  connectionStatus: string
  // Add these required fields
  connectedDate: string
  lastSessionDate: string | null
  nextSessionDate: string | null
  goalsProgress: {
    completed: number
    inProgress: number
    total: number
  }
  sessionStats: {
    completed: number
    upcoming: number
    totalHours: number
  }
}

export default function MentorMenteesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mentees, setMentees] = useState<Mentee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  
  // Fetch mentees
  useEffect(() => {
    async function fetchMentees() {
      try {
        setIsLoading(true);
        console.log("Fetching mentees...");
        
        const response = await get<{ mentees: Mentee[] }>('/api/mentees');
        console.log("Mentees response:", response);
        
        if (response && response.mentees) {
          setMentees(response.mentees);
        } else {
          setMentees([]);
          console.error("No mentees data in response:", response);
        }
      } catch (error) {
        console.error("Error fetching mentees:", error);
        toast({
          title: "Error",
          description: "Failed to fetch mentees",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMentees()
  }, [toast])
  
  // Filter mentees based on tab and search
  const filteredMentees = mentees.filter(mentee => {
    // First filter by active tab
    if (activeTab === "all") {
      // No additional filtering
    } else if (activeTab === "active") {
      // Those with upcoming sessions
      if (!mentee.nextSessionDate) return false
    } else if (activeTab === "new") {
      // Those connected within last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (new Date(mentee.connectedDate) < thirtyDaysAgo) return false
    } else if (activeTab === "inactive") {
      // No recent or upcoming sessions
      if (mentee.nextSessionDate) return false
      if (mentee.lastSessionDate) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        if (new Date(mentee.lastSessionDate) > thirtyDaysAgo) return false
      }
    }
    
    // Then filter by search query
    if (searchQuery && !mentee.fullname.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    return true
  })
  
  // View mentee detail
  const viewMenteeDetail = (mentee: Mentee) => {
    setSelectedMentee(mentee)
    setIsDetailDialogOpen(true)
  }
  
  // Navigate to message with mentee
  const messageWithMentee = (menteeId: number) => {
    router.push(`/dashboard/mentor/messages?menteeId=${menteeId}`)
  }
  
  // Navigate to schedule session with mentee
  const scheduleSession = (menteeId: number) => {
    router.push(`/dashboard/mentor/sessions/schedule?menteeId=${menteeId}`)
  }
  
  // Navigate to view/set goals for mentee
  const manageGoals = (menteeId: number) => {
    router.push(`/dashboard/mentor/mentees/${menteeId}/goals`)
  }
  
  // Navigate to view mentee progress
  const viewProgress = (menteeId: number) => {
    router.push(`/dashboard/mentor/mentees/${menteeId}/progress`)
  }
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
  
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
  }
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Mentees</h1>
          <p className="text-muted-foreground mt-1">
            Manage your mentoring relationships and track progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab("all")}>
                All Mentees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("active")}>
                Active Mentees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("new")}>
                New Mentees
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab("inactive")}>
                Inactive Mentees
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2">
            <Users className="h-4 w-4" />
            All
          </TabsTrigger>
          <TabsTrigger value="active" className="flex gap-2">
            <Calendar className="h-4 w-4" />
            Active
          </TabsTrigger>
          <TabsTrigger value="new" className="flex gap-2">
            <ArrowUpRight className="h-4 w-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex gap-2">
            <Clock className="h-4 w-4" />
            Inactive
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredMentees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentees.map((mentee) => (
                <Card key={mentee.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentee.profile.profilePicture || undefined} />
                          <AvatarFallback>{getInitials(mentee.fullname)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{mentee.fullname}</CardTitle>
                          <CardDescription>
                            Mentee since {format(new Date(mentee.connectedDate), "MMM yyyy")}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => messageWithMentee(mentee.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => scheduleSession(mentee.id)}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Session
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => manageGoals(mentee.id)}>
                            <Target className="h-4 w-4 mr-2" />
                            Set Goals
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => viewProgress(mentee.id)}>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Progress
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Session</p>
                        <p className="font-medium">{formatDate(mentee.lastSessionDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Session</p>
                        <p className="font-medium">{formatDate(mentee.nextSessionDate)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Goals Progress</span>
                        <span className="text-xs text-muted-foreground">
                          {mentee.goalsProgress.completed}/{mentee.goalsProgress.total} Completed
                        </span>
                      </div>
                      <Progress 
                        value={
                          mentee.goalsProgress.total > 0
                            ? (mentee.goalsProgress.completed / mentee.goalsProgress.total) * 100
                            : 0
                        } 
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pt-1">
                      {mentee.profile.interests && mentee.profile.interests.length > 0 ? (
                        <>
                          {mentee.profile.interests.slice(0, 3).map((interest, i) => (
                            <Badge key={i} variant="secondary">{interest}</Badge>
                          ))}
                          {mentee.profile.interests.length > 3 && (
                            <Badge variant="outline">+{mentee.profile.interests.length - 3} more</Badge>
                          )}
                        </>
                      ) : (
                        <Badge variant="secondary">No interests specified</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => viewMenteeDetail(mentee)}
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-10 pb-10 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No mentees found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? "No mentees match your search criteria. Try a different search term."
                    : activeTab !== "all"
                    ? `You don't have any ${activeTab} mentees at the moment.`
                    : "You don't have any mentees yet. When you connect with mentees, they will appear here."}
                </p>
                <Button variant="outline" onClick={() => router.push("/dashboard/mentor/connections")}>
                  View Connection Requests
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Mentee Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedMentee && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Mentee Profile</DialogTitle>
                <DialogDescription>
                  Detailed information about your mentee
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-2">
                      <AvatarImage src={selectedMentee.profile.profilePicture || undefined} />
                      <AvatarFallback className="text-lg">{getInitials(selectedMentee.fullname)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-medium">{selectedMentee.fullname}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{selectedMentee.email}</p>
                    
                    <div className="grid grid-cols-3 w-full gap-2 my-4 text-center">
                      <div className="p-2 border rounded-md">
                        <p className="text-2xl font-bold">{selectedMentee.sessionStats.completed}</p>
                        <p className="text-xs text-muted-foreground">Sessions</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-2xl font-bold">{selectedMentee.sessionStats.totalHours}</p>
                        <p className="text-xs text-muted-foreground">Hours</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <p className="text-2xl font-bold">{selectedMentee.goalsProgress.completed}</p>
                        <p className="text-xs text-muted-foreground">Goals</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          messageWithMentee(selectedMentee.id)
                          setIsDetailDialogOpen(false)
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          scheduleSession(selectedMentee.id)
                          setIsDetailDialogOpen(false)
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Session
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  {selectedMentee.profile.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm">{selectedMentee.profile.bio}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Learning Goals</h4>
                    {selectedMentee.profile.learningGoals && selectedMentee.profile.learningGoals.length > 0 ? (
                      <div className="space-y-2">
                        {selectedMentee.profile.learningGoals.map((goal, i) => (
                          <div key={i} className="p-2 border rounded-md flex items-start gap-2">
                            <Target className="h-5 w-5 text-primary mt-0.5" />
                            <p className="text-sm">{goal}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No learning goals specified</p>
                    )}
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          manageGoals(selectedMentee.id)
                          setIsDetailDialogOpen(false)
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Manage Goals
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentee.profile.interests && selectedMentee.profile.interests.length > 0 ? (
                        selectedMentee.profile.interests.map((interest, i) => (
                          <Badge key={i} variant="secondary">{interest}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No interests specified</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Session History</h4>
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-3 bg-muted p-2 text-xs font-medium">
                        <div>Date</div>
                        <div>Topic</div>
                        <div>Status</div>
                      </div>
                      <div className="p-4 text-center">
                        <Book className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Session history will appear here</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="mt-1"
                          onClick={() => {
                            router.push(`/dashboard/mentor/sessions?menteeId=${selectedMentee.id}`)
                            setIsDetailDialogOpen(false)
                          }}
                        >
                          View All Sessions
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Progress Tracking</h4>
                      <Button 
                        variant="link" 
                        className="h-auto p-0 text-sm"
                        onClick={() => {
                          viewProgress(selectedMentee.id)
                          setIsDetailDialogOpen(false)
                        }}
                      >
                        View Detailed Progress
                      </Button>
                    </div>
                    <div className="p-4 border rounded-md text-center">
                      <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Track your mentee's progress and development over time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}