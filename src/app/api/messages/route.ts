import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { content, recipientId, connectionId } = await req.json()

    // Verify that the connection exists and the user is part of it
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        mentor: true,
        mentee: true,
      },
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    if (
      connection.mentorId !== session.user.id &&
      connection.menteeId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        recipientId,
        connectionId,
      },
    })

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        title: "New Message",
        message: `New message from ${session.user.fullname || 'your connection'}`,
        type: "NEW_MESSAGE",
        entityId: connectionId, // Use connectionId as entityId for easier navigation
        read: false,
        user: {
          connect: {
            id: recipientId
          }
        }
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGING_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const connectionId = searchParams.get("connectionId")

    if (!connectionId) {
      return new NextResponse("Connection ID is required", { status: 400 })
    }

    // Verify that the connection exists and the user is part of it
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      include: {
        mentor: true,
        mentee: true,
      },
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    if (
      connection.mentorId !== session.user.id &&
      connection.menteeId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get messages for this connection
    const messages = await prisma.message.findMany({
      where: { connectionId },
      include: {
        sender: true,
        recipient: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        connectionId,
        recipientId: session.user.id,
        read: false,
      },
      data: { read: true },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("[MESSAGING_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}