// src/pages/api/messages/threads.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = parseInt(req.user.id, 10);
    const isMentor = req.user.role === 'MENTOR';
    
    // Get all connections for the user that have messages
    const connections = await prisma.connection.findMany({
      where: isMentor 
        ? { mentorId: userId, status: 'accepted' } 
        : { menteeId: userId, status: 'accepted' },
      include: {
        mentorUser: {
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
        menteeUser: {
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
        contact: isMentor ? connection.menteeUser : connection.mentorUser,
        lastMessage: connection.messages[0] || null, // Allow null for no messages
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

    return res.status(200).json({ threads });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return res.status(500).json({ error: 'Failed to fetch message threads' });
  }
}

export default authMiddleware(handler);