import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '@/lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // If we reach this point, the token is valid and the user object has been attached by middleware
    const { password: _, ...userWithoutPassword } = req.user;
    
    res.status(200).json({
      verified: true,
      user: userWithoutPassword,
      message: 'Token is valid'
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);