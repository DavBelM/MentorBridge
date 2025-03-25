// src/pages/api/mentors/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { authMiddleware } from '@/lib/middleware';

const prisma = new PrismaClient().$extends(withAccelerate());

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      search = '', 
      page = '1', 
      limit = '10',
      skills = '',
      availability = ''
    } = req.query;
    
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause: any = {
      role: 'MENTOR',
      OR: []
    };
    
    // Add search conditions if provided
    if (search) {
      whereClause.OR = [
        { fullname: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } },
        { profile: { bio: { contains: search as string, mode: 'insensitive' } } },
      ];
    }
    
    // Add skills filter if provided
    if (skills) {
      whereClause.profile = {
        ...whereClause.profile,
        skills: {
          contains: skills as string,
          mode: 'insensitive',
        }
      };
    }
    
    // Add availability filter if provided
    if (availability) {
      whereClause.profile = {
        ...whereClause.profile,
        availability: {
          contains: availability as string,
          mode: 'insensitive',
        }
      };
    }

    const mentors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        role: true,
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
            interests: true
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.user.count({
      where: whereClause,
    });

    res.status(200).json({
      mentors,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    res.status(500).json({ error: 'Failed to fetch mentors' });
  }
}

export default authMiddleware(handler);