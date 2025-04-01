"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Match your schema definition
type Notification = {
  id: string
  userId: string 
  message: string
  type: string
  entityId?: string
  read: boolean
  createdAt: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length

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
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
    // Set up polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
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

  function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    // Navigate if there's a link
    const link = getNotificationLink(notification)
    if (link) {
      setOpen(false)
      router.push(link)
    }
  }

  function getNotificationLink(notification: Notification): string | undefined {
    // Handle actual database types
    if (!notification.entityId) return undefined;
    
    if (notification.type.includes("MESSAGE")) {
      return `/dashboard/mentee/messages?connectionId=${notification.entityId}`
    }
    if (notification.type.includes("SESSION")) {
      return `/dashboard/mentee/sessions`
    }
    if (notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")) {
      return '/dashboard/mentee/my-mentors'
    }
    return undefined
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

  function getTimeLabel(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  function getNotificationIcon(type: string) {
    if (type.includes("MESSAGE")) return '💬'
    if (type.includes("SESSION")) return '🗓️'
    if (type.includes("REQUEST") || type.includes("CONNECTION")) return '🔔'
    return '📢'
  }

  function getNotificationTitle(notification: Notification): string {
    // Create a title from the notification type if one isn't provided
    if (notification.type.includes("MESSAGE")) return 'New Message'
    if (notification.type.includes("SESSION") && notification.type.includes("UPDATE")) 
      return 'Session Updated'
    if (notification.type.includes("SESSION")) return 'New Session'
    if (notification.type.includes("CONNECTION") || notification.type.includes("REQUEST")) 
      return 'Connection Request'
    return 'Notification'
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] md:w-[380px] p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs"
              onClick={markAllAsRead}
            >
              <Check className="mr-1 h-3.5 w-3.5" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px] md:h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-pulse text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500">Error: {error}</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2 opacity-20" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b last:border-0 transition-colors",
                    !notification.read && "bg-muted/40",
                    getNotificationLink(notification) && "cursor-pointer hover:bg-muted/60"
                  )}
                  onClick={() => getNotificationLink(notification) && handleNotificationClick(notification)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={cn("text-sm font-medium truncate", !notification.read && "text-primary")}>
                        {getNotificationTitle(notification)}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {getTimeLabel(notification.createdAt)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    
                    {getNotificationLink(notification) && (
                      <div className="flex items-center mt-1 text-xs text-primary">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View details
                      </div>
                    )}
                  </div>
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground flex-shrink-0 -mr-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        markAsRead(notification.id)
                      }}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span className="sr-only">Mark as read</span>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Link href="/dashboard/mentee/notifications" onClick={() => setOpen(false)}>
            <Button variant="outline" size="sm" className="w-full text-xs">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}