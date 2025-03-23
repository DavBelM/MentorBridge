// src/app/api/mentors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const prisma = new PrismaClient().$extends(withAccelerate());

export async function GET(request: NextRequest) {
  try {
    // Access query parameters 
    const searchParams = request.nextUrl.searchParams;
    const skills = searchParams.get('skills');
    const availability = searchParams.get('availability');
    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    
    // Parse pagination params
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;
    
    // Build the where clause
    const whereClause: any = {
      role: 'MENTOR',
      profile: {
        isNot: null,
      },
    };
    
    // Add skill filtering if provided
    if (skills) {
      whereClause.profile = {
        ...whereClause.profile,
        skills: {
          contains: skills,
          mode: 'insensitive',
        },
      };
    }
    
    // Add availability filtering if provided
    if (availability) {
      whereClause.profile = {
        ...whereClause.profile,
        availability: {
          contains: availability,
          mode: 'insensitive',
        },
      };
    }
    
    // Add search by name or username
    if (search) {
      whereClause.OR = [
        {
          fullname: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          profile: {
            bio: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }
    
    // Get mentors with their profiles
    const mentors = await prisma.user.findMany({
      where: whereClause,
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
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get total count for pagination
    const totalCount = await prisma.user.count({
      where: whereClause,
    });
    
    return NextResponse.json({
      mentors,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentors' }, 
      { status: 500 }
    );
  }
}