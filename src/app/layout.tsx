import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MentorBridge - Connecting Guidance, Growth, and Well-Being",
  description: "Empowering African youth through mentorship, skill development, and mental health support.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background min-h-screen antialiased`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'