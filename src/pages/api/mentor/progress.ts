import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || session.user.role !== 'MENTOR') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const mentorId = session.user.id;

    // Get total sessions and completed sessions
    const [totalSessions, completedSessions] = await Promise.all([
      prisma.session.count({
        where: { mentorId }
      }),
      prisma.session.count({
        where: {
          mentorId,
          status: 'completed'
        }
      })
    ]);

    // Get total mentees and active connections
    const [totalMentees, activeConnections] = await Promise.all([
      prisma.connection.count({
        where: { mentorId }
      }),
      prisma.connection.count({
        where: {
          mentorId,
          status: 'active'
        }
      })
    ]);

    // Calculate progress percentages
    const sessionCompletionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0;

    const connectionSuccessRate = totalMentees > 0 
      ? Math.round((activeConnections / totalMentees) * 100) 
      : 0;

    // Get mentor's profile to check completion
    const profile = await prisma.profile.findUnique({
      where: { userId: mentorId }
    });

    const profileCompletionRate = profile ? calculateProfileCompletion(profile) : 0;

    const progress = [
      {
        category: 'Session Completion',
        value: sessionCompletionRate,
        description: `${completedSessions} out of ${totalSessions} sessions completed`
      },
      {
        category: 'Connection Success',
        value: connectionSuccessRate,
        description: `${activeConnections} out of ${totalMentees} active connections`
      },
      {
        category: 'Profile Completion',
        value: profileCompletionRate,
        description: 'Profile information completeness'
      }
    ];

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching mentor progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function calculateProfileCompletion(profile: any): number {
  const fields = [
    profile.bio,
    profile.location,
    profile.experience,
    profile.skills,
    profile.availability,
    profile.interests
  ];

  const completedFields = fields.filter(field => field && field.trim() !== '');
  return Math.round((completedFields.length / fields.length) * 100);
} 