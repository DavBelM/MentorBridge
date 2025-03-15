import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MentalHealthLoading() {
  return (
    <DashboardShell>
      <div className="grid gap-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-[220px]" />
          <Skeleton className="h-4 w-[320px]" />
        </div>

        {/* Chat Interface Skeleton */}
        <Card className="h-[calc(100vh-250px)]">
          <div className="p-6 flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full mr-2" />}
                  <Skeleton className="h-12 w-[60%] rounded-lg" />
                  {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full ml-2" />}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  )
} 