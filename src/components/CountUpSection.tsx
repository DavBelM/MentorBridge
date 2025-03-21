"use client"

import { OptimizedCountUp } from "../components/ui/count-up"

export default function CountUpSection() {
  return (
    <div className="container mx-auto px-4 mt-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-primary text-secondary backdrop-blur-sm p-6 rounded-lg">
          <p className="text-3xl font-bold">
            <OptimizedCountUp end={56} duration={3} suffix="%" />
          </p>
          <p className="text-sm mt-2 text-primary-foreground/90">of Black youth wished they had a mentor but did not have one</p>
        </div>
        <div className="bg-primary text-secondary backdrop-blur-sm p-6 rounded-lg">
          <p className="text-3xl font-bold">
            <OptimizedCountUp end={50} duration={3} suffix="%" />
          </p>
          <p className="text-sm mt-2 text-primary-foreground/90">increase in mentorship opportunities within the first year</p>
        </div>
        <div className="bg-primary text-secondary backdrop-blur-sm p-6 rounded-lg">
          <p className="text-3xl font-bold">
            <OptimizedCountUp end={40} duration={3} suffix="%" />
          </p>
          <p className="text-sm mt-2 text-primary-foreground/90">improvement in skill proficiency after six months</p>
        </div>
      </div>
    </div>
  )
}