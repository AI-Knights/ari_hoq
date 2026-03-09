import { jwtDecode, JwtPayload } from 'jwt-decode';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware — runs on every request BEFORE it hits a page/route.
 *
 * Security responsibilities:
 * 1. Auto-refresh: if access_token is missing but refresh_token exists → rewrite
 *    to the token-refresh route so a new access cookie is set transparently.
 * 2. Route protection: redirect unauthenticated users to /auth for private routes.
 * 3. Role protection: redirect non-admin users away from /admin routes.
 * 4. Auth page guard: redirect already-authenticated users away from /auth.
 */

const PROTECTED_ROUTES = [
    '/dashboard',
    '/chat',
    '/friends',
    '/profile',
    '/hifz-journey',
    '/find-partner',
];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/auth'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // --- 1. Auto-refresh -------------------------------------------------
    // If no access token but there IS a refresh token, silently refresh before
    // serving the page. The token-refresh route will set a new access cookie.
    if (!accessToken && refreshToken) {
        const refreshUrl = new URL('/api/auth/token-refresh', request.url);
        // After refresh, redirect back to the originally requested page
        refreshUrl.searchParams.set('next', pathname);
        return NextResponse.rewrite(new URL('/api/auth/token-refresh', request.url));
    }

    // --- 2. Decode role from token (no DB needed) -------------------------
    let userRole: string | undefined;
    if (accessToken) {
        try {
            const decoded = jwtDecode<JwtPayload & { role?: string }>(accessToken);
            userRole = decoded.role;
        } catch {
            // Malformed token — treat as logged out
        }
    }

    const isAuthed = !!accessToken && !!userRole;

    // --- 3. Protect private routes ----------------------------------------
    const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
    if (isProtected && !isAuthed) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // --- 4. Admin route — must be authenticated + admin role --------------
    const isAdmin = ADMIN_ROUTES.some(r => pathname.startsWith(r));
    if (isAdmin) {
        if (!isAuthed) return NextResponse.redirect(new URL('/auth', request.url));
        if (userRole !== 'admin' && userRole !== 'moderator') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    // --- 5. Auth pages — redirect already-logged-in users -----------------
    const isAuthPage = AUTH_ROUTES.some(r => pathname.startsWith(r));
    if (isAuthPage && isAuthed) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Run on all routes except Next.js internals and static assets
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};
