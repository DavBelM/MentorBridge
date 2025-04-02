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

    const sessionId = parseInt(params.id);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const { status } = await req.json();

    // Validate status
    if (!["SCHEDULED", "COMPLETED", "CANCELLED", "DECLINED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be SCHEDULED, COMPLETED, CANCELLED, or DECLINED" },
        { status: 400 }
      );
    }

    // Verify the user is authorized to update this session
    const mentorSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { mentorId: true, menteeId: true, status: true },
    });

    if (!mentorSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Ensure the user is the mentor of this session
    if (mentorSession.mentorId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Not authorized to update this session" }, { status: 403 });
    }

    // Update the session status
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { status },
    });

    // Create notification for the mentee
    let notificationTitle, notificationMessage;
    
    if (status === "SCHEDULED") {
      notificationTitle = "Session Approved";
      notificationMessage = "Your session request has been approved by your mentor.";
    } else if (status === "COMPLETED") {
      notificationTitle = "Session Completed";
      notificationMessage = "Your mentor has marked your session as complete.";
    } else if (status === "DECLINED") {
      notificationTitle = "Session Declined";
      notificationMessage = "Unfortunately, your mentor has declined your session request.";
    } else if (status === "CANCELLED") {
      notificationTitle = "Session Cancelled";
      notificationMessage = "Your session has been cancelled by your mentor.";
    }

    await prisma.notification.create({
      data: {
        userId: mentorSession.menteeId,
        title: notificationTitle || "Session Update",
        message: notificationMessage || `Your session status has been updated to ${status}.`,
        type: "SESSION_UPDATE",
        entityId: sessionId.toString(),
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session status:", error);
    return NextResponse.json(
      { error: "Failed to update session status" },
      { status: 500 }
    );
  }
}