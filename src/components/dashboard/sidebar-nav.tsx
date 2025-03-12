"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BookOpen, Calendar, Home, MessageSquare, Search, Settings, User, Users } from "lucide-react"

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Find Mentors",
    href: "/dashboard/mentors",
    icon: Search,
  },
  {
    title: "My Mentors",
    href: "/dashboard/my-mentors",
    icon: Users,
  },
  {
    title: "Sessions",
    href: "/dashboard/sessions",
    icon: Calendar,
  },
  {
    title: "Resources",
    href: "/dashboard/resources",
    icon: BookOpen,
  },
  {
    title: "Mental Health",
    href: "/dashboard/mental-health",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2 py-4">
      {sidebarNavItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

