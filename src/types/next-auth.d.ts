import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    fullname: string
    role: string
    isApproved: boolean
  }

  interface Session {
    user: User & {
      role: string
      isApproved: boolean
    }
  }
} 