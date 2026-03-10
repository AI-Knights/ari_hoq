import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode, JwtPayload } from 'jwt-decode';

const DJANGO_API = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '')}/api` : 'http://127.0.0.1:8000/api';

const ACCESS_MAX_AGE = 60 * 60;           // 1 hour
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * POST /api/auth/token-refresh
 *
 * Edge-compatible token refresh. Reads the refresh_token httpOnly cookie,
 * calls Django's /api/auth/token/refresh/, and sets a fresh access_token cookie.
 * Called automatically by middleware.ts when access_token is missing.
 */
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
        return NextResponse.json({ error: 'No refresh token.' }, { status: 401 });
    }

    const isProd = process.env.NODE_ENV === 'production';
    const cookieBase = {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax' as const,
        path: '/',
    };

    try {
        // Send refresh_token cookie to Django
        const djangoRes = await fetch(`${DJANGO_API}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `refresh_token=${refreshToken}`,
            },
        });

        if (!djangoRes.ok) {
            const res = NextResponse.json({ error: 'Refresh failed.' }, { status: 401 });
            res.cookies.set('access_token', '', { ...cookieBase, maxAge: 0 });
            res.cookies.set('refresh_token', '', { ...cookieBase, maxAge: 0 });
            return res;
        }

        const res = NextResponse.json({ message: 'Refreshed.' });

        // Forward the new cookies Django set (access + rotated refresh)
        djangoRes.headers.getSetCookie().forEach((cookie) => {
            res.headers.append('Set-Cookie', cookie);
        });

        return res;
    } catch {
        const res = NextResponse.json({ error: 'Refresh failed.' }, { status: 401 });
        res.cookies.set('access_token', '', { ...cookieBase, maxAge: 0 });
        res.cookies.set('refresh_token', '', { ...cookieBase, maxAge: 0 });
        return res;
    }
}
