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
    // Count unread messages where the current user is the recipient
    const unreadCount = await prisma.message.count({
      where: {
        recipientId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({ count: unreadCount })
  } catch (error) {
    console.error("Failed to fetch unread count:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}