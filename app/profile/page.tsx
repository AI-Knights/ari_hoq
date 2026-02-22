'use client';

import { ProfilePage } from '../../src/page-components/ProfilePage';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    );
}
