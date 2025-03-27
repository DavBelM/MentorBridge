import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import Script from "next/script"

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
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <Providers>
          <div className="relative flex flex-col min-h-screen">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </Providers>
        <Script id="intersection-observer" strategy="afterInteractive">
          {`
            if ('IntersectionObserver' in window) {
              const originalObserve = window.IntersectionObserver.prototype.observe;
              window.IntersectionObserver.prototype.observe = function(target) {
                if (!this.observationTargets) {
                  this.observationTargets = [];
                }
                if (!this.observationTargets.includes(target)) {
                  this.observationTargets.push(target);
                  originalObserve.call(this, target);
                }
              };
            }
          `}
        </Script>
      </body>
    </html>
  )
}