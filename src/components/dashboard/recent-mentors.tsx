import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentMentors() {
  // This would typically come from an API or database
  const mentors = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Software Engineer",
      company: "Google",
      expertise: ["Web Development", "React", "Node.js"],
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SJ",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      expertise: ["Product Strategy", "UX Design", "Agile"],
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MC",
    },
    {
      id: "3",
      name: "Amara Okafor",
      role: "Data Scientist",
      company: "IBM",
      expertise: ["Machine Learning", "Python", "Data Analysis"],
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AO",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Mentors</CardTitle>
        <CardDescription>Connect with your mentors and schedule sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={mentor.avatar} alt={mentor.name} />
                  <AvatarFallback>{mentor.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{mentor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {mentor.role} at {mentor.company}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/dashboard/mentors/${mentor.id}`}>View Profile</Link>
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="link" className="text-sm">
            <Link href="/dashboard/mentors">View All Mentors</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

