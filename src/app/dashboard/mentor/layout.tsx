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
  Bell,
  Search
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function MentorDashboardLayout({
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
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New mentee request from John Doe", read: false },
    { id: 2, message: "Upcoming session with Jane Smith", read: false },
  ])

  useEffect(() => {
    console.log("Dashboard layout - session:", session)
    
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [session, status, router])
  
  if (status === "loading") {
    return <div>Loading...</div>
  }
  
  if (!session) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    toast({
      title: "Search",
      description: `Searching for: ${searchQuery}`,
    })
  }

  const handleNotificationClick = () => {
    // Implement notification panel
    toast({
      title: "Notifications",
      description: "Notification panel coming soon",
    })
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/mentor", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/mentor/profile", icon: User },
    { name: "My Mentees", href: "/dashboard/mentor/mentees", icon: Users },
    { name: "Sessions", href: "/dashboard/mentor/sessions", icon: Calendar },
    { name: "Messages", href: "/dashboard/mentor/messages", icon: MessageSquare },
    { name: "Resources", href: "/dashboard/mentor/resources", icon: BookOpen },
    { name: "Mental Health", href: "/dashboard/mentor/mental-health", icon: Heart },
    { name: "Settings", href: "/dashboard/mentor/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
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
          <h1 className="text-xl font-bold">Mentor Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </Button>
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
                    <item.icon className="mr-3 h-5 w-5" />
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
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex md:h-screen">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r bg-background">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <h1 className="text-xl font-bold">Mentor Dashboard</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            </Button>
          </div>
          <div className="p-4 border-b">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
                  <item.icon className="mr-3 h-5 w-5" />
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

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}