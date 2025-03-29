"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Loader2, Shield, UserCheck, UserX } from "lucide-react"

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const data = await response.json()
        setAllUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [session, toast])

  const handleUpdateUserStatus = async (userId: number, shouldApprove: boolean) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved: shouldApprove })
      })
      
      if (!response.ok) {
        throw new Error("Failed to update user status")
      }
      
      // Update the user status in the local state
      setAllUsers(users => 
        users.map(user => 
          user.id === userId 
            ? { ...user, isApproved: shouldApprove } 
            : user
        )
      )
      
      toast({
        title: "Success",
        description: `User ${shouldApprove ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      console.error("Error updating user status:", error)
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
          <TabsTrigger value="mentees">Mentees</TabsTrigger>
          <TabsTrigger value="admins">Administrators</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
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
                      onClick={() => handleUpdateUserStatus(user.id, !user.isApproved)}
                      disabled={isLoading}
                    >
                      {user.isApproved ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
            
            {allUsers.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No users found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mentors">
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
                      onClick={() => handleUpdateUserStatus(mentor.id, !mentor.isApproved)}
                      disabled={isLoading}
                    >
                      {mentor.isApproved ? "Deactivate" : "Approve"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            
            {allUsers.filter(user => user.role === "MENTOR").length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No mentors found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="mentees">
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
                      onClick={() => handleUpdateUserStatus(mentee.id, !mentee.isApproved)}
                      disabled={isLoading}
                    >
                      {mentee.isApproved ? "Deactivate" : "Activate"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            
            {allUsers.filter(user => user.role === "MENTEE").length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No mentees found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="admins">
          <div className="space-y-4">
            {allUsers
              .filter(user => user.role === "ADMIN")
              .map(admin => (
                <Card key={admin.id}>
                  <CardHeader>
                    <CardTitle>{admin.fullname}</CardTitle>
                    <CardDescription>{admin.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Status: Always Active
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Joined {new Date(admin.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {allUsers.filter(user => user.role === "ADMIN").length === 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No administrators found.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}