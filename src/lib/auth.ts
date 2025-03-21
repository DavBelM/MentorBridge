import { PrismaClient, Prisma } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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

