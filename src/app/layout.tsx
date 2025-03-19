import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { FooterWrapper } from "@/components/FooterWrapper"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Suspense } from "react"
import { AnimatePresence } from "framer-motion"

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
          <AnimatePresence mode="wait">
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full">
              <Suspense fallback={<LoadingSpinner />}>
                {children}
              </Suspense>
            </main>
            <FooterWrapper />
          </div>
          </AnimatePresence>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const observer = new IntersectionObserver((entries) => {
                  entries.forEach(entry => {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('animate-in');
                    }
                  });
                }, {
                  threshold: 0.1
                });
                
                document.querySelectorAll('.animate-on-scroll').forEach(el => {
                  observer.observe(el);
                });
              });
            `
          }}
        />
      </body>
    </html>
  )
}