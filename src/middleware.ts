import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect from login page if already authenticated
    if (path === "/login" && token) {
      // Redirect based on role
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url))
      } else if (token.role === "MENTOR") {
        return NextResponse.redirect(new URL("/dashboard/mentor", req.url))
      } else if (token.role === "MENTEE") {
        return NextResponse.redirect(new URL("/dashboard/mentee", req.url))
      }
    }

    // Handle role-based access
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (path.startsWith("/dashboard/mentor") && token?.role !== "MENTOR") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    if (path.startsWith("/dashboard/mentee") && token?.role !== "MENTEE") {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Handle mentor approval status
    if (token?.role === "MENTOR" && !token.isApproved && path !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

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