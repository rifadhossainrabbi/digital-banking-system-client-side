import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge-Compatible Route Protection Middleware
 * Protects all /dashboard/* routes without pulling Node.js dependencies (crypto, mongodb, bcrypt) into Edge Runtime.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for NextAuth v5 / Auth.js session cookies (both standard and HTTPS __Secure- prefixes)
  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value ||
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value;

  const isLoggedIn = !!sessionToken;

  // If attempting to access any dashboard route without an active session -> redirect to /login
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
