// src/pages/api/mentors/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { search = '', page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const mentors = await prisma.user.findMany({
      where: {
        role: 'MENTOR',
        OR: [
          { fullname: { contains: search as string, mode: 'insensitive' } },
          { username: { contains: search as string, mode: 'insensitive' } },
          { profile: { bio: { contains: search as string, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        profile: {
          select: {
            bio: true,
            location: true,
            profilePicture: true,
            skills: true,
            experience: true,
            availability: true,
            linkedin: true,
            twitter: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.user.count({
      where: {
        role: 'MENTOR',
        OR: [
          { fullname: { contains: search as string, mode: 'insensitive' } },
          { username: { contains: search as string, mode: 'insensitive' } },
          { profile: { bio: { contains: search as string, mode: 'insensitive' } } },
        ],
      },
    });

    res.status(200).json({
      mentors,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
}

export default authMiddleware(handler);