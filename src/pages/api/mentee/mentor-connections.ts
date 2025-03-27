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

    const connections = await prisma.connection.findMany({
      where: {
        menteeId
      },
      include: {
        mentorUser: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedConnections = connections.map(connection => ({
      id: connection.id,
      mentorName: connection.mentorUser.fullname,
      expertise: connection.mentorUser.profile?.skills?.split(',') || [],
      status: connection.status
    }));

    return res.status(200).json(formattedConnections);
  } catch (error) {
    console.error('Error fetching mentor connections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 