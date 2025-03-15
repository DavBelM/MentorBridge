import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MentorsLoading() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[180px]" />
          <Skeleton className="h-4 w-[280px]" />
        </div>

        {/* Search Bar Skeleton */}
        <Card className="p-4">
          <div className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </Card>

        {/* Mentors Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-[80%]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
} 