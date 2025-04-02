import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Interface for profile data response
interface ProfileResponse {
  message: string;
  profile?: any; // You might want to define a more specific type
}

// Interface for error response
interface ErrorResponse {
  error: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<ProfileResponse | ErrorResponse>> {
  try {
    // Get the user ID from the session
    const authHeader = request.headers.get('authorization');
    let userId;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Decode token to get userId
      // userId = decoded.id;
    } else {
      // For testing, you can hardcode a user ID
      userId = "2"; // Replace with an actual user ID from your database
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the profile data from your database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Return the actual profile data
    return NextResponse.json({ message: "Profile fetched successfully", profile: user.profile });
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ProfileResponse | ErrorResponse>> {
  try {
    const data = await request.json();
    // Handle profile creation/update
    return NextResponse.json({ message: "Profile updated" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<ProfileResponse | ErrorResponse>> {
  try {
    const data = await request.json();
    // Handle profile update
    return NextResponse.json({ message: "Profile updated" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}