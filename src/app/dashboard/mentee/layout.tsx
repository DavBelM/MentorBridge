"use client"

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  User,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Bell
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { SWRConfig } from "swr"
export default function MenteeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  /* const [notifications, setNotifications] = useState([
    { id: 1, message: "New message from your mentor", read: false },
    { id: 2, message: "Session reminder for tomorrow", read: false },
    { id: 3, message: "New resource available", read: false },
  ]) */
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await fetch("/api/messages/unread-count");
        if (!response.ok) throw new Error("Failed to fetch unread count");
        const data = await response.json();
        setUnreadMessageCount(data.count);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    }
    
    if (session?.user?.id) {
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000); // every 30 seconds
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user && session.user.role !== "MENTEE")) {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  }

  if (status === "unauthenticated" || (session?.user && session.user.role !== "MENTEE")) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Search",
      description: `Searching for: ${searchQuery}`,
    })
  }

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "Notification panel coming soon",
    })
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/mentee", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/mentee/profile", icon: User },
    { name: "Find Mentors", href: "/dashboard/mentee/find-mentors", icon: Search },
    { name: "My Mentors", href: "/dashboard/mentee/my-mentors", icon: Users },
    { 
      name: "Sessions", 
      href: "/dashboard/mentee/sessions", 
      icon: Calendar 
    },
    { 
      name: "Messages", 
      href: "/dashboard/mentee/messages", 
      icon: MessageSquare,
      notification: unreadMessageCount > 0 ? unreadMessageCount : undefined
    },
    { 
      name: "Notifications", 
      href: "/dashboard/mentee/notifications", 
      icon: Bell,
      notification: unreadMessageCount > 0 ? unreadMessageCount : undefined},
    { name: "Resources", href: "/dashboard/mentee/resources", icon: BookOpen },
    { name: "Mental Health", href: "/dashboard/mentee/mental-health", icon: Heart },
    { name: "Settings", href: "/dashboard/mentee/settings", icon: Settings },
  ]

  return (
    <SWRConfig>
    <div className="min-h-screen bg-background">
      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-accent"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-xl font-bold">Mentee Dashboard</h1>
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="border-b bg-background">
            <nav className="px-2 py-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="relative">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.notification && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {item.notification}
                        </Badge>
                      )}
                    </div>
                    {item.name}
                  </Link>
                )
              })}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        )}

        {/* This is the important div for rendering children on mobile */}
        <div className="pt-4">
          {children}
        </div>

      </div>

      {/* Desktop view */}
      <div className="hidden md:flex md:h-screen">
        <div className="w-64 flex-shrink-0 border-r bg-background">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold">Mentee Dashboard</h1>
            <NotificationsDropdown />
          </div>
          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          <nav className="flex-1 space-y-1 p-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className="relative">
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.notification && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {item.notification}
                      </Badge>
                    )}
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
    </SWRConfig>
  )
}