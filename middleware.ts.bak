import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/app/lib/session';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Define protected routes
    const isProtectedPath = path.startsWith('/admin') ||
        path.startsWith('/api/admin') ||
        path.startsWith('/dashboard') ||
        path.startsWith('/upload');

    // Define auth routes (redirect if already logged in)
    const isAuthPath = path === '/login' || path === '/register';

    const cookie = req.cookies.get('session')?.value;
    const session = cookie ? await verifySession(cookie) : null;

    // 1. Redirect unauthenticated users trying to access protected routes
    if (isProtectedPath && !session) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 2. Redirect students trying to access admin routes
    if ((path.startsWith('/admin') || path.startsWith('/api/admin')) && session?.role === 'student') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    // 3. Redirect authenticated users away from auth pages
    if (isAuthPath && session) {
        if (session.role === 'admin' || session.role === 'owner') {
            return NextResponse.redirect(new URL('/admin', req.nextUrl));
        }
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    // Only run on specific paths to avoid overhead on static assets
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
