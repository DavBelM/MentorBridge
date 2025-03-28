import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const mentorId = params.id;
    
    if (!mentorId) {
      return NextResponse.json({ error: 'Invalid mentor ID' }, { status: 400 });
    }
    
    // Fetch the mentor by ID
    const mentor = await prisma.user.findUnique({
      where: {
        id: mentorId,
        role: 'MENTOR'
      },
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
            linkedin: true,
            twitter: true,
            skills: true,
            education: true,
            availability: true
          }
        }
      }
    });

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error('Error fetching mentor profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor profile' }, 
      { status: 500 }
    );
  }
}