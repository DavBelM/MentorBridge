"use client"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { get } from "@/lib/api-client"
import { StatsCard } from "@/app/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CalendarClock, UserCheck, TrendingUp, Bookmark } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

// Types for dashboard data
interface MenteeStats {
  totalMentors: number
  totalSessions: number
  learningProgress: number
  savedResources: number
  activeSessions: number
  completedSessions: number
  learningGoals: number
}

interface Mentor {
  id: number
  fullname: string
  profile: {
    profilePicture: string | null
    bio: string | null
    skills: string | null
  }
}

interface Session {
  id: number
  title: string
  startTime: string
  endTime: string
  status: string
  mentorId: number
  mentor: {
    fullname: string
    profile: {
      profilePicture: string | null
    }
  }
}

interface Resource {
  id: number
  title: string
  type: string
  description: string
}

interface UpcomingSession {
  id: number
  title: string
  mentorName: string
  startTime: string
  endTime: string
}

interface LearningProgress {
  category: string
  value: number
  description: string
}

interface MentorConnection {
  id: number
  mentorName: string
  expertise: string[]
  status: string
}

export default function MenteeDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Add error handling and logging
        console.log("Fetching dashboard data with session:", session)
        
        // Use relative URL path
        const response = await fetch('/api/dashboard/mentee')
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const data = await response.json()
        setDashboardData(data)
      } catch (err: unknown) {
        console.error("Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchDashboardData()
    }
  }, [session])
  
  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div>Error loading dashboard: {error}</div>
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mentee Dashboard</h1>
      {/* Rest of your dashboard UI */}
    </div>
  )
}