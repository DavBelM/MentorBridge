// src/components/dashboard/sidebar.tsx
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Settings,
  User,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  
  const isMentor = user?.role === "MENTOR"
  const isMentee = user?.role === "MENTEE"
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      show: true
    },
    {
      title: "My Mentees",
      href: "/dashboard/mentees",
      icon: Users,
      show: isMentor
    },
    {
      title: "My Mentors",
      href: "/dashboard/mentors",
      icon: Users,
      show: isMentee
    },
    {
      title: "Sessions",
      href: "/dashboard/sessions",
      icon: Calendar,
      show: true
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      show: true
    },
    {
      title: "Resources",
      href: "/dashboard/resources",
      icon: BookOpen,
      show: true
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
      show: true
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      show: true
    }
  ]
  
  return (
    <aside className="w-64 border-r min-h-[calc(100vh-64px)] p-4 flex flex-col">
      <div className="space-y-1 flex-1">
        {navItems
          .filter(item => item.show)
          .map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
            >
              <item.icon size={18} />
              {item.title}
            </Link>
          ))}
      </div>
      
      <Button 
        variant="ghost" 
        className="justify-start gap-3 mt-auto" 
        onClick={logout}
      >
        <LogOut size={18} />
        Sign Out
      </Button>
    </aside>
  )
}