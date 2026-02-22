import React from 'react';
import { IslamicPatterns } from '../../src/components/IslamicPatterns';
import { AdminSidebar } from '../../src/components/layout/AdminSidebar';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <div className="min-h-screen text-theme-text transition-colors duration-300" style={{ backgroundColor: 'var(--theme-bg)' }}>
                <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
                    <IslamicPatterns />
                </div>

                <AdminSidebar />

                <main className="lg:ml-64 min-h-screen relative z-10 pt-16 lg:pt-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                        {children}
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
