import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}),
        id: {
          not: session.user.id,
        },
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { userId, isApproved } = body

    // Only admins can approve users
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isApproved,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to update user:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 