import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "MENTOR") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { connectionId } = body

    const connection = await prisma.connection.update({
      where: {
        id: connectionId,
        mentorId: session.user.id,
      },
      data: {
        status: "ACCEPTED",
      },
    })

    return NextResponse.json(connection)
  } catch (error) {
    console.error("Failed to approve connection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 