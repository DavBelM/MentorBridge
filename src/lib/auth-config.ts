import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { User } from "@prisma/client"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined")
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        }) as (User & { password: string }) | null

        if (!user) {
          return null
        }

        const passwordMatch = await compare(credentials.password, user.password)
        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || "", // Use name instead of fullname
          role: user.role,
          isApproved: user.isApproved
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When signing in, add user data to token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name || ''
        token.role = user.role
        token.isApproved = user.isApproved
      }
      console.log("JWT callback generating token:", token)
      return token
    },
    async session({ session, token }) {
      // Add token data to session for client
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isApproved = token.isApproved
        session.user.name = token.name || ''
        // Add fullname alias to maintain compatibility with your components
        session.user.fullname = token.name || ''
      }
      console.log("Session callback generating session:", session)
      return session
    },
    async redirect({ url, baseUrl }) {
      // For RSC navigation, always allow the original URL
      if (url.includes('_rsc')) {
        return url;
      }
      
      // Fix for absolute URLs (important for complex redirects)
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      
      // Allow external redirects only to trusted domains
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      return baseUrl;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("Sign in event:", { user, account, profile, isNewUser })
    },
    async signOut({ session, token }) {
      console.log("Sign out event:", { session, token })
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  }
}