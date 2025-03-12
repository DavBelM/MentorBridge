import type { Metadata } from "next"
import Link from "next/link"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Clock, Globe, Mail, MapPin, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Mentor Profile | MentorBridge",
  description: "View mentor profile and request mentorship",
}

export default function MentorProfilePage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch the mentor data based on the ID
  const mentor = {
    id: params.id,
    name: "Sarah Johnson",
    role: "Senior Software Engineer",
    company: "Google",
    location: "Nairobi, Kenya",
    bio: "Experienced software engineer with expertise in web development, React, and Node.js. Passionate about mentoring junior developers and helping them grow in their careers.",
    about:
      "I've been working in software development for over 8 years, with a focus on frontend technologies. I started my career as a self-taught developer and worked my way up to senior positions at major tech companies. I'm passionate about clean code, accessibility, and mentoring the next generation of developers.",
    expertise: ["Web Development", "React", "Node.js", "JavaScript", "TypeScript", "Frontend Architecture"],
    education: [
      {
        degree: "MSc Computer Science",
        institution: "University of Nairobi",
        year: "2018",
      },
      {
        degree: "BSc Computer Science",
        institution: "Kenyatta University",
        year: "2015",
      },
    ],
    experience: [
      {
        role: "Senior Software Engineer",
        company: "Google",
        duration: "2020 - Present",
      },
      {
        role: "Software Engineer",
        company: "Microsoft",
        duration: "2017 - 2020",
      },
      {
        role: "Junior Developer",
        company: "Local Tech Startup",
        duration: "2015 - 2017",
      },
    ],
    mentorshipAreas: [
      "Career guidance for junior developers",
      "Technical skill development in frontend technologies",
      "Interview preparation and resume review",
      "Work-life balance and preventing burnout",
    ],
    availability: [
      { day: "Monday", time: "6:00 PM - 8:00 PM" },
      { day: "Wednesday", time: "6:00 PM - 8:00 PM" },
      { day: "Saturday", time: "10:00 AM - 12:00 PM" },
    ],
    rating: 4.9,
    reviews: 24,
    email: "sarah.johnson@example.com",
    website: "https://sarahjohnson.dev",
    avatar: "/placeholder.svg?height=120&width=120",
    initials: "SJ",
  }

  return (
    <DashboardShell>
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/mentors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mentors
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={mentor.avatar} alt={mentor.name} />
                  <AvatarFallback>{mentor.initials}</AvatarFallback>
                </Avatar>

                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 font-medium">{mentor.rating}</span>
                  <span className="text-sm text-muted-foreground ml-1">({mentor.reviews} reviews)</span>
                </div>

                <Button className="w-full md:w-auto">Request Mentorship</Button>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{mentor.name}</h1>
                <p className="text-muted-foreground">
                  {mentor.role} at {mentor.company}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {mentor.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-1 h-4 w-4" />
                    {mentor.email}
                  </div>
                  {mentor.website && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="mr-1 h-4 w-4" />
                      <a href={mentor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Personal Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-sm">{mentor.bio}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about">
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="experience">Experience</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {mentor.name}</CardTitle>
                <CardDescription>Learn more about {mentor.name}'s background and expertise.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Professional Background</h3>
                  <p className="text-sm">{mentor.about}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Education</h3>
                  <div className="space-y-2">
                    {mentor.education.map((edu, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-muted-foreground">
                          {edu.institution}, {edu.year}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience">
            <Card>
              <CardHeader>
                <CardTitle>Professional Experience</CardTitle>
                <CardDescription>{mentor.name}'s work history and professional journey.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentor.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-primary/20 pl-4 pb-4">
                      <h3 className="font-medium">{exp.role}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.duration}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mentorship">
            <Card>
              <CardHeader>
                <CardTitle>Mentorship Areas</CardTitle>
                <CardDescription>Topics and areas {mentor.name} can help you with.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mentor.mentorshipAreas.map((area, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-sm">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <Card>
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>{mentor.name}'s available time slots for mentorship sessions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mentor.availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{slot.day}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{slot.time}</span>
                      </div>
                      <Button size="sm">Book Session</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}

