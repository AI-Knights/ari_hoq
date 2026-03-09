import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '') + '/api'
    : 'http://127.0.0.1:8000/api';

/**
 * POST /api/auth/logout
 *
 * Forwards the logout to Django (which blacklists the refresh_token cookie).
 * Then clears both auth cookies server-side from the Next.js layer too.
 */
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const accessToken = cookieStore.get('access_token')?.value;

    // Fire-and-forget to Django (blacklists the refresh token server-side)
    if (refreshToken) {
        await fetch(`${DJANGO_API}/auth/logout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            },
            credentials: 'include',
        }).catch(() => { /* ignore */ });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: 0,
    };

    const res = NextResponse.json({ message: 'Logged out.' });
    res.cookies.set('access_token', '', cookieOpts);
    res.cookies.set('refresh_token', '', cookieOpts);
    return res;
}
