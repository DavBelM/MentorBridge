import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

export function MentorList() {
  // This would typically come from an API or database
  const mentors = [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Senior Software Engineer",
      company: "Google",
      location: "Nairobi, Kenya",
      bio: "Experienced software engineer with expertise in web development, React, and Node.js. Passionate about mentoring junior developers.",
      expertise: ["Web Development", "React", "Node.js"],
      rating: 4.9,
      reviews: 24,
      avatar: "/placeholder.svg?height=80&width=80",
      initials: "SJ",
    },
    {
      id: "2",
      name: "Michael Chen",
      role: "Product Manager",
      company: "Microsoft",
      location: "Lagos, Nigeria",
      bio: "Product manager with 8+ years of experience in tech. Specializing in product strategy, UX design, and agile methodologies.",
      expertise: ["Product Strategy", "UX Design", "Agile"],
      rating: 4.7,
      reviews: 18,
      avatar: "/placeholder.svg?height=80&width=80",
      initials: "MC",
    },
    {
      id: "3",
      name: "Amara Okafor",
      role: "Data Scientist",
      company: "IBM",
      location: "Accra, Ghana",
      bio: "Data scientist with a background in machine learning and AI. Helping mentees navigate the world of data and analytics.",
      expertise: ["Machine Learning", "Python", "Data Analysis"],
      rating: 4.8,
      reviews: 15,
      avatar: "/placeholder.svg?height=80&width=80",
      initials: "AO",
    },
    {
      id: "4",
      name: "David Nkosi",
      role: "UX/UI Designer",
      company: "Adobe",
      location: "Johannesburg, South Africa",
      bio: "Creative designer with a passion for user-centered design. Specializing in UI/UX, design systems, and brand identity.",
      expertise: ["UI/UX Design", "Figma", "Design Systems"],
      rating: 4.6,
      reviews: 12,
      avatar: "/placeholder.svg?height=80&width=80",
      initials: "DN",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mentors.map((mentor) => (
        <Card key={mentor.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mentor.avatar} alt={mentor.name} />
                  <AvatarFallback>{mentor.initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{mentor.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {mentor.role} at {mentor.company}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{mentor.location}</p>
                    </div>

                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm font-medium">{mentor.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({mentor.reviews} reviews)</span>
                    </div>
                  </div>

                  <p className="text-sm mt-3">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 bg-muted/30 flex justify-between items-center">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/mentors/${mentor.id}`}>View Profile</Link>
              </Button>
              <Button>Request Mentorship</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

