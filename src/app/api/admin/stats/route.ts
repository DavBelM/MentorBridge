import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const [
      totalUsers,
      totalMentors,
      totalMentees,
      pendingApprovals,
      activeConnections
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: "MENTOR", isApproved: true }
      }),
      prisma.user.count({
        where: { role: "MENTEE", isApproved: true }
      }),
      prisma.user.count({
        where: { role: "MENTOR", isApproved: false }
      }),
      prisma.connection.count({
        where: { status: "ACCEPTED" }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalMentors,
      totalMentees,
      pendingApprovals,
      activeConnections
    })
  } catch (error) {
    console.error("[ADMIN_STATS] Error", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 