"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Users, UserCheck, UserX, MessageSquare, Settings, Shield, LogOut, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOut } from "next-auth/react"

interface DashboardStats {
  totalUsers: number
  totalMentors: number
  totalMentees: number
  pendingApprovals: number
  activeConnections: number
}

interface PendingMentor {
  id: number
  email: string
  fullname: string
  createdAt: string
  profile: {
    bio?: string
    skills?: string[]
  } | null
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingMentors, setPendingMentors] = useState<PendingMentor[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
    }
  }, [session, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, mentorsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/mentor-approval"),
          fetch("/api/admin/users")
        ])

        if (!statsRes.ok || !mentorsRes.ok || !usersRes.ok) {
          throw new Error("Failed to fetch data")
        }

        const [statsData, mentorsData, usersData] = await Promise.all([
          statsRes.json(),
          mentorsRes.json(),
          usersRes.json()
        ])

        setStats(statsData)
        setPendingMentors(mentorsData)
        setAllUsers(usersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        })
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchData()
    }
  }, [session, toast])

  const handleApproveMentor = async (mentorId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/mentor-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, action: "approve" })
      })

      if (!response.ok) {
        throw new Error("Failed to approve mentor")
      }

      setPendingMentors(prev => prev.filter(m => m.id !== mentorId))
      toast({
        title: "Success",
        description: "Mentor approved successfully"
      })
    } catch (error) {
      console.error("Error approving mentor:", error)
      toast({
        title: "Error",
        description: "Failed to approve mentor",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejectMentor = async (mentorId: number) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/mentor-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, action: "reject" })
      })

      if (!response.ok) {
        throw new Error("Failed to reject mentor")
      }

      setPendingMentors(prev => prev.filter(m => m.id !== mentorId))
      toast({
        title: "Success",
        description: "Mentor rejected successfully"
      })
    } catch (error) {
      console.error("Error rejecting mentor:", error)
      toast({
        title: "Error",
        description: "Failed to reject mentor",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, active: !currentStatus })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${currentStatus ? "deactivate" : "activate"} user`);
      }

      // Update the allUsers state
      setAllUsers(prev => prev.map(user => 
        user.id === userId ? {...user, isApproved: !currentStatus} : user
      ));
      
      toast({
        title: "Success",
        description: `User ${currentStatus ? "deactivated" : "activated"} successfully`
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Error",
        description: `Failed to update user status`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <span className="text-sm text-muted-foreground hidden lg:block">
              Manage your platform and users
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/admin/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Platform Settings
            </Button>
            <Button
              variant="ghost"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mentors">Mentors</TabsTrigger>
            <TabsTrigger value="mentees">Mentees</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMentors}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMentees}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Mentor Approvals</CardTitle>
                <CardDescription>
                  Review and approve mentor applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingMentors.map((mentor) => (
                    <Card key={mentor.id} className="w-full">
                      <CardHeader>
                        <CardTitle>{mentor.fullname}</CardTitle>
                        <CardDescription>{mentor.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {mentor.profile?.bio || "No bio available"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {Array.isArray(mentor.profile?.skills) 
                                ? mentor.profile.skills.join(", ") 
                                : "No skills listed"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Joined {new Date(mentor.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleRejectMentor(mentor.id)}
                          disabled={isLoading}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproveMentor(mentor.id)}
                          disabled={isLoading}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentors">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Management</CardTitle>
                <CardDescription>
                  View and manage all mentor accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers
                    .filter(user => user.role === "MENTOR")
                    .map(mentor => (
                      <Card key={mentor.id}>
                        <CardHeader>
                          <CardTitle>{mentor.fullname}</CardTitle>
                          <CardDescription>{mentor.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Status: {mentor.isApproved ? "Approved" : "Pending"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Joined {new Date(mentor.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Button
                            variant={mentor.isApproved ? "destructive" : "default"}
                            onClick={() => handleToggleUserStatus(mentor.id, mentor.isApproved)}
                            disabled={isLoading}
                          >
                            {mentor.isApproved ? "Deactivate" : "Activate"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentees">
            <Card>
              <CardHeader>
                <CardTitle>Mentee Management</CardTitle>
                <CardDescription>
                  View and manage all mentee accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers
                    .filter(user => user.role === "MENTEE")
                    .map(mentee => (
                      <Card key={mentee.id}>
                        <CardHeader>
                          <CardTitle>{mentee.fullname}</CardTitle>
                          <CardDescription>{mentee.email}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Status: {mentee.isApproved ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Joined {new Date(mentee.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Button
                            variant={mentee.isApproved ? "destructive" : "default"}
                            onClick={() => handleToggleUserStatus(mentee.id, mentee.isApproved)}
                            disabled={isLoading}
                          >
                            {mentee.isApproved ? "Deactivate" : "Activate"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Comprehensive view of all platform users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map(user => (
                    <Card key={user.id}>
                      <CardHeader>
                        <CardTitle>{user.fullname}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Role: {user.role}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Status: {user.isApproved ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Joined {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        {user.role !== "ADMIN" && (
                          <Button
                            variant={user.isApproved ? "destructive" : "default"}
                            onClick={() => handleToggleUserStatus(user.id, user.isApproved)}
                            disabled={isLoading}
                          >
                            {user.isApproved ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}