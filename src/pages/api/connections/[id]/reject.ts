import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PUT method
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session directly from the request
    const session = await getSession(req);
    const user = session?.user;
    
    if (!user || user.role !== 'MENTOR') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const connectionId = parseInt(req.query.id as string);
    
    // Verify the mentor is actually part of this connection
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.mentorId !== user.id) {
      return res.status(403).json({ 
        error: 'Connection not found or you do not have permission' 
      });
    }

    // Update the connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'rejected' },
    });

    return res.status(200).json({ connection: updatedConnection });
  } catch (error) {
    console.error('Error rejecting connection:', error);
    return res.status(500).json({ error: 'Failed to reject connection' });
  }
}