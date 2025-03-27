import { prisma } from "@/lib/prisma"
import { compare } from "bcryptjs"

async function main() {
  const email = "belamitali@gmail.com"
  const password = "Admin@123"

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log("User not found in database")
      return
    }

    console.log("User found in database:")
    console.log("Email:", user.email)
    console.log("Role:", user.role)
    console.log("IsApproved:", user.isApproved)
    console.log("Current password hash:", user.password)

    // Generate a new hash for comparison
    const newHash = await hash(password, 12)
    console.log("New password hash:", newHash)

    // Try to compare the passwords
    const isValid = await compare(password, user.password)
    console.log("Password comparison result:", isValid)

  } catch (error) {
    console.error("Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 