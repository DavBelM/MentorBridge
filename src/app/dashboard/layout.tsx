import type { Metadata } from "next"
import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";

export const metadata: Metadata = {
  title: "Dashboard | MentorBridge",
  description: "Manage your mentorship journey and access resources.",
}

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}