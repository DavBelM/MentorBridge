"use client"

import Link from "next/link"
import { useScroll } from "@/hooks/use-scroll"
/* import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
 */

export function Footer() {
  const { scrollToSection } = useScroll()

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection('about')
  }

  return (
    <footer className="border-t border-border">
      <div className="container mx-auto">
        {/* Main Footer Content */}
        <div className="py-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-foreground mb-2">MentorBridge</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                Connecting Guidance, Growth, and Well-Being for African youth and professionals.
              </p>
            </div>

            {/* Quick Links */}
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link 
                href="#about" 
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Find Mentors
              </Link>
              <Link 
                href="#about" 
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Resources
              </Link>
              <Link 
                href="#about" 
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Mental Health
              </Link>
              <Link 
                href="#about" 
                onClick={handleAboutClick}
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                About Us
              </Link>
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border">
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MentorBridge. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

