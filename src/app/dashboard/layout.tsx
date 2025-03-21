import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | MentorBridge",
  description: "Manage your mentorship journey and access resources.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}