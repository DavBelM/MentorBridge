import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skills = searchParams.get('skills') || '';
    const availability = searchParams.get('availability') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      role: 'MENTOR',
      isApproved: true,
    };
    
    // Add search conditions if provided
    if (search) {
      whereClause.OR = [
        { fullname: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { profile: { bio: { contains: search, mode: 'insensitive' } } },
      ];
    }
    
    // Add filters for profile fields
    const profileFilter: any = {};
    
    if (skills) {
      profileFilter.skills = {
        contains: skills,
        mode: 'insensitive',
      };
    }
    
    if (availability) {
      profileFilter.availability = {
        contains: availability,
        mode: 'insensitive',
      };
    }
    
    // Only add profile to whereClause if we have profile filters
    if (Object.keys(profileFilter).length > 0) {
      whereClause.profile = profileFilter;
    }

    const mentors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullname: true,
        username: true,
        email: true,
        role: true,
        isApproved: true,
        image: true,
        profile: {
          select: {
            bio: true,
            location: true,
            skills: true,
            education: true,
            availability: true,
            linkedin: true,
            twitter: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { fullname: 'asc' }, // Changed from createdAt to fullname since createdAt isn't in schema
    });

    const totalCount = await prisma.user.count({
      where: whereClause,
    });

    return NextResponse.json({
      mentors,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        page: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit)
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