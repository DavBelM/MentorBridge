import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
const { writeFile } = fsPromises;

// Helper function to parse form data with files
async function parseFormData(request: Request) {
  const formData = await request.formData();
  const files: Record<string, any> = {};
  const fields: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files[key] = value;
    } else {
      // Handle array fields (like skills)
      if (key.endsWith('[]')) {
        const baseKey = key.replace('[]', '');
        if (!fields[baseKey]) fields[baseKey] = [];
        fields[baseKey].push(value);
      } else {
        fields[key] = value;
      }
    }
  }

  return { files, fields };
}

// GET - Check profile existence/completion
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    // Get user details to check completion status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        fullname: true,
        username: true,
        role: true,
        isApproved: true,
        image: true
      }
    });
    
    // Calculate completion percentage
    let completionPercentage = 0;
    let requiredFields = ['fullname', 'username'];
    
    if (profile) {
      // Add profile-specific required fields
      if (user?.role === 'MENTOR') {
        requiredFields = [...requiredFields, 'bio', 'location', 'skills', 'education', 'availability'];
      } else {
        requiredFields = [...requiredFields, 'bio', 'interests'];
      }
      
      const profileData = { ...user, ...profile } as Record<string, any>;
      const completedFields = requiredFields.filter(field => 
        profileData[field] && (
          typeof profileData[field] === 'string' ? 
          profileData[field].trim() !== '' : 
          true
        )
      );
      
      completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);
    }
    
    return NextResponse.json({
      exists: !!profile,
      profile,
      user,
      completionPercentage,
      isComplete: completionPercentage === 100
    });
  } catch (error) {
    console.error('Error checking profile:', error);
    return NextResponse.json(
      { error: 'Failed to check profile' },
      { status: 500 }
    );
  }
}

// PUT - Update profile
export async function PUT(request: Request) {
  console.log("PUT /api/profile - Request received");
  
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Available" : "Not available");
    
    if (!session?.user) {
      console.log("Unauthorized - No user in session");
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    console.log("User ID from session:", session.user.id);
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Parse the multipart form data including any files
    const { files, fields } = await parseFormData(request);
    console.log("Form fields received:", fields);
    console.log("Files received:", Object.keys(files));
    
    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    // Handle file upload if provided
    let profilePictureUrl = existingProfile?.profilePicture;
    if (files.profilePicture) {
      try {
        profilePictureUrl = await uploadFile(files.profilePicture);
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        return new NextResponse(
          JSON.stringify({ error: "Failed to upload profile picture" }), 
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Initialize data object with profile picture URL if available
    const data: Record<string, any> = {
      ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
    };
    
    // Add common fields for all roles
    if (fields.bio) data.bio = fields.bio;
    if (fields.location) data.location = fields.location;
    if (fields.linkedin) data.linkedin = fields.linkedin;
    if (fields.twitter) data.twitter = fields.twitter;
    
    // Add role-specific fields
    if (session.user.role === "MENTOR") {
      if (fields.skills) data.skills = fields.skills;
      if (fields.experience) data.experience = fields.experience;
      if (fields.availability) data.availability = fields.availability;
    } else if (session.user.role === "MENTEE") {
      if (fields.interests) data.interests = fields.interests;
      if (fields.learningGoals) data.learningGoals = fields.learningGoals;
    }
    
    // Update or create profile
    let profile;
    if (existingProfile) {
      profile = await prisma.profile.update({
        where: { userId },
        data,
      });
    } else {
      profile = await prisma.profile.create({
        data: {
          ...data,
          userId,
        },
      });
    }
    
    // Log profile data being saved
    console.log("Profile data to save:", data);
    
    // Return proper response
    console.log("Profile updated successfully");
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    // Return proper JSON error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error", details: errorMessage }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Helper function for file upload
async function uploadFile(file: File) {
  try {
    // For development, store in public directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Create unique filename
    const uniqueFilename = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    // Convert file to buffer and save
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
    
    // Return the URL that can be accessed publicly
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload profile picture");
  }
}