import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import formidable from 'formidable';
import path from 'path';
import { mkdir } from 'fs/promises';

// Don't parse body as JSON for POST requests (to handle FormData)
export const config = {
  api: {
    bodyParser: (req: NextApiRequest) => req.method !== 'POST',
  },
};

// Use regular PrismaClient for consistency
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const session = await getSession(req);
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Handle GET request for listing resources
  if (req.method === 'GET') {
    try {
      console.log("GET request to /api/resources with query:", req.query);
      
      const { type, collection, search, page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      
      // Build query filters
      const whereClause: any = {
        OR: [
          { createdById: session.user.id },
          { isPublic: true },
        ],
      };
      
      // Add type filter if it's not "all"
      if (type && type !== "all") {
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
        whereClause.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      console.log("Using whereClause:", JSON.stringify(whereClause, null, 2));
      
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
      
      console.log(`Found ${resources.length} resources`);
      
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
  
  // Handle POST request for creating a resource
  if (req.method === 'POST') {
    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        return `${session.user.id}-${uniqueSuffix}${path.extname(part.originalFilename || '')}`;
      },
    });
    
    return new Promise((resolve) => {
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form data:", err);
          res.status(400).json({ error: "Failed to parse form data" });
          return resolve(null);
        }
        
        try {
          // Extract form fields
          const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
          const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
          const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
          const isPublic = Array.isArray(fields.isPublic) 
            ? fields.isPublic[0] === 'true' 
            : fields.isPublic === 'true';
          const url = Array.isArray(fields.url) ? fields.url[0] : fields.url;
          
          // Process collections
          let collectionIds: number[] = [];
          const collectionIdsStr = Array.isArray(fields.collectionIds) 
            ? fields.collectionIds[0] 
            : fields.collectionIds;
            
          if (collectionIdsStr) {
            try {
              collectionIds = JSON.parse(collectionIdsStr);
            } catch (e) {
              console.error("Error parsing collectionIds:", e);
            }
          }
          
          // Handle file upload
          let fileUrl: string | null = null;
          if (files.file) {
            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            fileUrl = `/uploads/${path.basename(file.filepath)}`;
          }
          
          // Validate required fields
          if (!title || !type) {
            res.status(400).json({ error: 'Title and type are required' });
            return resolve(null);
          }
          
          // Create resource
          const resource = await prisma.resource.create({
            data: {
              title,
              description: description || null,
              type,
              url: fileUrl || url || null,
              isPublic: !!isPublic,
              createdById: session.user.id,
              ...(collectionIds.length > 0
                ? {
                    collections: {
                      connect: collectionIds.map(id => ({ id })),
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
          
          res.status(201).json({ resource });
        } catch (error) {
          console.error('Error creating resource:', error);
          res.status(500).json({ error: 'Failed to create resource' });
        }
        return resolve(null);
      });
    });
  }
  
  // Handle unsupported methods
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}