import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '') + '/api'
    : 'http://127.0.0.1:8000/api';

/**
 * Generic Django proxy routes under /api/proxy/[...path]
 * Forwards ALL HTTP methods to Django with the access_token cookie as a Bearer header.
 * This keeps the Django API base URL server-side only and avoids CORS issues.
 */

async function proxyRequest(request: NextRequest, djangoPath: string) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    const headers: Record<string, string> = {};
    
    // Forward content-type if present, otherwise default to JSON
    const contentType = request.headers.get('content-type');
    if (contentType) {
        headers['Content-Type'] = contentType;
    } else if (request.method !== 'GET' && request.method !== 'HEAD') {
        headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
        try { body = await request.text(); } catch { /* no body */ }
    }

    // Ensure trailing slash for Django URL routing
    const fullPath = `${DJANGO_API}/${djangoPath}${djangoPath.endsWith('/') ? '' : '/'}`;
    
    try {
        const djangoRes = await fetch(fullPath, {
            method: request.method,
            headers,
            ...(body ? { body } : {}),
        });

        const isJson = djangoRes.headers.get('content-type')?.includes('application/json');
        
        if (!djangoRes.ok) {
            // Log error details for debugging
            console.error(`[Proxy Error] ${request.method} ${fullPath} -> ${djangoRes.status}`);
            const errorData = isJson ? await djangoRes.json() : { error: await djangoRes.text() };
            console.error('[Proxy Error Response]', errorData);
            return NextResponse.json(errorData, { status: djangoRes.status });
        }

        const data = isJson ? await djangoRes.json() : {};
        return NextResponse.json(data, { status: djangoRes.status });
    } catch (error) {
        console.error(`[Proxy Exception] ${request.method} ${fullPath}:`, error);
        return NextResponse.json(
            { error: 'Proxy request failed', detail: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

// Handle all HTTP methods
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path.join('/'));
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path.join('/'));
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path.join('/'));
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path.join('/'));
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    const { path } = await context.params;
    return proxyRequest(request, path.join('/'));
}
