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
    const collections = await prisma.resourceCollection.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            fullname: true
          }
        },
        _count: {
          select: {
            resources: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Return properly structured response
    return NextResponse.json({ collections })
  } catch (error) {
    console.error("Failed to fetch collections:", error)
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
    const { title, description, resourceIds } = body

    const collection = await prisma.resourceCollection.create({
      data: {
        title,
        description,
        createdById: session.user.id,
        resources: {
          connect: resourceIds.map((id: string) => ({ id })),
        },
      },
      include: {
        resources: true,
      },
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error("Failed to create collection:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}