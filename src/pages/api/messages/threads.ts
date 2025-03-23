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

    const userId = req.user.id;
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
      .filter(connection => connection.messages.length > 0) // Only include connections with messages
      .map(connection => ({
        id: connection.id,
        contact: isMentor ? connection.menteeUser : connection.mentorUser,
        lastMessage: connection.messages[0],
        unreadCount: connection._count.messages,
        updatedAt: connection.messages[0]?.createdAt || connection.updatedAt,
      }));

    return res.status(200).json({ threads });
  } catch (error) {
    console.error('Error fetching message threads:', error);
    return res.status(500).json({ error: 'Failed to fetch message threads' });
  }
}

export default authMiddleware(handler);