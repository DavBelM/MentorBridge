// src/app/features/resources/page.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BookOpen, Video, FileText, Download, Search, ArrowRight } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Resource Library | MentorBridge",
  description: "Access curated learning materials for skill development and career growth"
}

export default function ResourceLibraryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex flex-col lg:flex-row items-start gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl font-bold text-foreground">Resource Library</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access our comprehensive collection of curated learning materials including e-books, videos, 
                articles, and courses designed to help you develop essential skills and advance your career.
              </p>
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/register">Access Resources</Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative mt-8 lg:mt-0">
              <div className="relative h-[300px] w-full">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Resource library illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Resource Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src="/placeholder.svg?height=160&width=320"
                  alt="E-books"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  E-Books & Guides
                </CardTitle>
                <CardDescription>
                  Comprehensive guides on career development, skills, and industry knowledge
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources/ebooks">Explore E-Books</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src="/placeholder.svg?height=160&width=320"
                  alt="Videos"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                  Video Tutorials
                </CardTitle>
                <CardDescription>
                  Video courses and tutorials on technical skills and soft skills development
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources/videos">Explore Videos</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-40 w-full">
                <Image
                  src="/placeholder.svg?height=160&width=320"
                  alt="Articles"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Articles & Research
                </CardTitle>
                <CardDescription>
                  Latest articles, research papers, and industry insights
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources/articles">Explore Articles</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Career Mapping Guide</CardTitle>
                <CardDescription>Learn how to strategically plan your career path</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <BookOpen className="h-4 w-4" />
                  <span>E-Book • 45 pages</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A comprehensive guide to mapping out your career goals, identifying skills gaps, and creating
                  an actionable plan for professional growth.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/resources/career-mapping">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Interview Preparation</CardTitle>
                <CardDescription>Ace your next technical interview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Video className="h-4 w-4" />
                  <span>Video Series • 8 episodes</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  A series of video tutorials covering common technical interview questions, 
                  problem-solving strategies, and tips from industry experts.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/resources/tech-interview">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Series
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Soft Skills for Leadership</CardTitle>
                <CardDescription>Develop essential leadership skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <FileText className="h-4 w-4" />
                  <span>Article Series • 5 parts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  An in-depth exploration of key soft skills required for effective leadership, 
                  including communication, emotional intelligence, and conflict resolution.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/resources/leadership-skills">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Series
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/resources/all">View All Resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Search Resources */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Find Resources</h2>
            <p className="text-muted-foreground mb-8">
              Search our extensive library of resources to find exactly what you need for your learning journey.
            </p>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search for resources..." 
                  className="w-full rounded-md border border-input bg-background px-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button>Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-foreground text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Access Our Resource Library?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join MentorBridge today and get unlimited access to our comprehensive resource library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-primary text-secondary hover:bg-secondary/70 hover:text-primary">
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-primary text-secondary hover:bg-secondary/70">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}