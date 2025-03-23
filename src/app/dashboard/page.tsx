"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentMentors } from "@/components/dashboard/recent-mentors"
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions"
import { RecommendedResources } from "@/components/dashboard/recommended-resources"
import { MentalHealthWidget } from "@/components/dashboard/mental-health-widget"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ProtectedRoute } from "@/components/auth/protected-route"

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
  
  // If we're in the process of redirecting or loading user data,
  // show a loading state
  if (isLoading || (user && (user.role === 'MENTOR' || user.role === 'MENTEE'))) {
    return (
      <ProtectedRoute requireProfile={true}>
        <DashboardShell>
          <DashboardSkeleton />
        </DashboardShell>
      </ProtectedRoute>
    )
  }
  
  // If no role-specific redirection applies, show the generic dashboard
  return (
    <ProtectedRoute requireProfile={true}>
      <DashboardShell>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTransition>
            <DashboardHeader heading="Dashboard" text="Manage your mentorship journey and access resources." />

            <div className="grid gap-6">
              <DashboardStats />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentMentors />
                <UpcomingSessions />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <RecommendedResources />
                </div>
                <div>
                  <MentalHealthWidget />
                </div>
              </div>
            </div>
          </DashboardTransition>
        </Suspense>
      </DashboardShell>
    </ProtectedRoute>
  )
}

