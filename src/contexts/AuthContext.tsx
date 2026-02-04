'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';

type UserRole = 'user' | 'admin' | 'moderator';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    level?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, role?: UserRole) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate checking local storage for auth token
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('quran_partner_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, role: UserRole = 'user') => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email,
            role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            level: 'Intermediate'
        };
        setUser(mockUser);
        if (typeof window !== 'undefined') {
            localStorage.setItem('quran_partner_user', JSON.stringify(mockUser));
        }
        setIsLoading(false);
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('quran_partner_user');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
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
