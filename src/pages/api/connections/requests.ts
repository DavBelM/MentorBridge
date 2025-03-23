// src/pages/api/connections/request.ts
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
    const { mentorId } = req.body;
    const menteeId = req.user?.id;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ error: 'Mentor ID and Mentee ID are required' });
    }

    const existingConnection = await prisma.connection.findUnique({
      where: { mentorId_menteeId: { mentorId, menteeId } },
    });

    if (existingConnection) {
      return res.status(400).json({ error: 'Connection request already exists' });
    }

    const connection = await prisma.connection.create({
      data: {
        mentorId,
        menteeId,
        status: 'pending',
      },
    });

    res.status(201).json(connection);
  } catch (error) {
    console.error('Error creating connection request:', error);
    res.status(500).json({ error: 'Failed to create connection request' });
  }
}

export default authMiddleware(handler);