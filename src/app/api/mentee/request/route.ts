import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "MENTEE") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { mentorId, message } = body

    const connection = await prisma.connection.create({
      data: {
        mentorId,
        menteeId: session.user.id,
        message,
      },
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Failed to create connection request:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 