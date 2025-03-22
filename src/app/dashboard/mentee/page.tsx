"use client"

import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentMentors } from "@/components/dashboard/recent-mentors"
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions"
import { RecommendedResources } from "@/components/dashboard/recommended-resources"
import { MentalHealthWidget } from "@/components/dashboard/mental-health-widget"
import { LearningProgress } from "@/components/dashboard/learning-progress"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function MenteeDashboardPage() {
  return (
    <ProtectedRoute requireProfile={true} allowedRoles={["mentee"]}>
      <DashboardShell>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardTransition>
            <DashboardHeader 
              heading="Mentee Dashboard" 
              text="Connect with mentors and track your learning journey." 
            />

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
              
              <LearningProgress />
            </div>
          </DashboardTransition>
        </Suspense>
      </DashboardShell>
    </ProtectedRoute>
  )
}