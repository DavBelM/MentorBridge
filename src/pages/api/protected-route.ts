import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../lib/middleware';

// Extend the NextApiRequest type to include user property
interface ExtendedNextApiRequest extends NextApiRequest {
  user?: {
    id: number;
    email?: string;
    fullname?: string;
    role?: string;
  }
}

async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  try {
    // If we reach here, the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    res.status(200).json({ 
      message: 'You have access to this protected route',
      user: {
        id: req.user.id,
        email: req.user?.email,
        fullname: req.user?.fullname,
        role: req.user?.role
      }
    });
  } catch (error) {
    console.error('Error in protected route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Wrap the handler with the auth middleware
export default authMiddleware(handler);