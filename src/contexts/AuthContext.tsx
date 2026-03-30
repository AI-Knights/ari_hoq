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
    is_2fa_enabled?: boolean;
    has_completed_onboarding?: boolean;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<User | { requires_2fa: true, two_fa_token: string }>;
    verify2FALogin: (two_fa_token: string, code: string) => Promise<User>;
    register: (email: string, password: string, username?: string) => Promise<{ email: string }>;
    verifyEmail: (email: string, code: string) => Promise<User>;
    resendCode: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (updates: Partial<User> | FormData | object) => void;
    refreshUser: () => Promise<void>;
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
        is_2fa_enabled: data.is_2fa_enabled,
        has_completed_onboarding: data.has_completed_onboarding,
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

    const refreshUser = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await authFetch('/api/auth/session');
            if (data?.user) {
                try {
                    const profile = await api.auth.me();
                    setUser(mapUser(profile));
                } catch {
                    setUser(mapUser(data.user));
                }
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // On mount: restore session by asking our server-side /api/auth/session endpoint.
    // It reads the httpOnly access_token cookie and returns the decoded user claims.
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

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
        try {
            const response = await api.auth.login({ email, password });
            if (response.requires_2fa) {
                return { requires_2fa: true as const, two_fa_token: response.two_fa_token };
            }
            if (response.user) {
                setUser(mapUser(response.user));
                return mapUser(response.user);
            }
            throw new Error('Invalid login response');
        } catch (err: any) {
            console.error('Login error:', err);
            // In api.ts we attach the error string to err.message and err.response.data.detail
            throw new Error(err.message || err.response?.data?.error || err.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    }, []);

    const verify2FALogin = useCallback(async (two_fa_token: string, code: string) => {
        try {
            const response = await api.auth.verify2FALogin({ two_fa_token, code });
            if (response.user) {
                setUser(mapUser(response.user));
                return mapUser(response.user);
            }
            throw new Error('Invalid verification response');
        } catch (err: any) {
            console.error('2FA Verification error:', err);
            throw new Error(err.response?.data?.error || err.response?.data?.detail || 'Verification failed');
        }
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
            verify2FALogin,
            logout,
            updateUser,
            refreshUser,
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
