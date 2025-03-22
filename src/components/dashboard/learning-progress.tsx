"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function LearningProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Web Development</div>
              <div className="text-sm text-muted-foreground">65%</div>
            </div>
            <Progress value={65} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">UI/UX Design</div>
              <div className="text-sm text-muted-foreground">42%</div>
            </div>
            <Progress value={42} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Database Management</div>
              <div className="text-sm text-muted-foreground">28%</div>
            </div>
            <Progress value={28} className="h-2" />
          </div>
          
          <div className="mt-4 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Overall Progress</div>
              <div className="text-sm font-medium">45%</div>
            </div>
            <Progress value={45} className="h-3 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}