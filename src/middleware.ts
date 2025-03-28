import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If user is authenticated and trying to access login page, redirect to appropriate dashboard
    if (path === "/login" && token) {
      return NextResponse.redirect(new URL(getRedirectPath(token.role as string), req.url))
    }

    // Handle role-based access
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/dashboard/mentor") && token?.role !== "MENTOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path.startsWith("/dashboard/mentee") && token?.role !== "MENTEE") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Handle mentor approval status
    if (token?.role === "MENTOR" && !token.isApproved && path !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Allow access to login page without authentication
        if (path === "/login") {
          return true
        }

        // Require authentication for all other protected routes
        return !!token
      },
    },
  }
)

function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin"
    case "MENTOR":
      return "/dashboard/mentor"
    case "MENTEE":
      return "/dashboard/mentee"
    default:
      return "/dashboard"
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/pending-approval",
    "/api/mentor/:path*",
    "/api/admin/:path*",
    "/api/mentee/:path*",
  ],
} 