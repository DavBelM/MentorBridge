import { NextApiRequest, NextApiResponse } from 'next';
import { registerUser } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { fullname, username, email, password, role } = req.body;
    
    // Generate a unique username if collision occurs
    const generateUniqueUsername = async (baseUsername: string) => {
      let uniqueUsername = baseUsername;
      let counter = 1;
      let userExists = true;
      
      while (userExists) {
        try {
          // Check if username exists
          const existingUser = await prisma.user.findUnique({
            where: { username: uniqueUsername },
          });
          
          if (!existingUser) {
            userExists = false;
          } else {
            // Username exists, try a new one with a counter
            uniqueUsername = `${baseUsername}${counter}`;
            counter++;
          }
        } catch (error) {
          // Handle error checking for existing user
          throw new Error('Error checking username availability');
        }
      }
      
      return uniqueUsername;
    };
    
    try {
      // Ensure username is unique
      const finalUsername = await generateUniqueUsername(username || `user_${Date.now().toString().slice(-6)}`);
      
      const user = await registerUser(email, password, fullname, finalUsername, role);
      res.status(201).json(user);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(400).json({ error: errorMessage });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}