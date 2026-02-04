'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { FriendsPage } from '../../src/page-components/FriendsPage';

export default function Friends() {
    return (
        <ProtectedRoute>
            <FriendsPage />
        </ProtectedRoute>
    );
}
