import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import formidable from 'formidable';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { disconnect } from 'process';

// Configure formidable to parse multipart form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const { id } = req.query;
  
  // Handle GET request to fetch a resource
  if (req.method === 'GET') {
    try {
      const resource = await prisma.resource.findUnique({
        where: { id: Number(id) },
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
  // Handle PATCH request to update a resource
  else if (req.method === 'PATCH') {
    try {
      // Check resource ownership
      const resource = await prisma.resource.findUnique({
        where: { id: Number(id) },
        select: { createdById: true }
      });
      
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      
      if (resource.createdById !== session.user.id) {
        return res.status(403).json({ error: "You don't have permission to update this resource" });
      }
      
      // Parse the form data with file
      const form = formidable({
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        uploadDir: path.join(process.cwd(), 'public/uploads'),
        filename: (_name, _ext, part) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          return `${session.user.id}-${uniqueSuffix}${path.extname(part.originalFilename || '')}`
        },
        filter: (part) => {
          // Filter file uploads by mimetype
          return part.name === 'file' && 
                 !!(part.mimetype?.includes('pdf') || 
                  part.mimetype?.includes('word') || 
                  part.mimetype?.includes('excel') || 
                  part.mimetype?.includes('presentation'));
        },
      });
      
      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      await mkdir(uploadDir, { recursive: true });
      
      return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error("Error parsing form data:", err);
            res.status(500).json({ error: "Failed to process file upload" });
            return resolve(null);
          }
          
          try {
            const title = Array.isArray(fields.title) ? fields.title[0] : fields.title;
            const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
            const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
            const isPublic = Array.isArray(fields.isPublic) 
              ? fields.isPublic[0] === 'true' 
              : fields.isPublic === 'true';
            const url = Array.isArray(fields.url) ? fields.url[0] : fields.url;
            const collectionIdsStr = Array.isArray(fields.collectionIds) 
              ? fields.collectionIds[0] 
              : fields.collectionIds;
            
            // Process collections
            let collectionIds: number[] = [];
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
            
            // Update resource in database
            const updatedResource = await prisma.resource.update({
              where: { id: Number(id) },
              data: {
                title,
                description,
                type,
                url: fileUrl || url || null,
                isPublic,
              },
            });
            
            // Handle collection associations
            if (collectionIds.length > 0) {
              // First, get the existing resource with its collections
              const existingResource = await prisma.resource.findUnique({
                where: { id: Number(id) },
                include: { collections: true }
              });
              
              // Update resource-collection relationships
              await prisma.resource.update({
                where: { id: Number(id) },
                data: {
                  collections: {
                    disconnect: existingResource?.collections.map(col => ({ id: col.id })) || [],
                    connect: collectionIds.map(colId => ({ id: colId }))
                  }
                }
              });
            }
            
            res.status(200).json({ resource: updatedResource });
            return resolve(null);
          } catch (error) {
            console.error("Error updating resource:", error);
            res.status(500).json({ error: "Failed to update resource" });
            return resolve(null);
          }
        });
      });
    } catch (error) {
      console.error("Error updating resource:", error);
      return res.status(500).json({ error: "Failed to update resource" });
    }
  } 
  // Handle DELETE request
  else if (req.method === 'DELETE') {
    try {
      // Get the resource to check ownership
      const existingResource = await prisma.resource.findUnique({
        where: { id: Number(id) },
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
        where: { id: Number(id) },
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting resource:', error);
      return res.status(500).json({ error: 'Failed to delete resource' });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}