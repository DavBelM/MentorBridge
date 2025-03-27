import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const mentorId = parseInt(req.query.id as string);
    const { approved } = req.body;

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor ID is required' });
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      include: { profile: true }
    });

    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }

    if (mentor.role !== 'MENTOR') {
      return res.status(400).json({ message: 'User is not a mentor' });
    }

    // Update mentor approval status
    const updatedMentor = await prisma.user.update({
      where: { id: mentorId },
      data: {
        isApproved: approved,
        isActive: approved // If rejected, deactivate the account
      }
    });

    // Create notification for the mentor
    await prisma.notification.create({
      data: {
        userId: mentorId,
        type: 'MENTOR_APPROVAL',
        title: approved ? 'Mentor Application Approved' : 'Mentor Application Rejected',
        content: approved 
          ? 'Your mentor application has been approved. You can now start mentoring mentees.'
          : 'Your mentor application has been rejected. Please contact support for more information.',
        isRead: false
      }
    });

    return res.status(200).json(updatedMentor);
  } catch (error) {
    console.error('Error processing mentor approval:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 