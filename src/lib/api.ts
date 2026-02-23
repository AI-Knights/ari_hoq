// Central API utility — supports Bearer JWT tokens

const getApiBase = () => {
    let url = process.env.NEXT_PUBLIC_API_URL;
    if (url) {
        url = url.replace(/\/+$/, ''); // Strip trailing slashes
        if (!url.endsWith('/api')) {
            url += '/api';
        }
        return url;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://dev.projectyard.top/api';
    }
    return 'http://127.0.0.1:8000/api';
};

const API_BASE = getApiBase();

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
}

interface FetchOptions extends RequestInit {
    skipAuth?: boolean;
    isRetry?: boolean;
}

export async function apiFetch<T = any>(
    path: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth = false, isRetry = false, ...init } = options;
    const token = getToken();

    const headers: Record<string, string> = {
        ...(init.headers as Record<string, string>),
    };

    if (init.body && !(init.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token && !skipAuth) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (!response.ok) {
        // Automatic Refresh Token Interceptor
        if (response.status === 401 && !skipAuth && !isRetry) {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
            if (refreshToken) {
                try {
                    // Attempt to grab a new access token
                    const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh: refreshToken })
                    });

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('access_token', refreshData.access);
                            if (refreshData.refresh) {
                                localStorage.setItem('refresh_token', refreshData.refresh);
                            }
                        }
                        // Replay the original request with the new token
                        return apiFetch<T>(path, { ...options, isRetry: true });
                    }
                } catch (e) {
                    console.error("Token refresh failed", e);
                }
            }
            // If refresh fails or no refresh token, let it fall through to normal error handling (usually logs user out)
        }

        let errorMessage = `API Error ${response.status}`;
        try {
            const errorData = await response.json();
            // Try common single-value keys first
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.non_field_errors) {
                errorMessage = Array.isArray(errorData.non_field_errors)
                    ? errorData.non_field_errors[0]
                    : errorData.non_field_errors;
            } else {
                // DRF field-level errors: {"email": ["Already exists."], "otp": ["Required."]}
                const firstKey = Object.keys(errorData)[0];
                if (firstKey) {
                    const val = errorData[firstKey];
                    const msg = Array.isArray(val) ? val[0] : val;
                    errorMessage = typeof msg === 'string' ? msg : JSON.stringify(errorData);
                }
            }
        } catch { /* non-JSON body */ }
        throw new Error(errorMessage);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

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
        refreshToken: (refresh: string) =>
            apiFetch('/auth/token/refresh/', { method: 'POST', body: JSON.stringify({ refresh }), skipAuth: true }),
    },
    dashboard: { stats: () => apiFetch('/dashboard/stats/') },
    availability: {
        list: () => apiFetch('/availability/'),
        toggle: (day_of_week: string, time_slot: string) =>
            apiFetch('/availability/toggle/', { method: 'POST', body: JSON.stringify({ day_of_week, time_slot }) }),
    },
    match: {
        find: (data: { level: string; language: string; timezone: string; goals: string }) =>
            apiFetch('/match/', { method: 'POST', body: JSON.stringify(data) }),
    },
    hifz: {
        list: () => apiFetch('/hifz/'),
        toggle: (surah_number: number) =>
            apiFetch('/hifz/toggle/', { method: 'POST', body: JSON.stringify({ surah_number }) }),
        stats: () => apiFetch('/hifz/stats/'),
    },
    friends: {
        list: () => apiFetch('/friends/'),
        sendRequest: (data: { username?: string; user_id?: number; message: string }) =>
            apiFetch('/friends/request/', { method: 'POST', body: JSON.stringify(data) }),
        accept: (id: number) => apiFetch(`/friends/${id}/accept/`, { method: 'POST' }),
        decline: (id: number) => apiFetch(`/friends/${id}/decline/`, { method: 'POST' }),
        cancel: (id: number) => apiFetch(`/friends/${id}/cancel/`, { method: 'POST' }),
        unfriend: (user_id: string | number) =>
            apiFetch('/friends/unfriend/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        block: (user_id: string | number) =>
            apiFetch('/friends/block/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        unblock: (user_id: string | number) =>
            apiFetch('/friends/unblock/', { method: 'POST', body: JSON.stringify({ user_id }) }),
        listBlocked: () => apiFetch('/friends/list_blocked/'),
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
        deleteChat: (user_id: string | number) =>
            apiFetch('/messages/delete_chat/', { method: 'POST', body: JSON.stringify({ user_id }) }),
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
    },
    admin: {
        stats: () => apiFetch('/admin/stats/'),
        banUser: (userId: string) => apiFetch(`/admin/users/${userId}/ban/`, { method: 'POST' }),
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
            apiFetch('/video/call/initiate/', { method: 'POST', body: JSON.stringify({ receiver_id: receiverId }) }),
        accept: (channelName: string) =>
            apiFetch('/video/call/accept/', { method: 'POST', body: JSON.stringify({ channel_name: channelName }) }),
        end: (channelName: string) =>
            apiFetch('/video/call/end/', { method: 'POST', body: JSON.stringify({ channel_name: channelName }) }),
    }
};
