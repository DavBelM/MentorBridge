// src/pages/api/dashboard/mentor.ts
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
    // Ensure the user is a mentor
    if (!req.user || req.user.role !== 'MENTOR') {
      return res.status(403).json({ error: 'Only mentors can access this data' });
    }

    const mentorId = req.user.id;
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Get total mentees
    const totalMentees = await prisma.connection.count({
      where: {
        mentorId,
        status: 'accepted',
      },
    });

    // Get total sessions
    const totalSessions = await prisma.session.count({
      where: {
        mentorId,
        status: 'completed',
      },
    });

    // Get upcoming sessions count
    const upcomingSessionsCount = await prisma.session.count({
      where: {
        mentorId,
        startTime: {
          gte: today,
          lt: nextWeek,
        },
        status: 'scheduled',
      },
    });

    // Calculate average rating (placeholder - you'll need to create a Feedback model)
    const averageRating = 4.8; // Placeholder value

    // Get recent mentees
    const recentMentees = await prisma.user.findMany({
      where: {
        menteeConnections: {
          some: {
            mentorId,
            status: 'accepted',
          },
        },
      },
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
      take: 5,
      orderBy: {
        menteeConnections: {
          _count: 'desc',
        },
      },
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        mentorId,
        startTime: {
          gte: today,
        },
        status: 'scheduled',
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
        menteeId: true,
        mentee: {
          select: {
            fullname: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
      },
      take: 3,
      orderBy: {
        startTime: 'asc',
      },
    });

    res.status(200).json({
      stats: {
        totalMentees,
        totalSessions,
        averageRating,
        upcomingSessionsCount,
      },
      recentMentees,
      upcomingSessions,
    });
  } catch (error) {
    console.error('Error fetching mentor dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

export default authMiddleware(handler);