"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Check } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"

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

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true)
        const response = await fetch('/api/notifications')
        if (!response.ok) throw new Error('Failed to fetch notifications')
        const data = await response.json()
        console.log("Fetched notifications:", data) // Debug log
        setNotifications(data)
      } catch (err) {
        console.error('Error fetching notifications:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  async function markAsRead(notificationId: string) {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      
      if (!response.ok) throw new Error('Failed to update notification')
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  async function markAllAsRead() {
    try {
      // Mark all as read on the server
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
      await Promise.all(unreadIds.map(id => 
        fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id })
        })
      ))
      
      // Update local state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })))
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  function getTypeLabel(type: string) {
    if (type.includes("MESSAGE")) return 'Message'
    if (type.includes("SESSION")) return 'Session'
    if (type.includes("CONNECTION") || type.includes("REQUEST")) return 'Request'
    return 'System'
  }
  
  function getTypeIcon(type: string) {
    if (type.includes("MESSAGE")) return '💬'
    if (type.includes("SESSION")) return '🗓️'
    if (type.includes("CONNECTION") || type.includes("REQUEST")) return '🔔'
    return '📢'
  }
  
  function getNotificationTitle(notification: Notification): string {
    // Create a title from the notification type
    if (notification.type.includes("MESSAGE")) return 'New Message'
    if (notification.type.includes("SESSION") && notification.type.includes("UPDATE")) 
      return 'Session Updated'
    if (notification.type.includes("SESSION")) return 'New Session'
    if (notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")) 
      return 'Connection Request'
    return 'Notification'
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    if (filter === "messages") return notification.type.includes("MESSAGE")
    if (filter === "sessions") return notification.type.includes("SESSION")
    return true
  })

  return (
    <div>
      <DashboardHeader
        heading="Notifications"
        text="Your activity and system notifications"
      />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
          <CardTitle>Manage Notifications</CardTitle>
          <div className="flex mt-2 sm:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={markAllAsRead}
              disabled={!notifications.some(n => !n.read)}
            >
              <Check className="mr-1 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
            <TabsList className="mb-4 grid grid-cols-2 sm:grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value={filter} className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === "all" 
                      ? "You don't have any notifications yet." 
                      : `You don't have any ${filter} notifications.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 md:space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`flex gap-3 p-3 rounded-lg transition-colors ${!notification.read ? 'bg-muted/50' : ''}`}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                              {getNotificationTitle(notification)}
                            </p>
                            <p className="text-xs text-muted-foreground mb-1">
                              {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as read</span>
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{notification.message}</p>
                        <div className="mt-1.5 flex items-center">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
                            {getTypeLabel(notification.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}