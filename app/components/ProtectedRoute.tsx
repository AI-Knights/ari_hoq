'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Client-side auth guard. Shows a loading spinner while session is being
 * resolved, then redirects to /auth if the user is not authenticated.
 * The Next.js middleware handles server-side protection; this is a safety net.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect AFTER we've finished checking — prevents flash redirects
        if (!isLoading && !user) {
            router.replace('/auth');
        }
    }, [user, isLoading, router]);

    // Always show spinner while we are loading — prevents any content flash
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

    // If not logged in, render nothing while redirect is in flight
    if (!user) return null;

    return <>{children}</>;
}
