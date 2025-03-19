// src/app/features/mental-health/page.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Brain, Heart, MessageCircle, Lightbulb, Coffee } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Mental Health Support | MentorBridge",
  description: "Access mental well-being resources and support for your personal and professional growth"
}

export default function MentalHealthPage() {
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
              <h1 className="text-4xl font-bold text-foreground">Mental Health Support</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access tools, resources, and support for your mental well-being. At MentorBridge, we believe 
                that professional growth is deeply connected to personal well-being and mental health.
              </p>
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/register">Get Support</Link>
                </Button>
              </div>
            </div>
            
           {/*  <div className="lg:w-1/2 relative mt-8 lg:mt-0">
              <div className="relative h-[300px] w-full">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Mental health support illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Support Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Wellness Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access our AI-powered chatbot for immediate support, motivation, and guidance with mental health challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Mindfulness Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore guided meditations, breathing exercises, and mindfulness practices to reduce stress and improve focus.
                </p>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Peer Support Network</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connect with peers who understand your challenges and can offer support, encouragement, and shared experiences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Wellness Tips */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Daily Wellness Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Mindful Breathing</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Take 5 minutes to practice deep breathing. Inhale for 4 counts, hold for 4, exhale for 6.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Scheduled Breaks</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Take a 10-minute break every 90 minutes of work to refresh your mind and maintain productivity.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Gratitude Practice</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Write down three things you're grateful for today to boost your mood and positive outlook.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Digital Detox</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Set aside 30 minutes before bed as screen-free time to improve sleep quality and reduce stress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Insights */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Expert Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Managing Career Stress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary">DR</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Dr. Rebecca Johnson</h4>
                    <p className="text-sm text-muted-foreground">Occupational Psychologist</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Recognizing when stress becomes unhealthy is crucial. Look for signs like consistent sleep disruption, 
                  irritability, and decreased productivity. Implement structured breaks and set clear boundaries between 
                  work and personal time."
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Building Resilience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-semibold text-primary">DM</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Dr. Michael Taylor</h4>
                    <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  "Resilience isn't about never experiencing difficulty; it's about how quickly you can recover. 
                  Regular practice of self-compassion, focusing on what's within your control, and maintaining 
                  supportive relationships are key to building professional resilience."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-foreground text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prioritize Your Mental Well-being</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join MentorBridge today and get access to all our mental health resources and support tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-primary text-secondary hover:bg-secondary/70 hover:text-primary">
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-primary text-secondary hover:bg-secondary/70 hover:text-primary">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}