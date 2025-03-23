// src/pages/api/messages/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get messages for a connection
  if (req.method === 'GET') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { connectionId, limit = '50', before } = req.query;
      const userId = req.user.id;

      if (!connectionId) {
        return res.status(400).json({ error: 'Connection ID is required' });
      }

      // Check if user is part of this connection
      const connection = await prisma.connection.findUnique({
        where: { id: Number(connectionId) },
      });

      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      if (connection.mentorId !== userId && connection.menteeId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this conversation' });
      }

      // Pagination parameters
      const limitNum = parseInt(limit as string, 10);
      
      // Query parameters
      const queryParams: any = {
        where: { connectionId: Number(connectionId) },
        include: {
          sender: {
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
        orderBy: { createdAt: 'desc' },
        take: limitNum,
      };

      // Add cursor-based pagination if 'before' is provided
      if (before) {
        queryParams.cursor = {
          id: Number(before),
        };
        queryParams.skip = 1; // Skip the cursor message
      }

      const messages = await prisma.message.findMany(queryParams);

      // Mark messages as read if they are not from the current user
      const unreadMessageIds = messages
        .filter(message => message.senderId !== userId && !message.read)
        .map(message => message.id);

      if (unreadMessageIds.length > 0) {
        await prisma.message.updateMany({
          where: { id: { in: unreadMessageIds } },
          data: { read: true },
        });
      }

      // Return messages in chronological order (oldest first)
      return res.status(200).json({ messages: messages.reverse() });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }

  // Send a new message
  if (req.method === 'POST') {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { connectionId, content } = req.body;
      const senderId = req.user.id;

      if (!connectionId || !content) {
        return res.status(400).json({ error: 'Connection ID and content are required' });
      }

      // Check if user is part of this connection
      const connection = await prisma.connection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        return res.status(404).json({ error: 'Connection not found' });
      }

      if (connection.mentorId !== senderId && connection.menteeId !== senderId) {
        return res.status(403).json({ error: 'You do not have access to this conversation' });
      }

      // Create the message
      const message = await prisma.message.create({
        data: {
          connectionId,
          senderId,
          content,
        },
        include: {
          sender: {
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

      return res.status(201).json({ message });
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default authMiddleware(handler);