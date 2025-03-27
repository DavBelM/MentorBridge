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

    if (!session || session.user.role !== 'MENTOR') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const mentorId = session.user.id;

    const [
      totalMentees,
      activeSessions,
      completedSessions,
      pendingRequests
    ] = await Promise.all([
      // Count total mentees
      prisma.connection.count({
        where: {
          mentorId,
          status: 'active'
        }
      }),
      // Count active sessions
      prisma.session.count({
        where: {
          mentorId,
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
          mentorId,
          status: 'completed'
        }
      }),
      // Count pending connection requests
      prisma.connection.count({
        where: {
          mentorId,
          status: 'pending'
        }
      })
    ]);

    return res.status(200).json({
      totalMentees,
      activeSessions,
      completedSessions,
      pendingRequests
    });
  } catch (error) {
    console.error('Error fetching mentor dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 