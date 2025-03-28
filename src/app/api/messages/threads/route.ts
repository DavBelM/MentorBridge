import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const isMentor = session.user.role === 'MENTOR';
    
    const connections = await prisma.connection.findMany({
      where: isMentor 
        ? { mentorId: userId, status: 'accepted' } 
        : { menteeId: userId, status: 'accepted' },
      include: {
        mentor: {
          select: {
            id: true,
            fullname: true,
            image: true,
          },
        },
        mentee: {
          select: {
            id: true,
            fullname: true,
            image: true,
          },
        },
        // Get the most recent message
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        // Count unread messages
        _count: {
          select: {
            messages: {
              where: {
                senderId: {
                  not: userId,
                },
                read: false,
              },
            },
          },
        },
      },
      orderBy: [
        {
          messages: {
            _count: 'desc',
          },
        },
        {
          updatedAt: 'desc',
        },
      ],
    });

    // Transform connections into threads
    const threads = connections
      .map(connection => ({
        id: connection.id,
        contact: isMentor ? connection.mentee : connection.mentor,
        lastMessage: connection.messages[0] || null,
        unreadCount: connection._count.messages,
        updatedAt: connection.messages[0]?.createdAt || connection.updatedAt,
        hasMessages: connection.messages.length > 0,
      }))
      // Sort connections with messages first, then by last update time
      .sort((a, b) => {
        if (a.hasMessages && !b.hasMessages) return -1;
        if (!a.hasMessages && b.hasMessages) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message threads' },
      { status: 500 }
    );
  }
}