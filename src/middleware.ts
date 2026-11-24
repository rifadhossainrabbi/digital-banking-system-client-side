import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = !!session?.user;

  // Protected route definitions
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const isStaffRoute = pathname.startsWith('/dashboard/staff');
  const isCustomerRoute = pathname.startsWith('/dashboard/customer');

  // 1. Unauthenticated users trying to access any dashboard route -> Redirect to /login
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based Route Protection
  if (isLoggedIn && session?.user) {
    const role = session.user.role;

    // Admin-only route guard
    if (isAdminRoute && role !== 'Admin') {
      const redirectUrl = new URL('/dashboard', req.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // Staff route guard (Staff and Admin permitted)
    if (isStaffRoute && role !== 'Bank Staff' && role !== 'Admin') {
      const redirectUrl = new URL('/dashboard', req.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // Customer route guard (Customer and Admin permitted)
    if (isCustomerRoute && role !== 'Customer' && role !== 'Admin') {
      const redirectUrl = new URL('/dashboard', req.nextUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
