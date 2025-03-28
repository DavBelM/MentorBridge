import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please enter your email and password")
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            throw new Error("No user found with this email")
          }

          const passwordMatch = await bcrypt.compare(credentials.password, user.password)

          if (!passwordMatch) {
            throw new Error("Invalid password")
          }

          return {
            id: user.id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            isApproved: user.isApproved
          }
        } catch (error) {
          console.error("Auth error:", error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isApproved = user.isApproved
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.isApproved = token.isApproved as boolean
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // If the url is relative, prefix it with the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // If the url is already absolute, return it
      return url
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
    signOut: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("Sign in event:", { user, account, profile, isNewUser })
    },
    async signOut({ session, token }) {
      console.log("Sign out event:", { session, token })
    }
  }
} 