// src/pages/api/sessions/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      mentorId,
      menteeId,
      title,
      description,
      startTime,
      endTime
    } = req.body;

    // Validate required fields
    if (!mentorId || !menteeId || !title || !startTime || !endTime) {
      return res.status(400).json({
        error: 'Missing required fields: mentorId, menteeId, title, startTime, endTime'
      });
    }

    // Validate the user is either the mentor or mentee
    const userId = req.user.id;
    if (userId !== mentorId && userId !== menteeId) {
      return res.status(403).json({
        error: 'You can only create sessions where you are the mentor or mentee'
      });
    }

    // Validate the connection exists and is accepted
    const connection = await prisma.connection.findUnique({
      where: {
        mentorId_menteeId: {
          mentorId,
          menteeId
        },
      },
    });

    if (!connection || connection.status !== 'accepted') {
      return res.status(403).json({
        error: 'You can only create sessions with established connections'
      });
    }

    // Create the session
    const session = await prisma.session.create({
      data: {
        mentorId,
        menteeId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'scheduled',
      },
    });

    return res.status(201).json({ session });
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ error: 'Failed to create session' });
  }
}

export default authMiddleware(handler);