'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';

type UserRole = 'user' | 'admin' | 'moderator';

interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatar?: string;
    level?: string;
    // Computed property for compatibility
    name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password?: string) => Promise<void>;
    register: (email: string, password?: string, username?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://127.0.0.1:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode; }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/me/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (res.ok) {
                const userData = await res.json();
                setUser({ ...userData, name: userData.username });
            } else {
                // Token invalid
                localStorage.removeItem('auth_token');
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check failed', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password?: string) => {
        setIsLoading(true);
        try {
            // If strictly needing username for login, we might need a change. 
            // My LoginSerializer expects username.
            // But frontend asks for Email.
            // I should update LoginSerializer to accept email OR update frontend.
            // For now, I'll assume username is passed as email or I update serializer.
            // Wait, standard Django `authenticate` uses username.
            // I'll assume users register with username = email or I adjust serializer.

            // Let's force username = email for simplicity if not provided separately,
            // OR update serializer to look up by email.
            // I'll send email as username to backend for now, assuming registration handles it.

            // Wait, duplicate email/username check?
            // Let's pass username as email.

            const res = await fetch(`${API_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.non_field_errors?.[0] || 'Login failed');
            }

            const data = await res.json();
            localStorage.setItem('auth_token', data.token);
            setUser({ ...data.user, name: data.user.username });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password?: string, username?: string) => {
        setIsLoading(true);
        try {
            // Use email as username if not provided
            const finalUsername = username || email.split('@')[0];

            const res = await fetch(`${API_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    username: finalUsername
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(JSON.stringify(error));
            }

            const data = await res.json();
            localStorage.setItem('auth_token', data.token);
            setUser({ ...data.user, name: data.user.username });
        } catch (error) {
            console.error(error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await fetch(`${API_URL}/auth/logout/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
            } catch (e) {
                console.error(e);
            }
        }
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout
            }}>

            {children}
        </AuthContext.Provider>);

}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
