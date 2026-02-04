'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { ProfilePage } from '../../src/page-components/ProfilePage';

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    );
}
