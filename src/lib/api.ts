/**
 * Central API utility — Production-grade, httpOnly cookie auth.
 *
 * Tokens are stored in httpOnly cookies managed by the server.
 * This client never reads or writes localStorage.
 * All requests use `credentials: 'include'` so the browser automatically
 * sends the access_token cookie on every request to the Django backend.
 *
 * Auto-refresh: On 401, the client calls our Next.js /api/auth/token-refresh
 * route (which reads the httpOnly refresh_token cookie server-side and sets
 * a new access_token cookie), then replays the original request.
 */

/**
 * Client-side API base.
 *
 * All browser-initiated requests go through /api/v/[...path] — a thin Next.js
 * proxy that reads the httpOnly access_token cookie server-side and injects it
 * as an Authorization: Bearer header before forwarding to Django.
 *
 * This avoids cross-origin cookie issues (browser can't send localhost:3000
 * cookies to 127.0.0.1:8000) and keeps the token out of client JS entirely.
 */
const API_BASE = '/api/v';

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
    isRetry?: boolean;
}

export async function apiFetch<T = any>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, isRetry = false, ...init } = options;

    const headers: Record<string, string> = {
        ...(init.headers as Record<string, string>),
    };

    if (init.body && !(init.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    // Always include credentials so httpOnly cookies are sent automatically
    const response = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers,
        credentials: 'include',
    });

    if (!response.ok) {
        // Automatic token refresh on 401
        if (response.status === 401 && !skipAuth && !isRetry) {
            try {
                const refreshRes = await fetch('/api/auth/token-refresh', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (refreshRes.ok) {
                    // Replay the original request — browser now has the new access cookie
                    return apiFetch<T>(path, { ...options, isRetry: true });
                }
            } catch (e) {
                console.error('Token refresh failed', e);
            }
            // Refresh also failed — redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/auth';
            }
        }

        let errorMessage = `API Error ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.non_field_errors) {
                errorMessage = Array.isArray(errorData.non_field_errors)
                    ? errorData.non_field_errors[0]
                    : errorData.non_field_errors;
            } else {
                const firstKey = Object.keys(errorData)[0];
                if (firstKey) {
                    const val = errorData[firstKey];
                    const msg = Array.isArray(val) ? val[0] : val;
                    errorMessage = typeof msg === 'string' ? msg : JSON.stringify(errorData);
                }
            }
        } catch { /* non-JSON body */ }
        
        console.error(`[apiFetch Failed] URL: ${API_BASE}${path} | Status: ${response.status} | Error: ${errorMessage}`);
        
        // Pass the errorData object so that callers can extract specific fields
        const err = new Error(errorMessage) as any;
        err.response = { status: response.status, data: { detail: errorMessage, error: errorMessage } };
        throw err;
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

// Alias kept for backwards compatibility — proxy handles FormData streaming correctly now
export const apiFetchDirect = apiFetch;

export const api = {
    auth: {
        register: (data: { username?: string; email: string; password: string }) =>
            apiFetch('/auth/register/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        verifyEmail: (data: { email: string; otp: string }) =>
            apiFetch('/auth/verify/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        resendCode: (data: { email: string }) =>
            apiFetch('/auth/resend-code/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        login: (data: { email: string; password: string }) =>
            apiFetch('/auth/login/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        logout: () => apiFetch('/auth/logout/', { method: 'POST' }),
        me: () => apiFetch('/auth/me/'),
        updateProfile: (data: FormData | Record<string, any>) =>
            apiFetch('/auth/profile/', { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
        changePassword: (data: { old_password: string; new_password: string }) =>
            apiFetch('/auth/change-password/', { method: 'POST', body: JSON.stringify(data) }),
        deleteAccount: (data: { password: string }) =>
            apiFetch('/auth/delete-account/', { method: 'POST', body: JSON.stringify(data) }),
        refreshToken: () =>
            apiFetch('/auth/token/refresh/', { method: 'POST', skipAuth: true }),
        passwordResetRequest: (data: { email: string }) =>
            apiFetch<{ reset_token: string }>('/auth/password-reset/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        passwordResetConfirm: (data: { reset_token: string; otp: string; new_password: string }) =>
            apiFetch('/auth/password-reset/confirm/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
        enable2FAInit: () =>
            apiFetch<{ qr_data: string, secret: string }>('/auth/2fa/enable/init/', { method: 'POST' }),
        setup2FA: (data: { secret: string, code: string }) =>
            apiFetch<{ detail: string, is_2fa_enabled: boolean }>('/auth/2fa/setup/', { method: 'POST', body: JSON.stringify(data) }),
        disable2FA: () =>
            apiFetch<{ detail: string, is_2fa_enabled: boolean }>('/auth/2fa/disable/', { method: 'POST' }),
        verify2FALogin: (data: { two_fa_token: string, code: string }) =>
            apiFetch('/auth/2fa/login/verify/', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
    },
    dashboard: { stats: () => apiFetch('/dashboard/stats/') },
    availability: {
        list: () => apiFetch('/availability/'),
        toggle: (day_of_week: string, time_slot: string) =>
            apiFetch('/availability/toggle/', { method: 'POST', body: JSON.stringify({ day_of_week, time_slot }) }),
    },
    match: {
        find: (data: { is_advanced: boolean; level?: string; language?: string; timezone?: string; goals?: string }) =>
            apiFetch('/match/', { method: 'POST', body: JSON.stringify(data) }),
        skip: (userId: string | number) =>
            apiFetch('/match/skip/', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
        clearDeclined: () => 
            apiFetch('/match/clear-declined/', { method: 'POST' }),
    },
    hifz: {
        list: () => apiFetch('/hifz/'),
        toggle: (surah_number: number) =>
            apiFetch('/hifz/toggle/', { method: 'POST', body: JSON.stringify({ surah_number }) }),
        stats: () => apiFetch('/hifz/stats/'),
    },
    friends: {
        list: () => apiFetch('/friends/'),
        sendRequest: (data: { username?: string; user_id?: string | number; message: string }) =>
            apiFetch('/friends/request/', { method: 'POST', body: JSON.stringify(data) }),
        accept: (id: number) => apiFetch(`/friends/${id}/accept/`, { method: 'POST' }),
        decline: (id: number) => apiFetch(`/friends/${id}/decline/`, { method: 'POST' }),
        cancel: (id: number) => apiFetch(`/friends/${id}/cancel/`, { method: 'POST' }),
        unfriend: (user_id: string | number) =>
            apiFetch('/friends/unfriend/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        block: (user_id: string | number) =>
            apiFetch('/friends/block/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        reportAndBlock: (data: {
            user_id: string | number;
            reason: string;
            report_type: string;
            severity: string;
            block_user: boolean
        }) =>
            apiFetch('/friends/report_and_block/', { method: 'POST', body: JSON.stringify(data) }),
        unblock: (user_id: string | number) =>
            apiFetch('/friends/unblock/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        listBlocked: () => apiFetch('/friends/blocked/'),
    },
    users: {
        search: (query: string) => apiFetch(`/users/?search=${encodeURIComponent(query)}`),
        get: (id: string | number) => apiFetch(`/users/${id}/`)
    },
    messages: {
        threads: () => apiFetch('/messages/threads/'),
        conversation: (userId: string | number, limit: number = 50, offset: number = 0) =>
            apiFetch(`/messages/conversation/?user_id=${userId}&limit=${limit}&offset=${offset}`),
        send: (data: { recipient_id: string | number; content: string }) =>
            apiFetch('/messages/', { method: 'POST', body: JSON.stringify(data) }),
        deleteChat: (user_id: string | number, for_both: boolean = false) =>
            apiFetch('/messages/delete_chat/', { method: 'POST', body: JSON.stringify({ user_id, for_both }) }),
    },
    partners: {
        list: () => apiFetch('/partners/'),
        create: (data: { recipient_id: number; message?: string }) =>
            apiFetch('/partners/', { method: 'POST', body: JSON.stringify(data) }),
        respond: (id: number, status: 'accepted' | 'declined') =>
            apiFetch(`/partners/${id}/respond/`, { method: 'POST', body: JSON.stringify({ status }) }),
    },
    reports: {
        list: () => apiFetch('/reports/'),
        pending: () => apiFetch('/reports/pending/'),
        create: (data: { reported_user_id: number; reason: string; report_type?: string; severity?: string }) =>
            apiFetch('/reports/', { method: 'POST', body: JSON.stringify(data) }),
        resolve: (id: number) => apiFetch(`/reports/${id}/resolve/`, { method: 'POST' }),
        dismiss: (id: number) => apiFetch(`/reports/${id}/dismiss/`, { method: 'POST' }),
        warn: (id: number) => apiFetch(`/reports/${id}/warn/`, { method: 'POST' }),
        delete: (id: number) => apiFetch(`/reports/${id}/`, { method: 'DELETE' }),
    },
    admin: {
        stats: () => apiFetch('/admin/stats/'),
        banUser: (userId: string) => apiFetch(`/admin/users/${userId}/ban/`, { method: 'POST' }),
        deleteUser: (userId: string) => apiFetch(`/admin/users/${userId}/delete/`, { method: 'DELETE' }),
        changeRole: (userId: string, role: string) =>
            apiFetch(`/admin/users/${userId}/role/`, { method: 'POST', body: JSON.stringify({ role }) }),
        allUsers: (search?: string) =>
            apiFetch(`/admin/users/${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    },
    agora: {
        getToken: (channelName: string) =>
            apiFetch<{ token: string, uid: number }>(`/video/token/`, { method: 'POST', body: JSON.stringify({ channel_name: channelName }) }),
    },
    video: {
        initiate: (receiverId: string | number) =>
            apiFetch<{ channel_name: string }>('/video/call/initiate/', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId }) }),
        accept: (channelName: string) =>
            apiFetch('/video/call/accept/', { method: 'POST', body: JSON.stringify({ channel_name: channelName }) }),
        end: (channelName: string, reason: string = 'ended') =>
            apiFetch('/video/call/end/', { method: 'POST', body: JSON.stringify({ channel_name: channelName, reason }) }),
    }
};
