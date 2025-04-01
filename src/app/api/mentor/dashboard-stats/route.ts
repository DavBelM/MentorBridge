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
    
    // Get total mentees (active connections)
    const totalMentees = await prisma.connection.count({
      where: {
        mentorId: userId,
        status: "ACCEPTED",
      },
    });
    
    // Get active sessions
    const activeSessions = await prisma.session.count({
      where: {
        connection: {
          mentorId: userId,
        },
        status: "SCHEDULED",
      },
    });
    
    // Get completed sessions
    const completedSessions = await prisma.session.count({
      where: {
        connection: {
          mentorId: userId,
        },
        status: "COMPLETED",
      },
    });
    
    // Get pending requests
    const pendingRequests = await prisma.connection.count({
      where: {
        mentorId: userId,
        status: "PENDING",
      },
    });
    
    // Get recent mentees
    const recentConnections = await prisma.connection.findMany({
      where: {
        mentorId: userId,
        status: "ACCEPTED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        mentee: {
          select: {
            id: true,
            fullname: true,
            profile: {
              select: {
                profilePicture: true,
                bio: true,
              },
            },
          },
        },
      },
    });
    
    const recentMentees = recentConnections.map(conn => ({
      id: conn.mentee.id,
      fullname: conn.mentee.fullname,
      profile: {
        profilePicture: conn.mentee.profile?.profilePicture || null,
        bio: conn.mentee.profile?.bio || null
      }
    }));
    
    return NextResponse.json({
      stats: {
        totalMentees,
        activeSessions,
        completedSessions,
        pendingRequests
      },
      recentMentees: recentConnections.map(conn => ({
        id: conn.mentee.id,
        fullname: conn.mentee.fullname,
        profile: {
          profilePicture: conn.mentee.profile?.profilePicture || null,
          bio: conn.mentee.profile?.bio || null
        }
      }))
    });
  } catch (error) {
    console.error("Error in dashboard-stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}