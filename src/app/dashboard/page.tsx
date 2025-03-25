"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  // Redirect based on user role
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'MENTOR') {
        router.push('/dashboard/mentor')
      } else if (user.role === 'MENTEE') {
        router.push('/dashboard/mentee')
      }
      // If neither, they'll stay on the generic dashboard
    }
  }, [user, isLoading, router])
  
  // Show loading state while redirecting
  if (isLoading || (user && (user.role === 'MENTOR' || user.role === 'MENTEE'))) {
    return <DashboardSkeleton />
  }
  
  // Fallback generic dashboard for users without specific roles
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome to MentorBridge</h1>
      <p className="text-muted-foreground mb-6">
        Please complete your profile setup to access role-specific features.
      </p>
    </div>
  )
}

