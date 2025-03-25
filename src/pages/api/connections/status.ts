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

    const mentorId = parseInt(req.query.mentorId as string);
    
    if (isNaN(mentorId)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    // Check if there's a connection between the mentee and mentor
    const connection = await prisma.connection.findFirst({
      where: {
        mentorId: mentorId,
        menteeId: parseInt(req.user.id)
      },
    });

    return res.status(200).json({ 
      status: connection ? connection.status : null,
      connection
    });
  } catch (error) {
    console.error('Error checking connection status:', error);
    return res.status(500).json({ error: 'Failed to check connection status' });
  }
}

export default authMiddleware(handler);