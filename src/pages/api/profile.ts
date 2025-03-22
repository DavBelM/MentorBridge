import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient().$extends(withAccelerate());

// Parse form data with files
const parseForm = async (req: NextApiRequest) => {
  return new Promise<{ fields: any; files: any }>((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get authenticated user from middleware
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Parse the form data
    const { fields, files } = await parseForm(req);
    
    // Use authenticated user ID from the token
    const userId = req.user.id;
    
    console.log("Creating profile for user ID:", userId);
    console.log("Form fields:", fields);
    
    // Check if the user already has a profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists for this user' });
    }
    
    // Handle profile picture upload
    let profilePicturePath = null;
    if (files.profilePicture) {
      const file = Array.isArray(files.profilePicture) 
        ? files.profilePicture[0] 
        : files.profilePicture;
        
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate a unique filename
      const fileExt = path.extname(file.originalFilename || '.jpg');
      const newFilename = `${userId}-${Date.now()}${fileExt}`;
      const newPath = path.join(uploadsDir, newFilename);
      
      // Copy the uploaded file to the uploads directory
      await fs.promises.copyFile(file.filepath, newPath);
      
      // Store the relative path in the database
      profilePicturePath = `/uploads/${newFilename}`;
    }

    // Extract form values safely, handling array fields
    const getFieldValue = (fieldName: string) => {
      const value = fields[fieldName];
      return Array.isArray(value) ? value[0] : value;
    };
    
    // Create the profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        bio: getFieldValue('bio') || '',
        location: getFieldValue('location') || '',
        linkedin: getFieldValue('linkedin') || null,
        twitter: getFieldValue('twitter') || null,
        profilePicture: profilePicturePath,
        // Role-specific fields
        experience: getFieldValue('experience') || null,
        skills: getFieldValue('skills') || null,
        availability: getFieldValue('availability') || null,
        interests: getFieldValue('interests') || null,
        learningGoals: getFieldValue('learningGoals') || null,
      },
    });
    
    res.status(200).json(profile);
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
}

export default authMiddleware(handler);