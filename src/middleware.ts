import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define public paths that don't require authentication
const publicPaths = ['/login', '/register', '/api/auth', '/pending-approval', '/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if path is public
  if (publicPaths.some(p => path === p || path.startsWith(p))) {
    return NextResponse.next()
  }

  // Get token with all required options
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production',
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
  })
  
  console.log('Middleware for path:', path)
  console.log('Token data:', token)
  
  // No token means redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Critical fix: Handle /dashboard root path properly
  if (path === '/dashboard') {
    console.log('Redirecting to role dashboard:', token.role)
    return NextResponse.redirect(
      new URL(`/dashboard/${token.role.toLowerCase()}`, request.url)
    )
  }
  
  // Inside your middleware function, add this check
  if (path.startsWith('/dashboard') && token?.role === 'ADMIN' && path !== '/dashboard/admin') {
    console.log('Admin detected, redirecting to admin dashboard')
    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
  }
  
  // Ensure role-based access control
  if (path.startsWith('/dashboard/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (path.startsWith('/dashboard/mentor') && token.role !== 'MENTOR') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  if (path.startsWith('/dashboard/mentee') && token.role !== 'MENTEE') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Ensure all paths are covered
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}