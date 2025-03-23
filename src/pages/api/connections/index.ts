// src/pages/api/connections/index.ts
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

    // Get all connections based on the user's role
    const connections = await prisma.connection.findMany({
      where: isMentor 
        ? { mentorId: userId } 
        : { menteeId: userId },
      include: {
        mentorUser: {  // Use the correct relation name from schema
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
        },
        menteeUser: {  // Use the correct relation name from schema
          select: {
            id: true,
            fullname: true,
            profile: {
              select: {
                profilePicture: true,
                bio: true,
                interests: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Transform the data to match the expected format in the frontend
    const transformedConnections = connections.map(connection => ({
      ...connection,
      mentor: connection.mentorUser,
      mentee: connection.menteeUser,
      mentorUser: undefined,
      menteeUser: undefined,
    }));

    return res.status(200).json({ connections: transformedConnections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return res.status(500).json({ error: 'Failed to fetch connections' });
  }
}

export default authMiddleware(handler);