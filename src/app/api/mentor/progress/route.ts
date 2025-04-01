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
    
    // Get completed sessions count
    const completedSessions = await prisma.session.count({
      where: {
        connection: {
          mentorId: userId,
        },
        status: "COMPLETED",
      },
    });
    
    // Calculate session duration (assuming you store start and end time)
    const sessions = await prisma.session.findMany({
      where: {
        connection: {
          mentorId: userId,
        },
        status: "COMPLETED",
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });
    
    // Calculate total hours
    const totalMinutes = sessions.reduce((sum, session) => {
      const durationInMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      return sum + (durationInMs / (1000 * 60));
    }, 0);
    
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    
    // Get progress data (instead of ratings)
    const progressData = await prisma.progress.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 10
    });
    
    return NextResponse.json({
      completedSessions,
      totalHours,
      progressData,
      activeConnections: await prisma.connection.count({
        where: {
          mentorId: userId,
          status: "ACCEPTED"
        }
      })
    });
  } catch (error) {
    console.error("Error fetching mentor progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}