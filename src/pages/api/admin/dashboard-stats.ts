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

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [
      totalUsers,
      activeMentors,
      activeMentees,
      totalConnections
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: 'MENTOR',
          isActive: true,
          isApproved: true
        }
      }),
      prisma.user.count({
        where: {
          role: 'MENTEE',
          isActive: true
        }
      }),
      prisma.connection.count({
        where: {
          status: 'active'
        }
      })
    ]);

    return res.status(200).json({
      totalUsers,
      activeMentors,
      activeMentees,
      totalConnections
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 