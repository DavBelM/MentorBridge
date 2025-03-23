// src/components/dashboard/mobile-nav.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { 
  Menu, 
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

export function MobileNav() {
  const [open, setOpen] = useState(false)
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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="py-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl">MentorBridge</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 flex flex-col h-full">
          {navItems
            .filter(item => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
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
            
          <Button 
            variant="ghost" 
            className="justify-start gap-3 mt-auto" 
            onClick={() => {
              logout();
              setOpen(false);
            }}
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}