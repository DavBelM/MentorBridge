import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";
import { writeFile } from "fs/promises";
import { join } from "path";

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
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Parse the form data
    const { fields, files } = await parseFormData(request);
    
    // Check if the user already has a profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });
    
    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Handle profile picture upload
    let profileImageUrl = existingProfile.profilePicture;
    
    if (files.profilePicture) {
      const file = files.profilePicture;
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate a unique filename
      const fileExt = path.extname(file.name || '.jpg');
      const newFilename = `${userId}-${Date.now()}${fileExt}`;
      const newPath = path.join(uploadsDir, newFilename);
      
      // Write the file to the uploads directory
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(newPath, buffer);
      
      // Store the relative path in the database
      profileImageUrl = `/uploads/${newFilename}`;
      
      // Also update user.image for consistency
      await prisma.user.update({
        where: { id: userId },
        data: { image: profileImageUrl }
      });
    }
    
    // Extract form values safely, converting arrays as needed
    const formData: Record<string, any> = {};
    Object.keys(fields).forEach(key => {
      formData[key] = fields[key];
    });
    
    // Update the profile
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        bio: formData.bio || existingProfile.bio,
        location: formData.location || existingProfile.location,
        linkedin: formData.linkedin || existingProfile.linkedin,
        twitter: formData.twitter || existingProfile.twitter,
        skills: formData.skills || existingProfile.skills,
        education: formData.education || existingProfile.education,
        availability: formData.availability || existingProfile.availability,
        profilePicture: profileImageUrl
      }
    });
    
    // Also update any user fields that were provided
    if (formData.fullname || formData.username) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          fullname: formData.fullname,
          username: formData.username
        }
      });
    }
    
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}