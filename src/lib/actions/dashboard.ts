"use server"

import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { cookies } from "next/headers"
import type { DashboardData } from "@/types/dashboard"

export async function getDashboardData(role: "mentor" | "mentee"): Promise<DashboardData | null> {
  const token = cookies().get("auth_token")?.value
  if (!token) return null

  const user = await getUserFromToken(token)
  if (!user) return null

  if (!user) return null

  // Get active connections
  const activeConnections = await prisma.connection.count({
    where: {
      [role === "mentor" ? "mentorId" : "menteeId"]: user.id,
      status: "accepted"
    }
  })

  // Get upcoming sessions
  const now = new Date()
  const upcomingSessions = await prisma.session.findMany({
    where: {
      [role === "mentor" ? "mentorId" : "menteeId"]: user.id,
      startTime: { gt: now },
      status: "scheduled"
    },
    include: {
      mentor: {
        select: {
          fullname: true,
          profile: { select: { profilePicture: true } }
        }
      },
      mentee: {
        select: {
          fullname: true,
          profile: { select: { profilePicture: true } }
        }
      }
    },
    orderBy: { startTime: "asc" },
    take: 5
  })

  // Calculate total hours from completed sessions
  const completedSessions = await prisma.session.findMany({
    where: {
      [role === "mentor" ? "mentorId" : "menteeId"]: user.id,
      status: "completed"
    },
    select: {
      startTime: true,
      endTime: true
    }
  })

  const totalHours = completedSessions.reduce((acc, session) => {
    const duration = session.endTime.getTime() - session.startTime.getTime()
    return acc + (duration / (1000 * 60 * 60)) // Convert to hours
  }, 0)

  // Get pending connection requests
  const pendingRequests = await prisma.connection.count({
    where: {
      [role === "mentor" ? "mentorId" : "menteeId"]: user.id,
      status: "pending"
    }
  })

  // Get relevant profiles
  const profiles = await prisma.profile.findMany({
    where: {
      user: {
        role: role === "mentor" ? "mentee" : "mentor",
        [role === "mentor" ? "menteeConnections" : "mentorConnections"]: {
          some: {
            [role === "mentor" ? "mentorId" : "menteeId"]: user.id,
            status: "accepted"
          }
        }
      }
    },
    include: {
      user: {
        select: {
          id: true,
          fullname: true,
          email: true
        }
      }
    },
    take: 5
  })

  return {
    stats: {
      activeMentorships: activeConnections,
      upcomingSessions: upcomingSessions.length,
      totalHours: Math.round(totalHours * 10) / 10,
      pendingRequests,
      completedSessions: completedSessions.length,
      learningProgress: role === "mentee" ? Math.round(Math.random() * 100) : undefined // Mock progress for now
    },
    profiles,
    upcomingSessions
  }
}

export async function getRecommendedResources(role: "mentor" | "mentee") {
  // This would typically fetch from a resources table
  // For now, returning mock data
  return [
    {
      id: 1,
      title: "Getting Started with Mentorship",
      description: role === "mentor" 
        ? "Learn effective mentoring techniques and best practices"
        : "Make the most of your mentorship journey",
      link: "#"
    },
    {
      id: 2,
      title: "Communication Skills",
      description: "Essential communication skills for successful mentorship",
      link: "#"
    },
    {
      id: 3,
      title: "Goal Setting Workshop",
      description: "Learn to set and achieve meaningful goals",
      link: "#"
    }
  ]
}

export async function getMentalHealthResources() {
  // Mock data for mental health resources
  return [
    {
      id: 1,
      title: "Stress Management",
      description: "Techniques for managing stress and anxiety",
      link: "#"
    },
    {
      id: 2,
      title: "Work-Life Balance",
      description: "Tips for maintaining a healthy work-life balance",
      link: "#"
    }
  ]
}
