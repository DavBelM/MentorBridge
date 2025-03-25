// src/pages/api/connections/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

// Extend the NextApiRequest to include the user property
declare module 'next' {
  interface NextApiRequest {
    user?: {
      id: string;
      role: string;
    };
  }
}

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET request - get user connections
  if (req.method === 'GET') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = req.user.id;
      const isMentor = req.user.role === 'MENTOR';
      const status = req.query.status as string | undefined;

      // Build where clause
      const whereClause: any = isMentor 
        ? { mentorId: parseInt(userId) } 
        : { menteeId: parseInt(userId) };
      
      // Add status filter if provided
      if (status) {
        whereClause.status = status;
      }

      // Get connections based on the user's role and filters
      const connections = await prisma.connection.findMany({
        where: whereClause,
        include: {
          mentorUser: {
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
          menteeUser: {
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

      // Transform the data for easier use on the frontend
      const formattedConnections = connections.map(connection => ({
        id: connection.id,
        status: connection.status,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        mentorId: connection.mentorId,
        menteeId: connection.menteeId,
        mentor: connection.mentorUser,
        mentee: connection.menteeUser,
      }));

      return res.status(200).json({ connections: formattedConnections });
    } catch (error) {
      console.error('Error fetching connections:', error);
      return res.status(500).json({ error: 'Failed to fetch connections' });
    }
  } 
  // POST request - create a new connection request
  else if (req.method === 'POST') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Only mentees can send connection requests
      if (req.user.role !== 'MENTEE') {
        return res.status(403).json({ error: 'Only mentees can send connection requests' });
      }

      const { mentorId } = req.body;
      
      if (!mentorId) {
        return res.status(400).json({ error: 'Mentor ID is required' });
      }

      // Check if the mentor exists
      const mentor = await prisma.user.findUnique({
        where: {
          id: mentorId,
          role: 'MENTOR'
        },
      });

      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }

      // Check if there's already a connection between them
      const existingConnection = await prisma.connection.findFirst({
        where: {
          mentorId: mentorId,
          menteeId: parseInt(req.user.id)
        },
      });

      if (existingConnection) {
        return res.status(400).json({ 
          error: 'Connection already exists',
          status: existingConnection.status
        });
      }

      // Create the connection
      const connection = await prisma.connection.create({
        data: {
          mentorId: mentorId,
          menteeId: parseInt(req.user.id),
          status: 'pending'
        },
      });

      return res.status(201).json({ connection });
    } catch (error) {
      console.error('Error creating connection request:', error);
      return res.status(500).json({ error: 'Failed to create connection request' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default authMiddleware(handler);