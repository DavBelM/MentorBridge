import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Parse URL to get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause based on filters
    const where: any = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (type && type !== 'all') {
      where.type = type
    }

    // Get total count for pagination
    const totalCount = await prisma.resource.count({ where })
    
    // Get resources with filters and pagination
    const resources = await prisma.resource.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
            profile: {
              select: {
                profilePicture: true
              }
            }
          }
        },
        collections: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      skip,
      take: limit
    })

    // Return properly structured response
    return NextResponse.json({
      resources,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    })
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