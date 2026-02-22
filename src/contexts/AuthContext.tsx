'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, apiFetch } from '../lib/api';

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
    // Step 1 — returns {email, step: 'verify'} or throws
    register: (email: string, password: string, username?: string) => Promise<{ email: string }>;
    // Step 2 — verifies OTP, logs user in
    verifyEmail: (email: string, code: string) => Promise<User>;
    resendCode: (email: string) => Promise<void>;
    login: (email: string, password: string) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (data: Partial<User> | FormData | object) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function storeTokens(access: string, refresh: string) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

function mapUser(data: any): User {
    return {
        id: String(data.id),
        name: data.username,
        email: data.email,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Attempt to restore session from stored access token
    useEffect(() => {
        const restore = async () => {
            const access = localStorage.getItem('access_token');
            if (!access) { setIsLoading(false); return; }
            try {
                const data = await api.auth.me();
                setUser(mapUser(data));
            } catch {
                // Try refreshing
                const refresh = localStorage.getItem('refresh_token');
                if (refresh) {
                    try {
                        const res = await api.auth.refreshToken(refresh);
                        localStorage.setItem('access_token', res.access);
                        if (res.refresh) localStorage.setItem('refresh_token', res.refresh);
                        const data = await api.auth.me();
                        setUser(mapUser(data));
                    } catch {
                        clearTokens();
                    }
                } else {
                    clearTokens();
                }
            } finally {
                setIsLoading(false);
            }
        };
        restore();
    }, []);

    const register = useCallback(async (email: string, password: string, username?: string) => {
        // Step 1: request verification code
        await api.auth.register({ email, password, username });
        return { email };
    }, []);

    const verifyEmail = useCallback(async (email: string, code: string) => {
        const data = await api.auth.verifyEmail({ email, otp: code });
        storeTokens(data.access, data.refresh);
        const mapped = mapUser(data.user);
        setUser(mapped);
        return mapped;
    }, []);

    const resendCode = useCallback(async (email: string) => {
        await api.auth.resendCode({ email });
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const data = await api.auth.login({ email, password });
        storeTokens(data.access, data.refresh);
        const mapped = mapUser(data.user);
        setUser(mapped);
        return mapped;
    }, []);

    const logout = useCallback(async () => {
        try { await api.auth.logout(); } catch { /* ignore */ }
        clearTokens();
        setUser(null);
    }, []);

    const updateUser = useCallback((data: Partial<User> | FormData | object) => {
        // If it's a FormData object, extract the fields that update the local state directly.
        if (data instanceof FormData) {
            const updates: Partial<User> = {};
            const name = data.get('name');
            const avatar = data.get('avatar');

            if (name) updates.name = name as string;
            // The actual image URL will require a backend refresh, 
            // but for immediate local state we ignore the binary and wait for the API response.

            setUser(prev => prev ? { ...prev, ...updates } : null);
        } else {
            setUser(prev => prev ? { ...prev, ...(data as Partial<User>) } : null);
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
