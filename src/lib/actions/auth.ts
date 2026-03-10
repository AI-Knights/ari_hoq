"use server";

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const DJANGO_API = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

/** Parse a Set-Cookie string into name, value, and attributes */
function parseSetCookie(setCookieHeader: string) {
    const parts = setCookieHeader.split(';').map(s => s.trim());
    const [nameValue, ...attrs] = parts;
    const eqIdx = nameValue.indexOf('=');
    const name = nameValue.slice(0, eqIdx).trim();
    const value = nameValue.slice(eqIdx + 1).trim();
    
    const options: Record<string, any> = { path: '/' };
    for (const attr of attrs) {
        const lower = attr.toLowerCase();
        if (lower === 'httponly') options.httpOnly = true;
        else if (lower === 'secure') options.secure = true;
        else if (lower.startsWith('max-age=')) options.maxAge = parseInt(attr.split('=')[1]);
        else if (lower.startsWith('samesite=')) options.sameSite = attr.split('=')[1].toLowerCase();
        else if (lower.startsWith('path=')) options.path = attr.split('=')[1];
    }
    return { name, value, options };
}

export async function loginAction(formData: FormData) {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
    }

    try {
        // Use raw fetch so we can access Set-Cookie headers from Django
        const djangoRes = await fetch(`${DJANGO_API}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await djangoRes.json();

        if (!djangoRes.ok) {
            const msg = data?.detail || data?.error || data?.non_field_errors?.[0] || 'Login failed';
            return { success: false, error: msg };
        }

        // Forward the httpOnly cookies that Django set via Set-Cookie headers
        const cookieStore = await cookies();
        const setCookieHeaders = djangoRes.headers.getSetCookie?.() ?? [];
        
        for (const setCookieStr of setCookieHeaders) {
            const { name, value, options } = parseSetCookie(setCookieStr);
            if (name && value) {
                cookieStore.set(name, value, options);
            }
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred' };
    }
}

export async function registerAction(data: any) {
    try {
        const res = await fetch(`${DJANGO_API}/api/auth/register/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
            const msg = json?.detail || json?.error || json?.non_field_errors?.[0] || 'Registration failed';
            return { success: false, error: msg };
        }
        return { success: true, data: json };
    } catch (err: any) {
        return { success: false, error: err.message || 'An unexpected error occurred' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    try {
        await fetch(`${DJANGO_API}/api/auth/logout/`, {
            method: 'POST',
            headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        });
    } catch (error) {
        console.error("Logout API error:", error);
    }
    
    // Always clear cookies regardless of API success
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');
    
    redirect('/auth');
}
