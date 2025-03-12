import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Video } from "lucide-react"

export function UpcomingSessions() {
  // This would typically come from an API or database
  const sessions = [
    {
      id: "1",
      mentor: "Sarah Johnson",
      date: "March 15, 2025",
      time: "10:00 AM - 11:00 AM",
      topic: "Career Development",
      platform: "Zoom",
    },
    {
      id: "2",
      mentor: "Michael Chen",
      date: "March 18, 2025",
      time: "2:00 PM - 3:00 PM",
      topic: "Product Management Basics",
      platform: "Google Meet",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>Your scheduled mentorship sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{session.topic}</h4>
                <Badge variant="outline">{session.platform}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">with {session.mentor}</p>
              <div className="flex items-center text-xs text-muted-foreground space-x-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  {session.date}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {session.time}
                </div>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button size="sm" className="w-full">
                  <Video className="mr-2 h-4 w-4" /> Join
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/sessions/${session.id}`}>Details</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="link" className="text-sm">
            <Link href="/dashboard/sessions">View All Sessions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

