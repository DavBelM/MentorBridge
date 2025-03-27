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

    const { menteeId, mentorId, message } = await req.json()

    // Create a connection request
    const connection = await prisma.connection.create({
      data: {
        menteeId,
        mentorId,
        status: "PENDING",
        message,
      },
    })

    // Create notifications for both parties
    await prisma.notification.createMany({
      data: [
        {
          userId: mentorId,
          type: "MENTEE_REQUEST",
          message: `New connection request from ${session.user.name}`,
          read: false,
        },
        {
          userId: menteeId,
          type: "REQUEST_SENT",
          message: "Your connection request has been sent",
          read: false,
        },
      ],
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("[MATCHING_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { connectionId, status } = await req.json()

    const connection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    })

    // Create notifications based on the response
    if (status === "ACCEPTED") {
      await prisma.notification.createMany({
        data: [
          {
            userId: connection.menteeId,
            type: "REQUEST_ACCEPTED",
            message: "Your connection request has been accepted",
            read: false,
          },
          {
            userId: connection.mentorId,
            type: "CONNECTION_MADE",
            message: "You have accepted a new connection",
            read: false,
          },
        ],
      })
    } else if (status === "REJECTED") {
      await prisma.notification.create({
        data: {
          userId: connection.menteeId,
          type: "REQUEST_REJECTED",
          message: "Your connection request has been declined",
          read: false,
        },
      })
    }

    return NextResponse.json(connection)
  } catch (error) {
    console.error("[MATCHING_ERROR]", error)
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
    const role = searchParams.get("role")
    const userId = session.user.id

    let connections
    if (role === "MENTOR") {
      connections = await prisma.connection.findMany({
        where: { mentorId: userId },
        include: {
          mentee: {
            include: {
              profile: true,
            },
          },
        },
      })
    } else {
      connections = await prisma.connection.findMany({
        where: { menteeId: userId },
        include: {
          mentor: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    return NextResponse.json(connections)
  } catch (error) {
    console.error("[MATCHING_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 