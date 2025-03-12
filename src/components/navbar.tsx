"use client"
import { useScroll } from "@/hooks/use-scroll"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl text-primary">
            MentorBridge
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            Find Mentors
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            Resources
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
            Mental Health
          </Link>
          <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle Menu">
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-0 top-16 z-50 bg-background border-t border-border md:hidden",
            isMenuOpen ? "block" : "hidden",
          )}
        >
          <nav className="flex flex-col gap-6 p-6">
            <Link
              href="/mentors"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Mentors
            </Link>
            <Link
              href="/resources"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </Link>
            <Link
              href="/mental-health"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Mental Health
            </Link>
            <Link
              href="/about"
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="flex flex-col gap-4 mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

