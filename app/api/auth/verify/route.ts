import { NextRequest, NextResponse } from 'next/server';

const DJANGO_API = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '') + '/api'
    : 'http://127.0.0.1:8000/api';

export async function POST(request: NextRequest) {
    const body = await request.json();

    const djangoRes = await fetch(`${DJANGO_API}/auth/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
    });

    const data = await djangoRes.json();

    if (!djangoRes.ok) {
        return NextResponse.json(data, { status: djangoRes.status });
    }

    const res = NextResponse.json(data, { status: djangoRes.status });
    djangoRes.headers.getSetCookie().forEach((cookie) => {
        res.headers.append('Set-Cookie', cookie);
    });
    return res;
}
