"use client"

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
  Brain,
  Settings,
  LogOut,
} from "lucide-react"
import { signOut } from "next-auth/react"

export default function MenteeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (!session?.user || session.user.role !== "MENTEE") {
    router.push("/login")
    return null
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/mentee", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/mentee/profile", icon: User },
    { name: "My Mentors", href: "/dashboard/mentee/mentors", icon: Users },
    { name: "Sessions", href: "/dashboard/mentee/sessions", icon: Calendar },
    { name: "Messages", href: "/dashboard/mentee/messages", icon: MessageSquare },
    { name: "Resources", href: "/dashboard/mentee/resources", icon: BookOpen },
    { name: "Mental Health", href: "/dashboard/mentee/mental-health", icon: Brain },
    { name: "Settings", href: "/dashboard/mentee/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r bg-background">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <h1 className="text-xl font-bold">MentorBridge</h1>
              </div>
              <nav className="mt-5 flex-1 space-y-1 bg-background px-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          isActive
                            ? "text-primary-foreground"
                            : "text-muted-foreground group-hover:text-accent-foreground"
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t p-4">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="group block w-full flex-shrink-0"
              >
                <div className="flex items-center">
                  <div>
                    <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-accent-foreground">
                      Logout
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
} 