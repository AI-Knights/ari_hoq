import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Thin auth-injecting proxy.
 *
 * All client-side API calls route through here:
 *   /api/v/messages/threads/ → http://127.0.0.1:8000/api/messages/threads/
 *
 * This route:
 *   1. Reads the httpOnly access_token cookie (invisible to client JS)
 *   2. Injects it as Authorization: Bearer <token>
 *   3. Pipes the raw request body as a ReadableStream → FormData is never corrupted
 *   4. Forwards Django's response (including Set-Cookie headers) back to the browser
 */

const DJANGO = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

async function handler(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const djangoUrl = `${DJANGO}/api/${path.join('/')}/${request.nextUrl.search}`;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // Build forwarded headers — ONLY forward Authorization and Content-Type
    // Avoid forwarding all browser headers (like Origin/Host) which cause Django to reject the proxy request
    const forwardHeaders = new Headers();
    if (accessToken) {
        forwardHeaders.set('Authorization', `Bearer ${accessToken}`);
    }
    
    // Explicitly pass content-type if the client sent it
    const contentType = request.headers.get('content-type');
    if (contentType) {
        forwardHeaders.set('Content-Type', contentType);
    }
    
    // Explicitly pass Accept header if client sent it
    const accept = request.headers.get('accept');
    if (accept) {
        forwardHeaders.set('Accept', accept);
    }

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

    try {
        const djangoRes = await fetch(djangoUrl, {
            method: request.method,
            headers: forwardHeaders,
            // Pipe body as a raw ReadableStream — never touches FormData/JSON, no corruption
            body: hasBody ? request.body : undefined,
            // Required by Node.js fetch for streaming bodies
            // @ts-ignore — duplex not in TS types but required at runtime
            duplex: 'half',
        });

    // Return Django's response as-is (preserves Set-Cookie, Content-Type, etc.)
    return new NextResponse(djangoRes.body, {
        status: djangoRes.status,
        headers: djangoRes.headers,
    });
    } catch (error: any) {
        console.error('[NEXTJS PROXY] Error reaching Django Backend:', error);
        return NextResponse.json(
            { detail: 'Backend server is currently unreachable. Please try again later.' },
            { status: 502 }
        );
    }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
