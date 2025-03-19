"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function FooterWrapper() {
  const pathname = usePathname()
  
  // List of paths where footer should be hidden
  const noFooterPaths = [
    '/login', 
    '/signup', 
    '/register', 
    '/dashboard', 
    '/mentorship', 
    '/resources', 
    '/profile',
    '/profile-setup' // Added profile-setup to the list
  ]
  
  // Check if current path should hide footer
  const shouldHideFooter = noFooterPaths.some(path => pathname.startsWith(path))
  
  return shouldHideFooter ? null : <Footer />
}