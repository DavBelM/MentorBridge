import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentMentors } from "@/components/dashboard/recent-mentors"
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions"
import { RecommendedResources } from "@/components/dashboard/recommended-resources"
import { MentalHealthWidget } from "@/components/dashboard/mental-health-widget"

export const metadata: Metadata = {
  title: "Dashboard | MentorBridge",
  description: "Manage your mentorship journey and access resources.",
}

export default function DashboardPage() {
  return (
    <DashboardShell>
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
    </DashboardShell>
  )
}

