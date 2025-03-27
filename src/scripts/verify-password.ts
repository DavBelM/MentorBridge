import { hash, compare } from "bcryptjs"

async function main() {
  const password = "Admin@123"
  const hashedPassword = await hash(password, 12)
  console.log("Email: belamitali@gmail.com")
  console.log("Password: Admin@123")
  console.log("Hashed password:", hashedPassword)
  
  const isValid = await compare(password, hashedPassword)
  console.log("Password verification:", isValid)
}

main().catch(console.error) 