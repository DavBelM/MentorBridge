import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/auth';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.user.role !== 'MENTOR') {
      return res.status(403).json({ error: 'Only mentors can reject connection requests' });
    }

    const connectionId = parseInt(req.query.id as string);
    
    if (isNaN(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' });
    }
    
    // Verify the mentor is actually part of this connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    if (connection.mentorId !== parseInt(req.user.id, 10)) {
      return res.status(403).json({ error: 'You are not authorized to reject this connection' });
    }

    // Update the connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'rejected' },
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
    
    return res.status(200).json({ connection: updatedConnection });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    return res.status(500).json({ error: 'Failed to reject connection' });
  }
}

export default authMiddleware(handler);