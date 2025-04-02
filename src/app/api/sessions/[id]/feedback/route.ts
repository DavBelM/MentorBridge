import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-config";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = params.id;
    
    const { feedback } = await req.json();

    // Verify the user is authorized to update this session
    const mentorSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true },
    });

    if (!mentorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Ensure the user is the mentor of this session - compare strings
    if (mentorSession.mentorId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to update this session" }, { status: 403 });
    }

    // Update the session feedback
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { feedback },
    });

    // Create notification for the mentee
    await prisma.notification.create({
      data: {
        userId: mentorSession.menteeId,
        title: "New Session Feedback",
        message: "Your mentor has provided feedback for your session.",
        type: "SESSION_FEEDBACK",
        entityId: sessionId,
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session feedback:", error);
    return NextResponse.json(
      { error: "Failed to update session feedback" },
      { status: 500 }
    );
  }
}