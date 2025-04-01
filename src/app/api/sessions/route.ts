import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, description, startTime, endTime, connectionId } = await req.json()

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

    // Check for scheduling conflicts
    const existingSessions = await prisma.session.findMany({
      where: {
        connectionId,
        OR: [
          {
            startTime: {
              lte: new Date(endTime),
              gte: new Date(startTime),
            },
          },
          {
            endTime: {
              lte: new Date(endTime),
              gte: new Date(startTime),
            },
          },
        ],
      },
    })

    if (existingSessions.length > 0) {
      return new NextResponse("Time slot is already booked", { status: 400 })
    }

    // Create the session
    const newSession = await prisma.session.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        connectionId,
        status: "SCHEDULED",
      },
    })

    // Create notifications for both parties
    const recipientId =
      connection.mentorId === session.user.id
        ? connection.menteeId
        : connection.mentorId

    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "New Session Scheduled",
        type: "NEW_SESSION",
        message: `New session scheduled: ${title} on ${format(new Date(startTime), "MMM d, yyyy 'at' h:mm a")}`,
        entityId: newSession.id, // Include the session ID
        read: false,
      },
    })

    return NextResponse.json(newSession)
  } catch (error) {
    console.error("[SESSION_ERROR]", error)
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const role = searchParams.get("role")  // Get the role parameter

    let where = {}
    if (connectionId) {
      where = { connectionId }
    } else {
      // Filter by connection properties, not directly on session
      where = {
        connection: {
          OR: [
            { mentorId: session.user.id },
            { menteeId: session.user.id },
          ]
        }
      }
      
      // If role is specified, filter by that role
      if (role === "MENTOR") {
        where = {
          connection: { mentorId: session.user.id }
        }
      } else if (role === "MENTEE") {
        where = {
          connection: { menteeId: session.user.id }
        }
      }
    }

    if (startDate && endDate) {
      where = {
        ...where,
        startTime: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }
    }

    const sessions = await prisma.session.findMany({
      where,
      include: {
        connection: {
          include: {
            mentor: {
              include: {
                profile: true
              }
            },
            mentee: {
              include: {
                profile: true
              }
            },
          },
        },
      },
      orderBy: { startTime: "asc" },
    })

    // Transform the data to match what the client expects
    const transformedSessions = sessions.map(session => {
      const isMentor = session.connection.mentorId === session.user.id;
      return {
        id: session.id,
        title: session.title,
        description: session.description,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        status: session.status,
        mentor: {
          id: session.connection.mentor.id,
          fullname: session.connection.mentor.name,
          profile: {
            profilePicture: session.connection.mentor.profile?.profilePicture || null
          }
        }
      };
    });

    return NextResponse.json(transformedSessions)
  } catch (error) {
    console.error("[SESSION_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { sessionId, status, notes } = await req.json()

    const existingSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        connection: true,
      },
    })

    if (!existingSession) {
      return new NextResponse("Session not found", { status: 404 })
    }

    if (
      existingSession.connection.mentorId !== session.user.id &&
      existingSession.connection.menteeId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        status,
        notes,
      },
    })

    // Create notification for the other party
    const recipientId =
      existingSession.connection.mentorId === session.user.id
        ? existingSession.connection.menteeId
        : existingSession.connection.mentorId

    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: "Session Update",
        type: "SESSION_UPDATE",
        message: `Session with ${session.user.name} has been updated.`,
        entityId: updatedSession.id,
        read: false,
      },
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("[SESSION_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}