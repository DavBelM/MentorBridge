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
  Users,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { signOut } from "next-auth/react"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Only redirect if session is loaded AND user is not admin
    if (session && session.user && session.user.role !== "ADMIN") {
      console.log("Non-admin tried to access admin dashboard:", session.user)
      router.push("/dashboard")
    }
  }, [session, router])

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  if (!session?.user || session.user.role !== "ADMIN") {
    return null
  }

  const navigation = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Mentor Approval", href: "/dashboard/admin/mentor-approval-list", icon: UserCheck },
    { name: "Platform Settings", href: "/dashboard/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-accent"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>
        
        {/* Mobile navigation menu with smooth transition */}
        <div 
          className={cn(
            "border-b bg-background overflow-hidden transition-all duration-200 ease-in-out",
            isMobileMenuOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <nav className="px-2 py-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-md",
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
              className="flex items-center w-full px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block md:w-64 md:flex-shrink-0 md:border-r bg-background">
        <div className="flex h-16 items-center px-4 border-b">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
        <main className="p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}