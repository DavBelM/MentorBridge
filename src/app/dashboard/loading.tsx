import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-8 w-[100px] mb-2" />
              <Skeleton className="h-6 w-[60px]" />
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <Skeleton className="h-8 w-[140px] mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <Skeleton className="h-8 w-[140px] mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
} 