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
import { motion } from "framer-motion"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { scrollToSection } = useScroll()
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    scrollToSection('about')
    setIsMenuOpen(false)
  }

  // Animation for navbar links
  const navItemAnimation = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="container flex h-16 items-center justify-around">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href={isDashboard ? "/dashboard" : "/"} className="font-bold text-xl text-primary hover:scale-105 transition-transform">
            MentorBridge
          </Link>
        </motion.div>

        {/* Desktop Navigation - Only show full nav if not on auth pages */}
        {!isAuthPage && (
          <motion.nav 
            className="hidden md:flex items-center gap-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {!isDashboard && (
              <>
                <motion.div
                  variants={navItemAnimation}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link href="/features/mentorship" className="text-sm font-medium hover:text-primary transition-colors">
                    Find Mentors
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemAnimation}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link href="/features/resources" className="text-sm font-medium hover:text-primary transition-colors">
                    Resources
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemAnimation}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link href="/features/mental-health" className="text-sm font-medium hover:text-primary transition-colors">
                    Mental Health
                  </Link>
                </motion.div>
                <motion.div
                  variants={navItemAnimation}
                  initial="rest"
                  whileHover="hover"
                >
                  <Link href="#about" onClick={handleAboutClick} className="text-sm font-medium hover:text-primary transition-colors">
                    About Us
                  </Link>
                </motion.div>
              </>
            )}
          </motion.nav>
        )}

        <motion.div 
          className="hidden md:flex items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
          ) : isAuthPage ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to Home</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" size="sm" 
                className="hover:scale-105 transition-transform">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild size="sm" 
                className="hover:scale-105 transition-transform">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </motion.div>

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
                <Button variant="outline" className="w-full">
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