import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;

  // Create response with security headers
  const response = NextResponse.next();

  // Security Headers - Banking Grade
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=self, payment=self');

  // HSTS (HTTPS Strict Transport Security) - 2 years
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  // Content Security Policy (CSP) - Enhanced for HR app
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://js.vercel-insights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' blob: data: https:",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com wss:",
    "worker-src 'self' blob:",
    "child-src 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/marketing', '/pricing', '/features', '/contact', '/checkout'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isApiRoute = pathname.startsWith('/api');
  const isNextRoute = pathname.startsWith('/_next');

  // Locale routes for SEO pages (nl, en, de, pl, fr)
  const localeRoutes = ['/nl', '/en', '/de', '/pl', '/fr'];
  const isLocaleRoute = localeRoutes.some(route => pathname.startsWith(route));

  // Allow public routes, API routes, Next.js internal routes, and locale routes
  if (isPublicRoute || isApiRoute || isNextRoute || isLocaleRoute) {
    return response;
  }

  // For now, allow dashboard and admin routes - auth will be checked in individual pages
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};