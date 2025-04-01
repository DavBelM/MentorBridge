"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Bell, Calendar, MessageCircle, Users } from "lucide-react"

type Notification = {
  id: string
  userId: string
  message: string
  type: string
  entityId?: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications')
        if (!response.ok) throw new Error('Failed to fetch notifications')
        
        const data = await response.json()
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      
      if (!response.ok) throw new Error('Failed to mark notification as read')
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      })
    }
  }

  async function markAllAsRead() {
    try {
      // Mark all as read on the server
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length === 0) return
      
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      })
      
      if (!response.ok) throw new Error('Failed to mark all notifications as read')
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })))
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      })
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      })
    }
  }

  function getTypeLabel(type: string) {
    if (type.includes("MESSAGE")) return 'Message'
    if (type.includes("SESSION")) return 'Session'
    if (type.includes("CONNECTION") || type.includes("REQUEST")) return 'Connection'
    return 'System'
  }
  
  function getTypeIcon(type: string) {
    if (type.includes("MESSAGE")) return <MessageCircle className="h-4 w-4" />
    if (type.includes("SESSION")) return <Calendar className="h-4 w-4" />
    if (type.includes("CONNECTION") || type.includes("REQUEST")) return <Users className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }
  
  function getNotificationTitle(notification: Notification): string {
    // Create a title from the notification type
    if (notification.type.includes("MESSAGE")) return 'New Message'
    if (notification.type.includes("SESSION") && notification.type.includes("UPDATE")) return 'Session Updated'
    if (notification.type.includes("SESSION")) return 'Session Reminder'
    if (notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")) return 'Mentee Request'
    return 'Notification'
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "messages") return notification.type.includes("MESSAGE")
    if (filter === "sessions") return notification.type.includes("SESSION")
    if (filter === "connections") return notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")
    return true
  })

  return (
    <div>
      <DashboardHeader
        heading="Notifications"
        text="Your activity and system notifications"
      />
      
      <div className="flex justify-between items-center mb-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="connections">Mentee Requests</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" onClick={markAllAsRead} disabled={!notifications.some(n => !n.read)}>
          Mark All as Read
        </Button>
      </div>
      
      <TabsContent value={filter} className="mt-0">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-12 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-75" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <CardTitle className="text-sm font-medium">
                        {getNotificationTitle(notification)}
                      </CardTitle>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {new Date(notification.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{notification.message}</p>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Bell className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">No notifications found</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </div>
  )
}