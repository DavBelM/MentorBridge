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
  
  // Handle GET request
  if (req.method === 'GET') {
    try {
      const { type, collection, search, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      // Build query filters
      const whereClause: any = {
        OR: [
          { createdById: session.user.id },
          { isPublic: true },
        ],
      };
      
      // Add type filter
      if (type) {
        whereClause.type = type;
      }
      
      // Add collection filter
      if (collection) {
        whereClause.collections = {
          some: { id: parseInt(collection as string) },
        };
      }
      
      // Add search filter
      if (search) {
        whereClause.OR = whereClause.OR || [];
        whereClause.OR.push(
          {
            title: {
              contains: search as string,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search as string,
              mode: 'insensitive',
            },
          }
        );
      }
      
      // Get resources with pagination
      const resources = await prisma.resource.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      });
      
      // Get total count for pagination
      const totalCount = await prisma.resource.count({
        where: whereClause,
      });
      
      return res.status(200).json({
        resources,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limitNum),
          page: pageNum,
          limit: limitNum,
        },
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      return res.status(500).json({ error: 'Failed to fetch resources' });
    }
  }
  
  // Handle POST request
  if (req.method === 'POST') {
    try {
      const { title, description, type, url, isPublic, collectionIds } = req.body;
      
      // Validate required fields
      if (!title || !type) {
        return res.status(400).json({ error: 'Title and type are required' });
      }
      
      // Create resource
      const resource = await prisma.resource.create({
        data: {
          title,
          description,
          type,
          url,
          isPublic: !!isPublic,
          createdById: session.user.id,
          ...(collectionIds && collectionIds.length > 0
            ? {
                collections: {
                  connect: collectionIds.map((id: number) => ({ id })),
                },
              }
            : {}),
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
      
      return res.status(201).json({ resource });
    } catch (error) {
      console.error('Error creating resource:', error);
      return res.status(500).json({ error: 'Failed to create resource' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}