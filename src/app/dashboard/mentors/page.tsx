import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { MentorSearch } from "@/components/dashboard/mentor-search"
import { MentorList } from "@/components/dashboard/mentor-list"

export const metadata: Metadata = {
  title: "Find Mentors | MentorBridge",
  description: "Search and connect with mentors in your field",
}

export default function MentorsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Find Mentors" text="Search and connect with mentors in your field." />

      <div className="grid gap-6">
        <MentorSearch />
        <MentorList />
      </div>
    </DashboardShell>
  )
}

