import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextApiRequest } from 'next';

const prisma = new PrismaClient().$extends(withAccelerate())

export async function registerUser(email: string, password: string, fullname: string, username: string, role: string) {
  // Validate inputs
  if (!email || !password || !fullname || !username || !role) {
    throw new Error('Missing required fields');
  }
  
  // Normalize role to ensure consistent casing
  // This ensures roles are always stored as 'MENTOR' or 'MENTEE' in uppercase
  const normalizedRole = role.toUpperCase();
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullname,
        username,
        role: normalizedRole, // Ensure role is set correctly
      },
    });
    
    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Error registering user:', error);
    
    // Better error handling with specific messages
      
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target as string[];
        if (target?.includes('email')) {
          throw new Error('Email already in use');
        } else if (target?.includes('username')) {
          throw new Error('Username already taken');
        }
      }
    }
    
    throw error;
  }
}

export async function loginUser(email: string, password: string) {

    const user = await prisma.user.findUnique({
        where: {
        email,
        },
    })
    if (!user) {
        throw new Error('No user found')
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        throw new Error('Invalid password')
    }
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return {token, user};
}

/**
 * Gets the current user session from an API request
 * Works with the Pages Router (/pages/api/) endpoints
 */
export async function getSession(req?: NextApiRequest) {
  try {
    // If no request is provided, return null
    if (!req) {
      return null;
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return null;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get the user from database using the userId from the token
      const userId = (decoded as { userId: number }).userId;
      if (!userId) {
        return null;
      }
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });
      
      if (!user) {
        return null;
      }
      
      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error verifying JWT token:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

