import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return new NextResponse("Username is required", { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    })

    return NextResponse.json({
      available: !existingUser,
    })
  } catch (error) {
    console.error("Failed to check username:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 