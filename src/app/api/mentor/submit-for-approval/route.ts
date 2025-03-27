import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "MENTOR") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Update the mentor's profile status
    await prisma.user.update({
      where: {
        id: parseInt(session.user.id),
      },
      data: {
        isApproved: false,
        submittedForApproval: true,
        submittedForApprovalAt: new Date(),
      },
    })

    return new NextResponse("Profile submitted for approval", { status: 200 })
  } catch (error) {
    console.error("[MENTOR_SUBMIT_APPROVAL]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 