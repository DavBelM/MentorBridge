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
    const resources = await prisma.resource.findMany({
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(resources)
  } catch (error) {
    console.error("Failed to fetch resources:", error)
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
    const { title, description, url, type } = body

    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        url,
        type,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(resource)
  } catch (error) {
    console.error("Failed to create resource:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 