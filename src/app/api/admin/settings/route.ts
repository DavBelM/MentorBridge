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

    const settings = await prisma.platformSettings.findFirst()

    return NextResponse.json(settings || {
      allowNewRegistrations: true,
      requireMentorApproval: true,
      maxSessionsPerWeek: 5,
      sessionDuration: 60,
      maintenanceMode: false,
      siteName: "MentorBridge",
      contactEmail: "support@mentorbridge.com"
    })
  } catch (error) {
    console.error("[GET_PLATFORM_SETTINGS] Error", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    const settings = await prisma.platformSettings.upsert({
      where: { id: 1 },
      update: {
        allowNewRegistrations: body.allowNewRegistrations,
        requireMentorApproval: body.requireMentorApproval,
        maxSessionsPerWeek: body.maxSessionsPerWeek,
        sessionDuration: body.sessionDuration,
        maintenanceMode: body.maintenanceMode,
        siteName: body.siteName,
        contactEmail: body.contactEmail
      },
      create: {
        id: 1,
        allowNewRegistrations: body.allowNewRegistrations,
        requireMentorApproval: body.requireMentorApproval,
        maxSessionsPerWeek: body.maxSessionsPerWeek,
        sessionDuration: body.sessionDuration,
        maintenanceMode: body.maintenanceMode,
        siteName: body.siteName,
        contactEmail: body.contactEmail
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[UPDATE_PLATFORM_SETTINGS] Error", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 