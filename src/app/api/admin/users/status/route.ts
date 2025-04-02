import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { userId, action } = body

    if (!userId || !action) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    if (action !== "activate" && action !== "deactivate") {
      return new NextResponse("Invalid action", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Don't allow deactivating admin users
    if (user.role === "ADMIN" && action === "deactivate") {
      return new NextResponse("Cannot deactivate admin users", { status: 400 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isApproved: action === "activate",
      },
    })

    return new NextResponse("User status updated", { status: 200 })
  } catch (error) {
    console.error("[UPDATE_USER_STATUS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 