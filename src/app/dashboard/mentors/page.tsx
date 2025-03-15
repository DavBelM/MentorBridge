import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MentorSearch } from "@/components/dashboard/mentor-search"
import { MentorList } from "@/components/dashboard/mentor-list"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export const metadata: Metadata = {
  title: "Find Mentors | MentorBridge",
  description: "Search and connect with mentors in your field",
}

export default function MentorsPage() {
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTransition>
          <DashboardHeader 
            heading="Find Mentors" 
            text="Search and connect with mentors in your field." 
          />

          <div className="grid gap-6">
            <MentorSearch />
            <MentorList />
          </div>
        </DashboardTransition>
      </Suspense>
    </DashboardShell>
  )
}

