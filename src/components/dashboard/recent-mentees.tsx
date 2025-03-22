"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

// Mock data for development
const mentees = [
  { id: 1, name: "Jamie Smith", role: "Junior Developer", avatar: "/avatars/jamie.jpg" },
  { id: 2, name: "Taylor Williams", role: "Student", avatar: "/avatars/taylor.jpg" },
  { id: 3, name: "Jordan Brown", role: "Career Changer", avatar: "/avatars/jordan.jpg" },
]

export function RecentMentees() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Mentees</CardTitle>
        <CardDescription>Mentees you're currently working with.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mentees.length > 0 ? (
          <>
            {mentees.map((mentee) => (
              <div key={mentee.id} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={mentee.avatar} alt={mentee.name} />
                    <AvatarFallback>{mentee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{mentee.name}</p>
                    <p className="text-sm text-muted-foreground">{mentee.role}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Message
                </Button>
              </div>
            ))}
            <div className="mt-4 text-center">
              <Button asChild variant="link">
                <Link href="/dashboard/mentees">View all mentees</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-muted-foreground">
            No active mentees yet.
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/mentees/find">
                  Find mentees
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}