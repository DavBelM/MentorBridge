import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ApiResponse } from '@/types/api' 

const prisma = new PrismaClient().$extends(withAccelerate())

// Standard response type
type LoginResponse = ApiResponse<{
  user: {
    id: number;
    fullname: string;
    email: string;
    role: string;
  };
  token: string;
}>;

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<LoginResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { email, password } = req.body;

    // Field validation
    const fieldErrors: Record<string, string> = {};
    
    if (!email) fieldErrors.email = 'Email is required';
    if (!password) fieldErrors.password = 'Password is required';
    
    if (Object.keys(fieldErrors).length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        fieldErrors 
      });
    }

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
        },
        token,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'An error occurred during login' 
    });
  }
}