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

    const pendingMentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR',
        isApproved: false,
        isActive: true
      },
      include: {
        profile: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(pendingMentors);
  } catch (error) {
    console.error('Error fetching pending mentors:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 