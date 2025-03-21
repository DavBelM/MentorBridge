import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../../../lib/middleware';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Use the authenticated user's ID from the middleware
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Check if the user has a profile
    const profile = await prisma.profile.findUnique({
      where: { userId: Number(userId) },
    });
    
    // Return whether the user has a profile
    res.status(200).json({ hasProfile: !!profile });
  } catch (error) {
    console.error('Error checking profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);