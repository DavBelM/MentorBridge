import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

// This is just an alias to the mentor/mentees endpoint
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
    
    // Same logic as the mentor/mentees endpoint
    const menteeConnections = await prisma.connection.findMany({
      where: {
        mentorId: userId,
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
    
    // Format the data to match what your page expects
    const formattedMentees = menteeConnections.map(connection => ({
      id: connection.mentee.id,
      fullname: connection.mentee.fullname || "",
      email: connection.mentee.email,
      profile: {
        bio: connection.mentee.profile?.bio || null,
        profilePicture: connection.mentee.profile?.profilePicture || null,
        // Add these missing fields
        interests: [] // Empty array instead of null
      },
      connectionId: connection.id,
      connectionStatus: connection.status,
      // Add these missing date fields with valid ISO strings
      connectedDate: connection.createdAt.toISOString(),
      lastSessionDate: null,
      nextSessionDate: null,
      // Add these missing objects with default values
      goalsProgress: {
        completed: 0,
        inProgress: 0,
        total: 0
      },
      sessionStats: {
        completed: 0,
        upcoming: 0,
        totalHours: 0
      }
    }));
    
    // Return in the format expected by the page
    return NextResponse.json({ 
      mentees: formattedMentees 
    });
  } catch (error) {
    console.error("Error fetching mentees:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentees" },
      { status: 500 }
    );
  }
}