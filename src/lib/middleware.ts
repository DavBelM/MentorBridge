import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Extend the NextApiRequest type to include the user property
declare module 'next' {
  interface NextApiRequest {
    user?: any;
  }
}

// Middleware to protect API routes
export function authMiddleware(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - Missing or invalid token format' });
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
      
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Add the user to the request object
      req.user = user;
      
      // Call the handler function
      return await handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
