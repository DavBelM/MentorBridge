import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

// Implement route protection with NextAuth middleware
export default withAuth(
  // `withAuth` augments your Request with the user's token
  function middleware(req) {
    const { pathname } = req.nextUrl
    const { token } = req.nextauth
    
    // Allow access to authentication routes
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next()
    }
    
    // If user is authenticated but accessing login page, redirect to dashboard
    if (pathname === '/login' && token) {
      const url = new URL(`/dashboard/${(token.role as string).toLowerCase()}`, req.url)
      return NextResponse.redirect(url)
    }
    
    // Role-based access for dashboard routes
    if (pathname.startsWith('/dashboard/mentor') && token?.role !== 'MENTOR') {
      const url = new URL('/dashboard/mentee', req.url)
      return NextResponse.redirect(url)
    }
    
    if (pathname.startsWith('/dashboard/mentee') && token?.role !== 'MENTEE') {
      const url = new URL('/dashboard/mentor', req.url)
      return NextResponse.redirect(url)
    }
    
    if (pathname.startsWith('/dashboard/admin') && token?.role !== 'ADMIN') {
      const url = new URL('/login', req.url)
      return NextResponse.redirect(url)
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      // Only run middleware on matching routes
      authorized: ({ token }) => !!token
    }
  }
)

// Update matcher to include all routes you want to protect
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