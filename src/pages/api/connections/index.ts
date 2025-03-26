// src/pages/api/connections/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/auth';

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

      const userId = parseInt(req.user.id, 10);
      const isMentor = req.user.role === 'MENTOR';
      const status = req.query.status as string | undefined;
      
      // Build the where clause
      const where: any = isMentor 
        ? { mentorId: userId } 
        : { menteeId: userId };
      
      // Add status filter if provided
      if (status && ['pending', 'accepted', 'rejected'].includes(status)) {
        where.status = status;
      }
      
      const connections = await prisma.connection.findMany({
        where,
        include: {
          mentorUser: {
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
          },
          menteeUser: {
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
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      return res.status(200).json({ connections });
    } catch (error) {
      console.error('Error fetching connections:', error);
      return res.status(500).json({ error: 'Failed to fetch connections' });
    }
  } 
  // POST request - create a new connection request
  else if (req.method === 'POST') {
    try {
      const { mentorId } = req.body;
      
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const menteeId = parseInt(req.user.id, 10);
      
      if (!mentorId) {
        return res.status(400).json({ error: 'Mentor ID is required' });
      }
      
      // Check if the user is trying to connect with themselves
      if (mentorId === menteeId) {
        return res.status(400).json({ error: 'You cannot connect with yourself' });
      }
      
      // Check if a connection already exists
      const existingConnection = await prisma.connection.findFirst({
        where: {
          mentorId: Number(mentorId),
          menteeId: menteeId,
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
          mentorId: Number(mentorId),
          menteeId: menteeId,
          status: 'pending',
        },
        include: {
          mentorUser: {
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
          },
          menteeUser: {
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
          },
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