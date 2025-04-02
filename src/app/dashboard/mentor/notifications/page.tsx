"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Bell, Calendar, MessageSquare, Users, ArrowLeft, CheckCheck } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

// Match your schema definition
type Notification = {
  id: string
  userId: string
  title: string
  message: string
  type: string
  entityId?: string
  read: boolean
  createdAt: string
}

export default function MentorNotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/notifications')
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchNotifications()
  }, [toast])
  
  // Filter notifications based on current tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "messages") return notification.type.includes("MESSAGE")
    if (activeTab === "sessions") return notification.type.includes("SESSION")
    if (activeTab === "connections") return notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")
    return true
  })
  
  const unreadCount = notifications.filter(notification => !notification.read).length
  const messageCount = notifications.filter(notification => notification.type.includes("MESSAGE")).length
  const sessionCount = notifications.filter(notification => notification.type.includes("SESSION")).length
  const connectionCount = notifications.filter(notification => 
    notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")
  ).length
  
  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      
      if (!response.ok) throw new Error('Failed to update notification')
      
      // Update local state
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ))
      
      toast({
        title: "Notification marked as read"
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      })
    }
  }
  
  async function markAllAsRead() {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      
      if (unreadIds.length === 0) {
        toast({ title: "No unread notifications" })
        return
      }
      
      await Promise.all(unreadIds.map(id => 
        fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id })
        })
      ))
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })))
      
      toast({
        title: `${unreadIds.length} notifications marked as read`
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      })
    }
  }
  
  function handleNotificationClick(notification: Notification) {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Navigate if there's a link
    const link = getNotificationLink(notification)
    if (link) {
      router.push(link)
    }
  }
  
  function getNotificationLink(notification: Notification): string | undefined {
    if (!notification.entityId) return undefined
    
    // Add links specific to notification types
    if (notification.type.includes("MESSAGE")) {
      return `/dashboard/mentor/messages?connectionId=${notification.entityId}`
    }
    
    if (notification.type.includes("SESSION")) {
      // For session notifications, link directly to the session if possible
      if (notification.entityId) {
        return `/dashboard/mentor/sessions/${notification.entityId}`
      }
      return `/dashboard/mentor/sessions`
    }
    
    if (notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")) {
      return `/dashboard/mentor/connections`
    }
    
    return undefined
  }
  
  function getNotificationIcon(type: string) {
    if (type.includes("MESSAGE")) return <MessageSquare className="h-5 w-5 text-blue-500" />
    if (type.includes("SESSION")) return <Calendar className="h-5 w-5 text-green-500" />
    if (type.includes("CONNECTION") || type.includes("REQUEST")) 
      return <Users className="h-5 w-5 text-purple-500" />
    return <Bell className="h-5 w-5 text-gray-500" />
  }
  
  function formatNotificationDate(dateString: string) {
    const date = new Date(dateString)
    const isToday = new Date().toDateString() === date.toDateString()
    
    if (isToday) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    
    return format(date, "PPP")
  }
  
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push("/dashboard/mentor")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Notifications</h1>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center">
            All
            <Badge variant="secondary" className="ml-2">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center">
            Unread
            <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center">
            Messages
            <Badge variant="secondary" className="ml-2">{messageCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center">
            Sessions
            <Badge variant="secondary" className="ml-2">{sessionCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center">
            Connections
            <Badge variant="secondary" className="ml-2">{connectionCount}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>{activeTab === "all" ? "All" : activeTab === "unread" ? "Unread" : activeTab} Notifications</CardTitle>
              <CardDescription>
                {activeTab === "all" ? "All notifications" : 
                  activeTab === "unread" ? "Your unread notifications" : 
                  `Notifications related to ${activeTab}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-[200px]" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[70%]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`flex gap-4 p-4 border rounded-lg cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-medium ${!notification.read ? 'font-semibold text-primary' : ''}`}>
                            {notification.title || (
                              notification.type.includes("MESSAGE") ? "New Message" :
                              notification.type.includes("SESSION") ? "Session Update" :
                              notification.type.includes("CONNECTION") ? "Connection Update" :
                              "Notification"
                            )}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {formatNotificationDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm mt-1">
                          {notification.message}
                        </p>
                        
                        {getNotificationLink(notification) && (
                          <div className="flex items-center mt-2 text-xs text-primary">
                            View details
                          </div>
                        )}
                      </div>
                      
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-primary flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Mark as read</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p className="text-muted-foreground">No notifications found</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "all" ? "You don't have any notifications yet" :
                     activeTab === "unread" ? "You don't have any unread notifications" :
                     `You don't have any ${activeTab} notifications`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}