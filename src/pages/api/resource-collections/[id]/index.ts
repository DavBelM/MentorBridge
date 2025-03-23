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
  
  // Get the ID from the URL
  const { id } = req.query;
  const collectionId = parseInt(id as string);
  
  if (isNaN(collectionId)) {
    return res.status(400).json({ error: 'Invalid collection ID' });
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const collection = await prisma.resourceCollection.findUnique({
        where: { id: collectionId },
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
          resources: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  fullname: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
      
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      // Check if user has access to this collection
      if (!collection.isPublic && collection.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to access this collection' });
      }
      
      return res.status(200).json({ collection });
    } catch (error) {
      console.error('Error fetching collection:', error);
      return res.status(500).json({ error: 'Failed to fetch collection' });
    }
  }
  
  // Handle PATCH request
  if (req.method === 'PATCH') {
    try {
      // Get the collection to check ownership
      const existingCollection = await prisma.resourceCollection.findUnique({
        where: { id: collectionId },
      });
      
      if (!existingCollection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      // Check if user is the creator
      if (existingCollection.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to update this collection' });
      }
      
      const { name, description, isPublic } = req.body;
      
      // Update the collection
      const updatedCollection = await prisma.resourceCollection.update({
        where: { id: collectionId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
        },
        include: {
          createdBy: {
            select: {
              id: true,
              fullname: true,
              username: true,
            },
          },
        },
      });
      
      return res.status(200).json({ collection: updatedCollection });
    } catch (error) {
      console.error('Error updating collection:', error);
      return res.status(500).json({ error: 'Failed to update collection' });
    }
  }
  
  // Handle DELETE request
  if (req.method === 'DELETE') {
    try {
      // Get the collection to check ownership
      const existingCollection = await prisma.resourceCollection.findUnique({
        where: { id: collectionId },
      });
      
      if (!existingCollection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      
      // Check if user is the creator
      if (existingCollection.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this collection' });
      }
      
      // Delete the collection
      await prisma.resourceCollection.delete({
        where: { id: collectionId },
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting collection:', error);
      return res.status(500).json({ error: 'Failed to delete collection' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}