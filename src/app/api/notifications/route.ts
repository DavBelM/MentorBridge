import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

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
      take: 15, // Limit to most recent 15
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

// Helper function to generate links
function getNotificationLink(type: string, entityId?: string): string | undefined {
  if (!entityId) return undefined;
  
  switch (type) {
    case 'message':
      return `/dashboard/mentee/messages/${entityId}`;
    case 'session':
      return `/dashboard/mentee/sessions/${entityId}`;
    case 'request':
      return `/dashboard/mentee/my-mentors`;
    default:
      return undefined;
  }
}