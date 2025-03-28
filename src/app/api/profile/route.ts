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
    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!profile) {
      return new NextResponse("Profile not found", { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { bio, skills, education, availability, location, linkedin, twitter } = body

    const profile = await prisma.profile.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        bio,
        skills,
        education,
        availability,
        location,
        linkedin,
        twitter,
      },
      create: {
        userId: session.user.id,
        bio,
        skills,
        education,
        availability,
        location,
        linkedin,
        twitter,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Failed to update profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 