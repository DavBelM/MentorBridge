import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const mentorId = searchParams.get("mentorId")
    const menteeId = searchParams.get("menteeId")

    if (!mentorId || !menteeId) {
      return new NextResponse("Missing mentorId or menteeId", { status: 400 })
    }

    // Ensure user can only check their own connections
    if (menteeId !== session.user.id && mentorId !== session.user.id) {
      return new NextResponse("Not authorized", { status: 403 })
    }

    const connection = await prisma.connection.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId,
          menteeId
        }
      },
      select: {
        status: true
      }
    })

    return NextResponse.json({
      exists: !!connection,
      status: connection?.status || null
    })
  } catch (error) {
    console.error("Error checking connection status:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}