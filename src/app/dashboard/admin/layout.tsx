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
    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/login")
    }
  }, [session, router])

  if (!session?.user || session.user.role !== "ADMIN") {
    return null
  }

  const navigation = [
    { name: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { name: "Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Mentor Approval", href: "/dashboard/admin/mentor-approval", icon: UserCheck },
    { name: "Platform Settings", href: "/dashboard/admin/settings", icon: Settings },
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
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
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
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 