// src/components/navbar.tsx
"use client"
import { useScroll } from "@/hooks/use-scroll"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollToSection } = useScroll()
  const pathname = usePathname() || ''
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isProfileSetup = pathname.startsWith('/profile/setup')
  
  // For profile setup, render a minimal header
  if (isProfileSetup) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl text-primary">
              MentorBridge
            </Link>
          </div>
          <ModeToggle />
        </div>
      </header>
    )
  }
  
  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection('about')
    setIsMenuOpen(false)
  }
  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <Link href={isDashboard ? "/dashboard" : "/"} className="font-bold text-xl text-primary hover:text-primary/80 transition-colors">
            MentorBridge
          </Link>
        </div>

        {/* Desktop Navigation - Only show full nav if not on auth pages */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <>
                <Link href="/features/mentorship" className="text-sm font-medium hover:text-primary transition-colors">
                  Find Mentors
                </Link>
                
                <Link href="/features/mental-health" className="text-sm font-medium hover:text-primary transition-colors">
                  Mental Health
                </Link>
              </>
            )}
          </nav>
        )}

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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : isAuthPage ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to Home</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login" prefetch>Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register" prefetch>Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Don't show full menu on auth pages */}
        {!isAuthPage && (
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        )}

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
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/features/mentorship" className="text-lg font-medium hover:text-primary transition-colors">
                  Find Mentors
                </Link>
                <Link href="/features/resources" className="text-lg font-medium hover:text-primary transition-colors">
                  Resources
                </Link>
                <Link href="/features/mental-health" className="text-lg font-medium hover:text-primary transition-colors">
                  Mental Health
                </Link>
                <Link href="#about" onClick={handleAboutClick} className="text-lg font-medium hover:text-primary transition-colors">
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