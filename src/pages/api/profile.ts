import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '../../lib/middleware';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the multipart form data
    const form = formidable({ multiples: true });
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract the profile data from the form fields
    const userIdField = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const userId = parseInt(userIdField || '0');
    
    // Verify that the authenticated user is the same as the one being updated
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
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

    // Determine which fields to save based on user role
    const role = req.user.role.toUpperCase();
    const baseProfileData = {
      bio: Array.isArray(fields.bio) ? fields.bio[0] : (fields.bio || ''),
      location: Array.isArray(fields.location) ? fields.location[0] : (fields.location || ''),
      linkedin: Array.isArray(fields.linkedin) ? fields.linkedin[0] : (fields.linkedin || null),
      twitter: Array.isArray(fields.twitter) ? fields.twitter[0] : (fields.twitter || null),
      profilePicture: profilePicturePath,
    };

    const extraProfileData = role === 'MENTOR' 
      ? {
          experience: Array.isArray(fields.experience) ? fields.experience[0] : (fields.experience || ''),
          skills: Array.isArray(fields.skills) ? fields.skills.join(', ') : (fields.skills || ''),
          availability: Array.isArray(fields.availability) ? fields.availability[0] : (fields.availability || ''),
        }
      : {
          interests: Array.isArray(fields.interests) ? fields.interests[0] : (fields.interests || ''),
          learningGoals: Array.isArray(fields.learningGoals) ? fields.learningGoals[0] : (fields.learningGoals || ''),
        };

    // Create or update the profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        ...baseProfileData,
        ...extraProfileData,
      },
      create: {
        ...baseProfileData,
        ...extraProfileData,
        userId,
      },
    });

    res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
}

export default authMiddleware(handler);