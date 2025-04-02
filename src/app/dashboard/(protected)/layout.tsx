import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default function ProtectedDashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}