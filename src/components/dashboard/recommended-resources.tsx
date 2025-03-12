import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, Video } from "lucide-react"

export function RecommendedResources() {
  // This would typically come from an API or database
  const resources = [
    {
      id: "1",
      title: "Introduction to Web Development",
      type: "video",
      duration: "45 min",
      author: "Sarah Johnson",
      icon: Video,
    },
    {
      id: "2",
      title: "Product Management Fundamentals",
      type: "ebook",
      pages: "120 pages",
      author: "Michael Chen",
      icon: BookOpen,
    },
    {
      id: "3",
      title: "Data Science for Beginners",
      type: "article",
      readTime: "15 min read",
      author: "Amara Okafor",
      icon: FileText,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Resources</CardTitle>
        <CardDescription>Curated learning materials based on your interests.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => {
            const Icon = resource.icon
            return (
              <div key={resource.id} className="flex items-start space-x-4">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{resource.title}</h4>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{resource.type}</span>
                    <span className="mx-2">•</span>
                    <span>{resource.duration || resource.pages || resource.readTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">By {resource.author}</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/dashboard/resources/${resource.id}`}>View</Link>
                </Button>
              </div>
            )
          })}
        </div>
        <div className="mt-4 text-center">
          <Button asChild variant="link" className="text-sm">
            <Link href="/dashboard/resources">Browse All Resources</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

