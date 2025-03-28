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
    user: {
      id: string
      email: string
      fullname: string
      role: string
      isApproved: boolean
      profile?: {
        id: number
        bio?: string | null
        location?: string | null
        // other profile fields
      } | null
    }
  }
}