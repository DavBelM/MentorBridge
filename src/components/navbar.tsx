// src/components/navbar.tsx
"use client"
import { useScroll } from "@/hooks/use-scroll"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname() || ''
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollToSection } = useScroll()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isProfileSetup = pathname.startsWith('/profile/setup')
  
  // NEW CODE: Close the menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
  
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
    setIsMenuOpen(false) // NEW CODE: Close menu on logout
    localStorage.removeItem('token')
    router.push('/login')
  }

  // NEW CODE: Function to handle link clicks
  const handleLinkClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-around">
        <div className="flex items-center gap-2">
          <Link 
            href={isDashboard ? "/dashboard" : "/"} 
            className="font-bold text-xl text-primary hover:text-primary/80 transition-colors"
            onClick={handleLinkClick} // NEW CODE: Close menu on click
          >
            MentorBridge
          </Link>
        </div>

        {/* Desktop Navigation - Only show full nav if not on auth pages */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <>
                <Link 
                  href="/features/mentorship" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
                  Find Mentors
                </Link>
                
                <Link 
                  href="/features/mental-health" 
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
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
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : isAuthPage ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/" onClick={handleLinkClick}>Back to Home</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/login" prefetch onClick={handleLinkClick}>Log In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register" prefetch onClick={handleLinkClick}>Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button - Don't show on auth pages */}
        {!isAuthPage && (
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
                <Link 
                  href="/dashboard/profile" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
                  Profile
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/features/mentorship" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
                  Find Mentors
                </Link>
                <Link 
                  href="/features/resources" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
                  Resources
                </Link>
                <Link 
                  href="/features/mental-health" 
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={handleLinkClick} // NEW CODE
                >
                  Mental Health
                </Link>
                <Link 
                  href="#about" 
                  onClick={handleAboutClick} 
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  About Us
                </Link>
                <div className="flex flex-col gap-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/login" onClick={handleLinkClick}>Log In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={handleLinkClick}>Sign Up</Link>
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