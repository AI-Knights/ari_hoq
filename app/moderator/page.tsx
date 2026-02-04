'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { ModeratorPanel } from '../../src/page-components/ModeratorPanel';

export default function Moderator() {
    return (
        <ProtectedRoute allowedRoles={['moderator', 'admin']}>
            <ModeratorPanel />
        </ProtectedRoute>
    );
}
