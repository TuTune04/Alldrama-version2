import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Định nghĩa các route cần bảo vệ (yêu cầu đăng nhập)
const PROTECTED_ROUTES = [
  '/favorites',
  '/profile',
  '/watch-history',
];

// Định nghĩa các route chỉ dành cho guest (không cho phép đã đăng nhập)
const GUEST_ROUTES = [
  '/login',
  '/register',
];

// Định nghĩa các route chỉ dành cho admin
const ADMIN_ROUTES = [
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy token từ cookies hoặc headers
  const token = request.cookies.get('token')?.value || 
               request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isAuthenticated = !!token;
  
  // Kiểm tra role (đơn giản, trong thực tế cần giải mã JWT)
  const isAdmin = false; // Mặc định không phải admin
  
  // Redirect guest khỏi protected routes
  if (!isAuthenticated && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect logged-in users khỏi guest routes
  if (isAuthenticated && GUEST_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Redirect non-admin khỏi admin routes
  if (!isAdmin && ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. Các static files (fonts, images, etc.)
     */
    '/((?!api|_next|_static|favicon.ico|.*\\.svg$|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
}; 