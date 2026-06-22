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

    // Construct the target URL safely
    const searchParams = request.nextUrl.search;
    const cleanPath = path.join('/');
    const djangoUrl = `${DJANGO}/api/${cleanPath}/${searchParams}`;
    // Remove any accidental double slashes (except after protocol)
    const finalUrl = djangoUrl.replace(/([^:])\/\//g, '$1/');

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

    // Pass the original client IP to prevent Django from rate-limiting the proxy server
    const clientIp = request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    if (clientIp) {
        forwardHeaders.set('X-Forwarded-For', clientIp);
    }

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

    // Read the body fully into memory before forwarding to prevent stream truncation errors
    let rawBody: ArrayBuffer | undefined = undefined;
    if (hasBody) {
        rawBody = await request.arrayBuffer();
        forwardHeaders.set('Content-Length', rawBody.byteLength.toString());
    }

    try {
        const isPublicStats = cleanPath === 'public-stats' || cleanPath === 'public-stats/';
        
        const fetchOptions: RequestInit = {
            method: request.method,
            headers: forwardHeaders,
            body: hasBody ? rawBody : undefined,
        };

        // Cache public stats aggressively on the Next.js server for 60 seconds
        if (isPublicStats && request.method === 'GET') {
            fetchOptions.next = { revalidate: 60 };
        } else {
            fetchOptions.cache = 'no-store';
        }

        const djangoRes = await fetch(finalUrl, fetchOptions);

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

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
