"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/context/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { usePathname } from "next/navigation"

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Don't show navbar/footer on dashboard pages
  const isDashboardPage = pathname?.startsWith('/dashboard')
  
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          {!isDashboardPage && <Navbar />}
          {children}
          {!isDashboardPage && <Footer />}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}