"use client"
import { useScroll } from "@/hooks/use-scroll"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollToSection } = useScroll()
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection('about')
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <Link href={isDashboard ? "/dashboard" : "/"} className="font-bold text-xl text-primary">
            MentorBridge
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {!isDashboard && (
            <>
              <Link href="/#about" onClick={handleAboutClick} className="text-sm font-medium hover:text-primary transition-colors">
                Find Mentors
              </Link>
              <Link href="/#about" onClick={handleAboutClick} className="text-sm font-medium hover:text-primary transition-colors">
                Resources
              </Link>
              <Link href="/#about" onClick={handleAboutClick} className="text-sm font-medium hover:text-primary transition-colors">
                Mental Health
              </Link>
              <Link href="#about" onClick={handleAboutClick} className="text-sm font-medium hover:text-primary transition-colors">
                About Us
              </Link>
            </>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          {isDashboard ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "absolute left-0 right-0 top-16 bg-background border-b border-border md:hidden",
            isMenuOpen ? "block" : "hidden"
          )}
        >
          <nav className="flex flex-col gap-6 p-6">
            {isDashboard ? (
              <>
                <Link href="/dashboard/profile" className="text-lg font-medium hover:text-primary transition-colors">
                  Profile
                </Link>
                <Button variant="outline" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/mentors" className="text-lg font-medium hover:text-primary transition-colors">
                  Find Mentors
                </Link>
                <Link href="/resources" className="text-lg font-medium hover:text-primary transition-colors">
                  Resources
                </Link>
                <Link href="/mental-health" className="text-lg font-medium hover:text-primary transition-colors">
                  Mental Health
                </Link>
                <Link href="#about" className="text-lg font-medium hover:text-primary transition-colors">
                  About Us
                </Link>
                <div className="flex flex-col gap-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

