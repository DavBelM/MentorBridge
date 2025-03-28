import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { notificationId } = await request.json()

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Failed to update notification:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 