import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/register', '/api/auth']

// Export withAuth middleware with your custom function inside
export default withAuth(
  function middleware(request) {
    const path = request.nextUrl.pathname
    
    // If user is authenticated but accessing login page, redirect to dashboard
    if (path === '/login' && request.nextauth?.token) {
      const url = new URL(`/dashboard/${(request.nextauth.token.role as string).toLowerCase()}`, request.url)
      return NextResponse.redirect(url)
    }
    
    // Role-based access for dashboard routes
    if (path.startsWith('/dashboard/mentor') && request.nextauth?.token?.role !== 'MENTOR') {
      const url = new URL('/dashboard/mentee', request.url)
      return NextResponse.redirect(url)
    }
    
    if (path.startsWith('/dashboard/mentee') && request.nextauth?.token?.role !== 'MENTEE') {
      const url = new URL('/dashboard/mentor', request.url)
      return NextResponse.redirect(url)
    }
    
    if (path.startsWith('/dashboard/admin') && request.nextauth?.token?.role !== 'ADMIN') {
      const url = new URL('/login', request.url)
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        // Allow public paths even without token
        if (publicPaths.some(p => path.startsWith(p) || path === p)) {
          return true
        }
        // Otherwise require token
        return !!token
      }
    }
  }
)

// Update matcher config
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register'
  ],
}