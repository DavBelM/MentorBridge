import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { register } from 'module'

const prisma = new PrismaClient().$extends(withAccelerate())

export async function registerUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullname: 'Default Fullname',
      username: 'defaultusername',
      role: 'user',
    },
  })
  return user
}

export async function loginUser(email: string, password: string) {

    const user = await prisma.user.findUnique({
        where: {
        email,
        },
    })
    if (!user) {
        throw new Error('No user found')
    }
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
        throw new Error('Invalid password')
    }
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return {token, user};
    }      

