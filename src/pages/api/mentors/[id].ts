import type { NextApiRequest, NextApiResponse } from 'next';
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

    const mentorId = parseInt(req.query.id as string);
    
    if (isNaN(mentorId)) {
      return res.status(400).json({ error: 'Invalid mentor ID' });
    }

    // Fetch the mentor by ID
    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
        role: 'MENTOR'
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        role: true,
        profile: {
          select: {
            bio: true,
            location: true,
            linkedin: true,
            twitter: true,
            profilePicture: true,
            experience: true,
            skills: true,
            availability: true,
            interests: true
          }
        }
      }
    });

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    return res.status(200).json({ mentor });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return res.status(500).json({ error: 'Failed to fetch mentor profile' });
  }
}

export default authMiddleware(handler);