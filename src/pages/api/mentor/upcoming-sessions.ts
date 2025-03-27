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

    const upcomingSessions = await prisma.session.findMany({
      where: {
        mentorId,
        status: 'scheduled',
        startTime: {
          gte: new Date()
        }
      },
      include: {
        mentee: {
          select: {
            fullname: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: 5 // Limit to next 5 sessions
    });

    const formattedSessions = upcomingSessions.map(session => ({
      id: session.id,
      title: session.title,
      menteeName: session.mentee.fullname,
      startTime: session.startTime,
      endTime: session.endTime
    }));

    return res.status(200).json(formattedSessions);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 