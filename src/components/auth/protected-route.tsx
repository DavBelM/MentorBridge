"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { get } from "@/lib/api-client"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireProfile?: boolean
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [checkingProfile, setCheckingProfile] = useState(false)
  const router = useRouter()

  // Check if user has a profile
  useEffect(() => {
    if (isAuthenticated && user?.id && requireProfile) {
      const checkUserProfile = async () => {
        setCheckingProfile(true)
        try {
          const response = await get("/api/profile/check") as { hasProfile: boolean }
          const { hasProfile } = response
          setHasProfile(hasProfile)
          
          if (!hasProfile) {
            router.push("/profile/setup")
          }
        } catch (error) {
          console.error("Error checking profile:", error)
          setHasProfile(false)
        } finally {
          setCheckingProfile(false)
        }
      }
      
      checkUserProfile()
    }
  }, [isAuthenticated, requireProfile, router, user?.id])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])
  
  if (isLoading || (requireProfile && checkingProfile)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Only show content if user is authenticated and (no profile required or has profile)
  if (isAuthenticated && (!requireProfile || hasProfile === true)) {
    return <>{children}</>
  }
  
  return null // Will redirect in useEffect
}