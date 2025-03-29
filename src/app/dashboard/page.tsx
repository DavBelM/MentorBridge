"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Debug what's happening
  console.log("Dashboard page session:", session)
  console.log("Session status:", status)
  
  useEffect(() => {
    // Only redirect when session is fully loaded
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role.toLowerCase()
      console.log(`Redirecting to ${role} dashboard from client-side`)
      router.push(`/dashboard/${role}`)
    }
  }, [session, status, router])
  
  // Show loading state while redirecting
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium">Loading your dashboard...</h2>
      <p className="text-muted-foreground mt-2">You'll be redirected momentarily</p>
    </div>
  )
}

