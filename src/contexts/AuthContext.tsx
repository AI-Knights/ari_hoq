'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

/**
 * Production-grade AuthContext.
 *
 * Tokens are NEVER stored in localStorage. They live in httpOnly cookies
 * managed entirely by the server (Django backend + Next.js API route proxies).
 * This context only stores the decoded user object in React state.
 */

interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    level?: string;
    bio?: string;
    location?: string;
    timezone?: string;
    primary_language?: string;
    gender?: string;
    is_suspended?: boolean;
    current_streak?: number;
    memorized_surahs_count?: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    register: (email: string, password: string, username?: string) => Promise<{ email: string }>;
    verifyEmail: (email: string, code: string) => Promise<User>;
    resendCode: (email: string) => Promise<void>;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User> | FormData | object) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(data: any): User {
    return {
        id: String(data.id ?? data.user_id ?? ''),
        name: data.username ?? data.name ?? data.full_name ?? '',
        email: data.email ?? '',
        role: data.role,
        avatar: data.avatar,
        level: data.level,
        bio: data.bio,
        location: data.location,
        timezone: data.timezone,
        primary_language: data.primary_language,
        gender: data.gender,
        is_suspended: data.is_suspended,
        current_streak: data.current_streak,
        memorized_surahs_count: data.memorized_surahs_count,
    };
}

/** Thin wrapper — throws on non-2xx with a readable message. */
async function authFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(path, { ...init, credentials: 'include' });
    if (!res.ok) {
        let msg = `Error ${res.status}`;
        try {
            const err = await res.json();
            if (err.non_field_errors && Array.isArray(err.non_field_errors)) {
                msg = err.non_field_errors[0];
            } else if (err.detail) {
                msg = err.detail;
            } else if (err.error) {
                msg = err.error;
            } else if (err.message) {
                msg = err.message;
            } else if (typeof err === 'object') {
                // Handle field-level DRF errors like {"password": ["Must be 8 chars"]}
                const firstKey = Object.keys(err)[0];
                if (firstKey && Array.isArray(err[firstKey])) {
                    msg = err[firstKey][0];
                }
            }
        } catch { /* non-JSON */ }
        throw new Error(msg);
    }
    if (res.status === 204) return {};
    return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // On mount: restore session by asking our server-side /api/auth/session endpoint.
    // It reads the httpOnly access_token cookie and returns the decoded user claims.
    useEffect(() => {
        (async () => {
            try {
                const data = await authFetch('/api/auth/session');
                if (data?.user) {
                    // Session route only has JWT claims — fetch full profile for extra fields
                    try {
                        const profile = await api.auth.me();
                        setUser(mapUser(profile));
                    } catch {
                        setUser(mapUser(data.user));
                    }
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const register = useCallback(async (email: string, password: string, username?: string) => {
        const { registerAction } = await import('../lib/actions/auth');
        const res = await registerAction({ email, password, username });
        if (!res.success) throw new Error(res.error);
        return { email };
    }, []);

    const verifyEmail = useCallback(async (email: string, code: string) => {
        const data = await authFetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp: code }),
        });

        const mapped = mapUser(data.user);
        setUser(mapped);
        return mapped;
    }, []);

    const resendCode = useCallback(async (email: string) => {
        await api.auth.resendCode({ email });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const { loginAction } = await import('../lib/actions/auth');
        
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        
        const res = await loginAction(formData);
        if (!res.success) throw new Error(res.error);

        const data = res.data as any;
        const mapped = mapUser(data.user);
        setUser(mapped);
        return mapped;
    }, []);

    const logout = useCallback(async () => {
        const { logoutAction } = await import('../lib/actions/auth');
        await logoutAction(); // Server action handles cookie deletion and redirect
        setUser(null);
    }, []);

    const updateUser = useCallback((data: any) => {
        if (data instanceof FormData) {
            const updates: Partial<User> = {};
            const name = data.get('name') || data.get('full_name') || data.get('username');
            if (name) updates.name = name as string;
            
            // Map other common fields if they exist in FormData
            ['level', 'bio', 'location', 'timezone', 'primary_language', 'gender'].forEach(field => {
                const val = data.get(field);
                if (val !== null) (updates as any)[field] = val as string;
            });

            setUser(prev => prev ? { ...prev, ...updates } : null);
        } else {
            // If the data looks like a raw backend response (has full_name or user_id), map it.
            // Otherwise, treat it as a partial User object.
            const isRawResponse = data.full_name !== undefined || data.username !== undefined || data.user_id !== undefined || data.id !== undefined;
            
            if (isRawResponse) {
                const mapped = mapUser(data);
                // Merge mapped updates into existing user state
                setUser(prev => prev ? { ...prev, ...mapped } : mapped);
            } else {
                setUser(prev => prev ? { ...prev, ...(data as Partial<User>) } : null);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            register,
            verifyEmail,
            resendCode,
            login,
            logout,
            updateUser,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
