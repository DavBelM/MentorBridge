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

    const pendingMentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
        isApproved: false
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        createdAt: true,
        profile: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(pendingMentors)
  } catch (error) {
    console.error("[GET_PENDING_MENTORS] Error", error)
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
    const { mentorId, action } = body

    if (!mentorId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (!["approve", "reject"].includes(action)) {
      return new NextResponse("Invalid action", { status: 400 })
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId }
    })

    if (!mentor) {
      return new NextResponse("Mentor not found", { status: 404 })
    }

    if (mentor.role !== "MENTOR") {
      return new NextResponse("User is not a mentor", { status: 400 })
    }

    await prisma.user.update({
      where: { id: mentorId },
      data: {
        isApproved: action === "approve"
      }
    })

    return NextResponse.json({ message: `Mentor ${action}ed successfully` })
  } catch (error) {
    console.error("[MENTOR_APPROVAL] Error", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 