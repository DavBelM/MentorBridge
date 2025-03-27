import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'MENTEE') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const menteeId = session.user.id;

    const [
      totalMentors,
      activeSessions,
      completedSessions,
      learningGoals
    ] = await Promise.all([
      // Count total mentors
      prisma.connection.count({
        where: {
          menteeId,
          status: 'active'
        }
      }),
      // Count active sessions
      prisma.session.count({
        where: {
          menteeId,
          status: 'active',
          startTime: {
            lte: new Date()
          },
          endTime: {
            gte: new Date()
          }
        }
      }),
      // Count completed sessions
      prisma.session.count({
        where: {
          menteeId,
          status: 'completed'
        }
      }),
      // Count learning goals from profile
      prisma.profile.findUnique({
        where: { userId: menteeId },
        select: { learningGoals: true }
      }).then(profile => {
        if (!profile?.learningGoals) return 0;
        return profile.learningGoals.split(',').length;
      })
    ]);

    return res.status(200).json({
      totalMentors,
      activeSessions,
      completedSessions,
      learningGoals
    });
  } catch (error) {
    console.error('Error fetching mentee dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 