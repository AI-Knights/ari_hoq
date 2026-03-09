import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtDecode, JwtPayload } from 'jwt-decode';

/**
 * GET /api/auth/session
 *
 * Server-side only. Reads the access_token httpOnly cookie, decodes the JWT
 * claims (no DB call needed — user data is embedded in the token), and returns
 * the user object to the client.
 */
export async function GET() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
        const decoded = jwtDecode<JwtPayload & {
            user_id: string;
            email: string;
            role: string;
            full_name: string;
        }>(accessToken);

        return NextResponse.json({
            user: {
                id: decoded.user_id,
                email: decoded.email,
                role: decoded.role,
                name: decoded.full_name,
            },
            accessToken,
        });
    } catch {
        // Token malformed — treat as unauthenticated
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
