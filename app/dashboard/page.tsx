'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { DashboardHome } from '../../src/page-components/DashboardHome';

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardHome />
        </ProtectedRoute>
    );
}
