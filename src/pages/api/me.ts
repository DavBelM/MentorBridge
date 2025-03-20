import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // The middleware already attached the user to the request
    // Remove the password before sending it to the client
    const { password, ...userWithoutPassword } = req.user;
    
    res.status(200).json({
      user: userWithoutPassword,
      message: 'User data retrieved successfully',
    });
  } catch (error) {
    console.error('Error in /api/me:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);