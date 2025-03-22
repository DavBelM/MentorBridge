"use client"

import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentMentees } from "@/components/dashboard/recent-mentees"
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions"
import { RecommendedResources } from "@/components/dashboard/recommended-resources"
import { MentalHealthWidget } from "@/components/dashboard/mental-health-widget"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MentorDashboardPage() {
  return (
    <ProtectedRoute requireProfile={true} allowedRoles={["mentor"]}>
      <DashboardShell>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTransition>
            <DashboardHeader 
              heading="Mentor Dashboard" 
              text="Manage your mentees and track your mentoring progress." 
            />

            <div className="grid gap-6">
              <DashboardStats />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentMentees />
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