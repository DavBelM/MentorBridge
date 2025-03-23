// src/pages/api/connections/manage.ts
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
    const { connectionId, action } = req.body;
    const userId = req.user?.id;

    if (!connectionId || !action) {
      return res.status(400).json({ error: 'Connection ID and action are required' });
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    if (connection.mentorId !== userId && connection.menteeId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to manage this connection' });
    }

    let updatedConnection;
    if (action === 'accept') {
      updatedConnection = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'accepted' },
      });
    } else if (action === 'reject') {
      updatedConnection = await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'rejected' },
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json(updatedConnection);
  } catch (error) {
    console.error('Error managing connection request:', error);
    res.status(500).json({ error: 'Failed to manage connection request' });
  }
}

export default authMiddleware(handler);