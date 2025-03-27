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

    if (!session || session.user.role !== 'MENTEE') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const menteeId = session.user.id;

    // Get total sessions and completed sessions
    const [totalSessions, completedSessions] = await Promise.all([
      prisma.session.count({
        where: { menteeId }
      }),
      prisma.session.count({
        where: {
          menteeId,
          status: 'completed'
        }
      })
    ]);

    // Get total mentors and active connections
    const [totalMentors, activeConnections] = await Promise.all([
      prisma.connection.count({
        where: { menteeId }
      }),
      prisma.connection.count({
        where: {
          menteeId,
          status: 'active'
        }
      })
    ]);

    // Get mentee's profile and learning goals
    const profile = await prisma.profile.findUnique({
      where: { userId: menteeId }
    });

    // Calculate progress percentages
    const sessionCompletionRate = totalSessions > 0 
      ? Math.round((completedSessions / totalSessions) * 100) 
      : 0;

    const mentorConnectionRate = totalMentors > 0 
      ? Math.round((activeConnections / totalMentors) * 100) 
      : 0;

    const profileCompletionRate = profile ? calculateProfileCompletion(profile) : 0;

    // Calculate learning goals progress
    const learningGoalsProgress = calculateLearningGoalsProgress(profile?.learningGoals);

    const progress = [
      {
        category: 'Session Completion',
        value: sessionCompletionRate,
        description: `${completedSessions} out of ${totalSessions} sessions completed`
      },
      {
        category: 'Mentor Connections',
        value: mentorConnectionRate,
        description: `${activeConnections} out of ${totalMentors} active connections`
      },
      {
        category: 'Profile Completion',
        value: profileCompletionRate,
        description: 'Profile information completeness'
      },
      {
        category: 'Learning Goals',
        value: learningGoalsProgress,
        description: 'Progress towards learning goals'
      }
    ];

    return res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching mentee progress:', error);
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
    profile.interests,
    profile.learningGoals
  ];

  const completedFields = fields.filter(field => field && field.trim() !== '');
  return Math.round((completedFields.length / fields.length) * 100);
}

function calculateLearningGoalsProgress(learningGoals: string | null): number {
  if (!learningGoals) return 0;

  const goals = learningGoals.split(',').map(goal => goal.trim());
  if (goals.length === 0) return 0;

  // This is a placeholder - in a real application, you would track progress
  // towards each goal separately and calculate an average
  return 50; // Placeholder value
} 