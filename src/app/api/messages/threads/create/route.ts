import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { menteeId } = await request.json();
    
    if (!menteeId) {
      return NextResponse.json(
        { error: 'Missing required menteeId parameter' },
        { status: 400 }
      );
    }

    // Check if mentor has an existing connection with this mentee
    const connection = await prisma.connection.findFirst({
      where: {
        mentorId: session.user.id,
        menteeId: menteeId.toString(),
        status: 'ACCEPTED',
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'No accepted connection found with this mentee' },
        { status: 404 }
      );
    }

    // Return the connection ID to use as the thread ID
    return NextResponse.json({ 
      threadId: connection.id,
      success: true
    });
  } catch (error) {
    console.error('Error creating or finding message thread:', error);
    return NextResponse.json(
      { error: 'Failed to create or find message thread' },
      { status: 500 }
    );
  }
}