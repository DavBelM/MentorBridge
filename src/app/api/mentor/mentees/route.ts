import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id as string;
    
    // Verify user is a mentor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Get all mentees for this mentor
    const menteeConnections = await prisma.connection.findMany({
      where: {
        mentorId: userId,
        // You can filter by status if needed, like only ACCEPTED connections
        // status: "ACCEPTED"
      },
      include: {
        mentee: {
          select: {
            id: true,
            fullname: true,
            email: true,
            profile: {
              select: {
                bio: true,
                profilePicture: true,
                skills: true,
                location: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    // Format the response
    const mentees = menteeConnections.map(connection => ({
      id: connection.mentee.id,
      fullname: connection.mentee.fullname,
      email: connection.mentee.email,
      profile: connection.mentee.profile,
      connectionId: connection.id,
      status: connection.status,
      since: connection.createdAt
    }));
    
    return NextResponse.json(mentees);
  } catch (error) {
    console.error("Error fetching mentees:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentees" },
      { status: 500 }
    );
  }
}