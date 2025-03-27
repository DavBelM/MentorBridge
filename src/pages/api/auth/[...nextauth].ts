import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log("Login attempt for email:", credentials?.email);

          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            throw new Error("Please enter your email and password");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          console.log("User found:", user ? "Yes" : "No");
          if (user) {
            console.log("User role:", user.role);
            console.log("User isApproved:", user.isApproved);
          }

          if (!user) {
            console.log("No user found with email:", credentials.email);
            throw new Error("No user found with this email");
          }

          console.log("Attempting password comparison");
          const isPasswordValid = await compare(credentials.password, user.password);
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            throw new Error("Invalid password");
          }

          console.log("Authentication successful for user:", credentials.email);
          return {
            id: user.id.toString(),
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            isApproved: user.isApproved
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isApproved = user.isApproved;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.isApproved = token.isApproved as boolean;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);