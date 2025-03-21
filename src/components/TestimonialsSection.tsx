import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function TestimonialsSection() {
  return (
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
                <h4 className="font-semibold">Nick Lemy</h4>
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
                <h4 className="font-semibold">James Jok</h4>
                <p className="text-sm text-muted-foreground">Software Engineer Mentee</p>
              </div>
            </div>
            <p className="italic text-muted-foreground">
              "As a student who was struggling to find my path, MentorBridge connected me with a mentor who helped me
              gain clarity and confidence in my career goals."
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}