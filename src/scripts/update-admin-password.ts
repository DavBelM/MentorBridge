const { PrismaClient } = require("@prisma/client")
const { hash } = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const email = "belamitali@gmail.com"
  const password = "Admin@123"

  try {
    // Generate new password hash
    const hashedPassword = await hash(password, 12)
    console.log("New password hash:", hashedPassword)

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: "ADMIN",
        isApproved: true,
        submittedForApproval: false
      }
    })

    console.log("User updated successfully:")
    console.log("Email:", updatedUser.email)
    console.log("Role:", updatedUser.role)
    console.log("IsApproved:", updatedUser.isApproved)

  } catch (error) {
    console.error("Error updating user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 