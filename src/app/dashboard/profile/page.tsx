import type { Metadata } from "next"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export const metadata: Metadata = {
  title: "Profile | MentorBridge",
  description: "Manage your profile information",
}

export default function ProfilePage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="My Profile" text="Manage your profile information and preferences.">
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </DashboardHeader>

      <div className="grid gap-6">
        <ProfileForm />
      </div>
    </DashboardShell>
  )
}

