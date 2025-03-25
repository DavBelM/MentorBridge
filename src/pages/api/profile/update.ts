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
  if (req.method !== 'PUT') {
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
    
    // Check if the user already has a profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    if (!existingProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    // Handle profile picture upload
    let profilePicturePath = existingProfile.profilePicture;
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
    
    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        bio: getFieldValue('bio') || existingProfile.bio,
        location: getFieldValue('location') || existingProfile.location,
        linkedin: getFieldValue('linkedin') !== undefined ? getFieldValue('linkedin') : existingProfile.linkedin,
        twitter: getFieldValue('twitter') !== undefined ? getFieldValue('twitter') : existingProfile.twitter,
        profilePicture: profilePicturePath,
        // Role-specific fields
        experience: getFieldValue('experience') !== undefined ? getFieldValue('experience') : existingProfile.experience,
        skills: getFieldValue('skills') !== undefined ? getFieldValue('skills') : existingProfile.skills,
        availability: getFieldValue('availability') !== undefined ? getFieldValue('availability') : existingProfile.availability,
        interests: getFieldValue('interests') !== undefined ? getFieldValue('interests') : existingProfile.interests,
        learningGoals: getFieldValue('learningGoals') !== undefined ? getFieldValue('learningGoals') : existingProfile.learningGoals,
      },
    });
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

export default authMiddleware(handler);