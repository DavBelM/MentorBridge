import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Extract data from formData
    const userId = Number(formData.get('userId'))
    const bio = formData.get('bio') as string
    const location = formData.get('location') as string
    const linkedin = formData.get('linkedin') as string || null
    const twitter = formData.get('twitter') as string || null
    
    // Handle profile picture upload - you'll need to implement file storage
    // For now, we'll just store the filename or URL
    const profilePicture = formData.get('profilePicture') as File
    let profilePictureUrl = null
    if (profilePicture) {
      // TODO: Implement file upload to your storage service
      // For now, we'll just store the filename
      profilePictureUrl = profilePicture.name
    }

    // Create or update profile based on role
    const profile = await prisma.profile.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId,
        bio,
        location,
        linkedin,
        twitter,
        profilePicture: profilePictureUrl,
        // Role-specific fields
        experience: formData.get('experience') as string || null,
        skills: formData.get('skills') as string || null,
        availability: formData.get('availability') as string || null,
        interests: formData.get('interests') as string || null,
        learningGoals: formData.get('learningGoals') as string || null,
      },
      update: {
        bio,
        location,
        linkedin,
        twitter,
        profilePicture: profilePictureUrl,
        // Role-specific fields
        experience: formData.get('experience') as string || null,
        skills: formData.get('skills') as string || null,
        availability: formData.get('availability') as string || null,
        interests: formData.get('interests') as string || null,
        learningGoals: formData.get('learningGoals') as string || null,
      },
    })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
