import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

// Extend the NextApiRequest type to include the user property
declare module 'next' {
  interface NextApiRequest {
    user?: {
      id: number;
      email?: string;
      fullname?: string; 
      role?: string;
    };
  }
}

// Middleware to protect API routes
export function authMiddleware(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      // Make sure JWT_SECRET is defined
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not defined in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      
      // Debug info
      console.log("Token received:", token.substring(0, 10) + "...");
      
      try {
        // Verify the token
        const decoded = jwt.verify(token, jwtSecret) as { userId: number; role?: string };
        
        // Get the user from the database
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, role: true }
        });
        
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        
        // Attach user to request
        req.user = user;
        
        // Call the handler
        return await handler(req, res);
      } catch (jwtError) {
        console.error('Authentication error:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      console.error('Middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
