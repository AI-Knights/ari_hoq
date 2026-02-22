'use client';

import { DashboardHome } from '../../src/page-components/DashboardHome';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardHome />
        </ProtectedRoute>
    );
}
