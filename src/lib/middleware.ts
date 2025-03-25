import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Define a custom NextApiRequest that includes the user
interface AuthenticatedRequest extends NextApiRequest {
  user?: any;
}

export function authMiddleware(handler: Function) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Get token from headers
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No valid token provided' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized - No token found' });
      }
      
      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullname: true,
          username: true,
          email: true,
          role: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      
      // Call the original handler
      return await handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      return res.status(500).json({ error: 'Internal server error during authentication' });
    }
  };
}
