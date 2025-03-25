import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    // Deactivate user
    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        isActive: false
      }
    });
    
    return res.status(200).json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return res.status(500).json({ error: "Failed to deactivate account" });
  }
}