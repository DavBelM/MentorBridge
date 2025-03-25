"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Get token from localStorage - use the same key as login-form.tsx
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          // No token found, redirect to login
          router.replace('/login')
          return
        }

        // Verify token is valid by making a request to the API
        const response = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          // Token is invalid, clear it and redirect
          localStorage.removeItem('authToken')
          router.replace('/login')
          return
        }

        // User is authenticated
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null
}