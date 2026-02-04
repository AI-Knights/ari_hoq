'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { AdminDashboard } from '../../src/page-components/AdminDashboard';

export default function Admin() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
        </ProtectedRoute>
    );
}
