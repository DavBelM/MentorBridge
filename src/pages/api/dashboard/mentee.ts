// src/pages/api/dashboard/mentee.ts
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
    // Ensure the user is a mentee
    if (!req.user || req.user.role !== 'MENTEE') {
      return res.status(403).json({ error: 'Only mentees can access this data' });
    }

    const menteeId = req.user.id;
    const today = new Date();

    // Get total mentors
    const totalMentors = await prisma.connection.count({
      where: {
        menteeId,
        status: 'accepted',
      },
    });

    // Get total sessions
    const totalSessions = await prisma.session.count({
      where: {
        menteeId,
        status: 'completed',
      },
    });

    // Learning progress and saved resources (placeholders - you'll need to implement these)
    const learningProgress = 62; // Placeholder value
    const savedResources = 8; // Placeholder value

    // Get mentors
    const mentors = await prisma.user.findMany({
      where: {
        mentorConnections: {
          some: {
            menteeId,
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
            skills: true,
          },
        },
      },
      take: 3,
    });

    // Get upcoming sessions
    const upcomingSessions = await prisma.session.findMany({
      where: {
        menteeId,
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
        mentorId: true,
        mentor: {
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

    // Recommended resources (placeholder - you'll need to implement this)
    const recommendedResources = [
      {
        id: 1,
        title: 'Effective Communication Skills',
        type: 'article',
        description: 'Learn the fundamentals of effective communication in professional settings',
      },
      {
        id: 2,
        title: 'Time Management Techniques',
        type: 'video',
        description: 'Improve your productivity with these proven time management strategies',
      },
      {
        id: 3,
        title: 'Leadership Fundamentals',
        type: 'course',
        description: 'A comprehensive guide to developing leadership capabilities',
      },
      {
        id: 4,
        title: 'Problem-Solving Methods',
        type: 'book',
        description: 'Systematic approaches to solving complex problems',
      },
    ];

    res.status(200).json({
      stats: {
        totalMentors,
        totalSessions,
        learningProgress,
        savedResources,
      },
      mentors,
      upcomingSessions,
      recommendedResources,
    });
  } catch (error) {
    console.error('Error fetching mentee dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

export default authMiddleware(handler);