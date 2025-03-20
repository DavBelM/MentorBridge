import { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../lib/middleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // If we reach here, the user is authenticated
  res.status(200).json({ 
    message: 'You have access to this protected route',
    user: {
      id: req.user.id,
      email: req.user.email,
      fullname: req.user.fullname,
      role: req.user.role
    }
  });
}

// Wrap the handler with the auth middleware
export default authMiddleware(handler);