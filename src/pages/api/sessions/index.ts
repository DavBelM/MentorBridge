// src/pages/api/sessions/index.ts
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
    
    // Parse query parameters for filtering
    const { status, upcoming } = req.query;
    
    // Base where clause
    const whereClause: any = isMentor 
      ? { mentorId: userId } 
      : { menteeId: userId };
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    // Filter for upcoming sessions if requested
    if (upcoming === 'true') {
      whereClause.startTime = {
        gte: new Date(),
      };
    }

    // Get all sessions for the user
    const sessions = await prisma.session.findMany({
      where: whereClause,
      include: {
        mentor: {
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
      orderBy: {
        startTime: 'asc',
      },
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
}

export default authMiddleware(handler);