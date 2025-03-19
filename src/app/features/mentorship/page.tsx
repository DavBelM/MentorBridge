// src/app/features/mentorship/page.tsx
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Search, Users, Calendar, Award, ArrowRight } from "lucide-react"
import Image from "next/image"

export const metadata = {
  title: "Mentor Matching | MentorBridge",
  description: "Connect with experienced mentors tailored to your career goals and aspirations"
}

export default function MentorMatchingPage() {
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
              <h1 className="text-4xl font-bold text-foreground">Mentor Matching</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Our intelligent matching system connects you with experienced mentors who align with your 
                career goals, interests, and aspirations. Build meaningful professional relationships 
                that foster growth and development.
              </p>
              <div className="pt-4">
                <Button asChild size="lg">
                  <Link href="/register">Find Your Mentor</Link>
                </Button>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative mt-8 lg:mt-0">
              <div className="relative h-[300px] w-full">
                <Image
                  src="/placeholder.svg?height=300&width=500"
                  alt="Mentor matching illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">How Mentor Matching Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Complete Your Profile</h3>
              <p className="text-muted-foreground">
                Tell us about your career goals, interests, and the specific areas where you seek guidance.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Get Matched</h3>
              <p className="text-muted-foreground">
                Our algorithm recommends mentors based on expertise, experience, and compatibility with your needs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Connect & Grow</h3>
              <p className="text-muted-foreground">
                Schedule sessions, set goals, and collaborate with your mentor to achieve professional growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Benefits of Mentor Matching</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Personalized Guidance</h3>
                  <p className="text-muted-foreground">
                    Receive tailored advice and support from mentors who understand your specific challenges and aspirations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Expanded Network</h3>
                  <p className="text-muted-foreground">
                    Build valuable connections within your industry and access opportunities through your mentor's network.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Accelerated Growth</h3>
                  <p className="text-muted-foreground">
                    Progress faster in your career by learning from your mentor's experiences and avoiding common pitfalls.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Accountability</h3>
                  <p className="text-muted-foreground">
                    Stay on track with your professional development goals through regular check-ins and milestone tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Mentor?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join MentorBridge today and start your journey toward professional growth with the guidance of experienced mentors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Sign Up Now</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="border-primary-foreground hover:text-primary">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">How do you match mentors and mentees?</h3>
              <p className="text-muted-foreground">
                We use a combination of AI algorithms and human review to match mentees with mentors based on career field, 
                expertise, goals, and personality compatibility factors.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">How often should I meet with my mentor?</h3>
              <p className="text-muted-foreground">
                We recommend meeting at least once every two weeks, but the frequency can be adjusted based on your needs 
                and your mentor's availability.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Can I change mentors if the match isn't working out?</h3>
              <p className="text-muted-foreground">
                Yes, we understand that not every match will be perfect. You can request a new mentor through your dashboard 
                at any time.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Is there a cost to being matched with a mentor?</h3>
              <p className="text-muted-foreground">
                MentorBridge offers both free and premium matching options. Our basic matching is complimentary, while premium 
                matching provides additional features and benefits for a monthly subscription.
              </p>
            </div>
          </div>
          
         {/*  <div className="text-center mt-12">
            <Link href="/faqs" className="text-primary flex items-center gap-1 justify-center font-medium">
              View all FAQs <ArrowRight className="h-4 w-4" />
            </Link>
          </div> */}
        </div>
      </section>
    </div>
  )
}