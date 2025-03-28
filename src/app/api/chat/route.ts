import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get("connectionId")

    if (!connectionId) {
      return new NextResponse("Connection ID is required", { status: 400 })
    }

    const connection = await prisma.connection.findUnique({
      where: {
        id: connectionId,
      },
      include: {
        mentor: true,
        mentee: true,
      },
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    // Verify user is part of the connection
    if (
      connection.mentorId !== session.user.id &&
      connection.menteeId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const messages = await prisma.message.findMany({
      where: {
        connectionId,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({
      connection,
      messages,
    })
  } catch (error) {
    console.error("Failed to fetch chat:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { content, connectionId } = body

    if (!connectionId) {
      return new NextResponse("Connection ID is required", { status: 400 })
    }

    const connection = await prisma.connection.findUnique({
      where: {
        id: connectionId,
      },
    })

    if (!connection) {
      return new NextResponse("Connection not found", { status: 404 })
    }

    // Verify user is part of the connection
    if (
      connection.mentorId !== session.user.id &&
      connection.menteeId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        recipientId:
          connection.mentorId === session.user.id
            ? connection.menteeId
            : connection.mentorId,
        connectionId,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Failed to send message:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 