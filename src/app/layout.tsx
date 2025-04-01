import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Script from "next/script"
import { AuthProvider } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/navbar" // Import your header
import { Footer } from "@/components/footer" // Import your footer

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MentorBridge",
  description: "Connect with mentors and mentees",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <AuthProvider>
          {/* You can conditionally show header based on path if needed */}
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}