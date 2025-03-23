// src/pages/api/sessions/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const sessionId = Number(id);

  // Handle GET request - Get session details
  if (req.method === 'GET') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          mentor: {
            select: {
              id: true,
              fullname: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          mentee: {
            select: {
              id: true,
              fullname: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is part of this session
      if (session.mentorId !== req.user.id && session.menteeId !== req.user.id) {
        return res.status(403).json({ error: 'You do not have access to this session' });
      }

      return res.status(200).json({ session });
    } catch (error) {
      console.error('Error fetching session:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
  }

  // Handle PATCH request - Update session
  if (req.method === 'PATCH') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        title,
        description,
        startTime,
        endTime,
        status,
        notes
      } = req.body;

      // Get existing session
      const existingSession = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is part of this session
      if (existingSession.mentorId !== req.user.id && existingSession.menteeId !== req.user.id) {
        return res.status(403).json({ error: 'You do not have access to this session' });
      }

      // Update the session
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(startTime && { startTime: new Date(startTime) }),
          ...(endTime && { endTime: new Date(endTime) }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });

      return res.status(200).json({ session: updatedSession });
    } catch (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  }

  // Handle DELETE request - Cancel session
  if (req.method === 'DELETE') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get existing session
      const existingSession = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is part of this session
      if (existingSession.mentorId !== req.user.id && existingSession.menteeId !== req.user.id) {
        return res.status(403).json({ error: 'You do not have access to this session' });
      }

      // Don't delete, just mark as cancelled
      const updatedSession = await prisma.session.update({
        where: { id: sessionId },
        data: { status: 'cancelled' },
      });

      return res.status(200).json({ session: updatedSession });
    } catch (error) {
      console.error('Error cancelling session:', error);
      return res.status(500).json({ error: 'Failed to cancel session' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);