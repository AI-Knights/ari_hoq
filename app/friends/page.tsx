'use client';

import { FriendsPage } from '../../src/page-components/FriendsPage';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function Friends() {
    return (
        <ProtectedRoute>
            <FriendsPage />
        </ProtectedRoute>
    );
}
