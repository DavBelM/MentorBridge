import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Brain, Users } from "lucide-react"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Connecting Guidance, Growth, and Well-Being
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Empowering African youth through mentorship, skill development, and mental health support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative h-[400px] w-full">
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="Mentorship illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
              <p className="text-3xl font-bold">56%</p>
              <p className="text-sm mt-2 text-primary-foreground/90">of Black youth wished they had a mentor but did not have one</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
              <p className="text-3xl font-bold">50%</p>
              <p className="text-sm mt-2 text-primary-foreground/90">increase in mentorship opportunities within the first year</p>
            </div>
            <div className="bg-background/10 backdrop-blur-sm p-6 rounded-lg">
              <p className="text-3xl font-bold">40%</p>
              <p className="text-sm mt-2 text-primary-foreground/90">improvement in skill proficiency after six months</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="about" 
        className="py-20 bg-background dark:bg-background scroll-mt-16"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">How MentorBridge Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">

            MentorBridge is a comprehensive platform designed to empower African youth through three key pillars: 
        professional mentorship, skill development, and mental well-being support. We connect ambitious 
        young professionals with experienced mentors who understand their journey and can guide their growth.            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mentor Matching</h3>
              <p className="text-muted-foreground mb-4">
                Connect with experienced mentors tailored to your career goals, interests, and aspirations.
              </p>
              <Link href="/features/mentorship" className="text-primary flex items-center gap-1 font-medium">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Resource Library</h3>
              <p className="text-muted-foreground mb-4">
                Access curated learning materials including e-books, videos, and articles for skill development.
              </p>
              <Link href="/features/resources" className="text-primary flex items-center gap-1 font-medium">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mental Health Support</h3>
              <p className="text-muted-foreground mb-4">
                Get motivational content and AI-powered chatbot support for your mental well-being.
              </p>
              <Link href="/features/mental-health" className="text-primary flex items-center gap-1 font-medium">
                Learn more <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from mentees and mentors who have experienced the power of MentorBridge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold text-primary">JD</span>
                </div>
                <div>
                  <h4 className="font-semibold">John Doe</h4>
                  <p className="text-sm text-muted-foreground">Software Developer Mentee</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">
                "MentorBridge connected me with a senior developer who helped me navigate my career path. The resources
                and support have been invaluable to my growth."
              </p>
            </div>

            <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-semibold text-primary">JS</span>
                </div>
                <div>
                  <h4 className="font-semibold">Jane Smith</h4>
                  <p className="text-sm text-muted-foreground">Business Mentor</p>
                </div>
              </div>
              <p className="italic text-muted-foreground">
                "As a mentor on MentorBridge, I've been able to give back to my community and help shape the next
                generation of business leaders in Africa."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join MentorBridge today and connect with mentors who can help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

