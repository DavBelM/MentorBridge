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
  const resourceId = parseInt(id as string);
  
  if (isNaN(resourceId)) {
    return res.status(400).json({ error: 'Invalid resource ID' });
  }
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
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
          collections: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });
      
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Check if user has access to this resource
      if (!resource.isPublic && resource.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }
      
      return res.status(200).json({ resource });
    } catch (error) {
      console.error('Error fetching resource:', error);
      return res.status(500).json({ error: 'Failed to fetch resource' });
    }
  }
  
  // Handle PATCH request
  if (req.method === 'PATCH') {
    try {
      // Get the resource to check ownership
      const existingResource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      
      if (!existingResource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Check if user is the creator
      if (existingResource.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to update this resource' });
      }
      
      const { title, description, type, url, isPublic, collectionIds } = req.body;
      
      // Update the resource
      const updatedResource = await prisma.resource.update({
        where: { id: resourceId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(type && { type }),
          ...(url !== undefined && { url }),
          ...(isPublic !== undefined && { isPublic }),
          ...(collectionIds && {
            collections: {
              set: [], // Remove existing connections
              connect: collectionIds.map((id: number) => ({ id })),
            },
          }),
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
          collections: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      return res.status(200).json({ resource: updatedResource });
    } catch (error) {
      console.error('Error updating resource:', error);
      return res.status(500).json({ error: 'Failed to update resource' });
    }
  }
  
  // Handle DELETE request
  if (req.method === 'DELETE') {
    try {
      // Get the resource to check ownership
      const existingResource = await prisma.resource.findUnique({
        where: { id: resourceId },
      });
      
      if (!existingResource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      // Check if user is the creator
      if (existingResource.createdById !== session.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this resource' });
      }
      
      // Delete the resource
      await prisma.resource.delete({
        where: { id: resourceId },
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting resource:', error);
      return res.status(500).json({ error: 'Failed to delete resource' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}