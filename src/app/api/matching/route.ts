import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await req.json()
    console.log("Received connection request body:", body)
    
    const { menteeId, mentorId, message } = body
    
    // Check if both IDs exist and are strings
    if (!menteeId || !mentorId || typeof menteeId !== 'string' || typeof mentorId !== 'string') {
      return new NextResponse(JSON.stringify({ 
        error: "Invalid parameters",
        details: { menteeId, mentorId }
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check model existence
    const mentor = await prisma.user.findUnique({ where: { id: mentorId } })
    const mentee = await prisma.user.findUnique({ where: { id: menteeId } })
    
    if (!mentor || !mentee) {
      return new NextResponse(JSON.stringify({ 
        error: "User not found",
        details: { mentorExists: !!mentor, menteeExists: !!mentee }
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId,
          menteeId
        }
      }
    })

    if (existingConnection) {
      return new NextResponse(JSON.stringify({ 
        error: "Connection already exists",
        status: existingConnection.status 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

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
          title: "New Connection Request",
          type: "MENTEE_REQUEST",
          message: `New connection request from ${session.user.name}`,
          read: false,
        },
        {
          userId: menteeId,
          title: "Connection Request Sent",
          type: "REQUEST_SENT",
          message: "Your connection request has been sent",
          read: false,
        },
      ],
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("[MATCHING_ERROR]", error)
    return new NextResponse(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { connectionId, status } = await req.json()
    
    if (!connectionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Verify the mentor is authorized to update this connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
      select: { mentorId: true }
    })
    
    if (!connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 })
    }
    
    if (connection.mentorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    
    // Update the connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status }
    })
    
    // Create a notification for the mentee
    await prisma.notification.create({
      data: {
        userId: updatedConnection.menteeId,
        title: status === "ACCEPTED" ? "Connection Accepted" : "Connection Declined",
        message: status === "ACCEPTED" 
          ? "Your connection request has been accepted! You can now start your mentoring journey." 
          : "Your connection request has been declined.",
        type: "CONNECTION_UPDATE",
        entityId: connectionId
      }
    })
    
    return NextResponse.json({ success: true, connection: updatedConnection })
  } catch (error) {
    console.error("Error updating connection:", error)
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 })
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