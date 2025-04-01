import { prisma } from "@/lib/prisma"

export async function createNotification({
  userId,
  title,
  message,
  type,
  entityId
}: {
  userId: string
  title: string
  message: string
  type: string
  entityId?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        entityId,
        read: false
      }
    })
    
    return notification
  } catch (error) {
    console.error("Failed to create notification:", error)
    throw error
  }
}