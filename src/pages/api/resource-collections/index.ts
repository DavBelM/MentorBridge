import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient().$extends(withAccelerate());

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession(req);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle GET request (list collections)
  if (req.method === 'GET') {
    try {
      const collections = await prisma.resourceCollection.findMany({
        where: {
          OR: [
            { createdById: session.user.id },
            { isPublic: true },
          ],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              fullname: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              resources: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return res.status(200).json({ collections });
    } catch (error) {
      console.error('Error fetching collections:', error);
      return res.status(500).json({ error: 'Failed to fetch collections' });
    }
  }

  // Handle POST request (create collection)
  if (req.method === 'POST') {
    try {
      const { name, description, isPublic } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Create collection
      const collection = await prisma.resourceCollection.create({
        data: {
          name,
          description,
          isPublic: !!isPublic,
          createdById: session.user.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              fullname: true,
              username: true,
              profile: {
                select: {
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      return res.status(201).json({ collection });
    } catch (error) {
      console.error('Error creating collection:', error);
      return res.status(500).json({ error: 'Failed to create collection' });
    }
  }

  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}