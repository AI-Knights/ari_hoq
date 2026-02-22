'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps a page and redirects to `/` if the user is not authenticated.
 * Shows a brief loading pulse while auth state is being resolved.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace('/');
        }
    }, [user, isLoading, router]);

    // While auth is resolving, show a minimal skeleton
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg)' }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin" />
                    <p className="text-theme-text-secondary text-sm">Loading…</p>
                </div>
            </div>
        );
    }

    // If not logged in, render nothing (redirect is in flight)
    if (!user) return null;

    return <>{children}</>;
}
