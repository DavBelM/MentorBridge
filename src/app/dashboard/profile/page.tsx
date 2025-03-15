import type { Metadata } from "next"
import { Suspense } from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useChat } from "ai/react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain, Send } from "lucide-react"
import { DashboardTransition } from "@/components/dashboard/dashboard-transition"
import { motion } from "framer-motion"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

export const metadata: Metadata = {
  title: "Profile | MentorBridge",
  description: "Manage your profile information",
}

export default function ProfilePage() {
  return (
    <DashboardShell>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardTransition>
          <DashboardHeader 
            heading="My Profile" 
            text="Manage your profile information and preferences."
          >
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </DashboardHeader>

          <div className="grid gap-6">
            <ProfileForm />
          </div>
        </DashboardTransition>
      </Suspense>
    </DashboardShell>
  )
}

