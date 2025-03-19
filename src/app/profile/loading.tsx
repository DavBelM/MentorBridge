import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-[150px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <Skeleton className="h-9 w-[120px]" />
        </div>

        {/* Profile Form Skeleton */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <Skeleton className="h-9 w-[120px]" />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            {/* Save Button */}
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
} 