import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id
        }
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }
    
    // Update user
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        email
      }
    });
    
    return res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
}