import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/token
 * 
 * Returns the access_token string to the client-side JS.
 * REQUIRED for WebSockets because httpOnly cookies cannot be read by JS,
 * and standard WebSocket handshakes often require the token in the query string.
 */
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ token: null }, { status: 401 });
    }

    return NextResponse.json({ token });
}
