import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

// Define types outside the function
interface MenteeInfo {
  id: string;
  fullname: string;
  profile: {
    profilePicture: string | null;
  } | null;
}

interface SessionConnection {
  mentorId: string;
  mentee: MenteeInfo;
}

interface UpcomingSession {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  connection: SessionConnection;
}

interface FormattedSession {
  id: string;
  title: string;
  menteeName: string;
  startTime: string;
  endTime: string;
}

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
    
    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        connection: {
          mentorId: userId,
        },
        startTime: {
          gte: new Date(),
        },
        status: "SCHEDULED",
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
      include: {
        connection: {
          include: {
            mentee: {
              select: {
                id: true,
                fullname: true,
                profile: {
                  select: {
                    profilePicture: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    
    // Format for the dashboard page - without additional type annotations
    const formattedSessions = upcomingSessions.map(session => ({
      id: session.id,
      title: session.title,
      menteeName: session.connection.mentee.fullname,
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
    }));
    
    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch upcoming sessions" },
      { status: 500 }
    );
  }
}