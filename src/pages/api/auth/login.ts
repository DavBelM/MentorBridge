import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    try {
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          fullname: true,
          username: true,
          role: true,
        },
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Create a JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          role: user.role
        },
        process.env.JWT_SECRET || 'fallback-secret-please-change',
        { expiresIn: '7d' }
      );
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      console.log("Login successful for user ID:", user.id);
      console.log("Token generated successfully");
      
      // Return user data and token
      res.status(200).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'An error occurred during login' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}