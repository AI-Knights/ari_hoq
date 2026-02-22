'use client';

import { FindPartnerPage } from '../../src/page-components/FindPartnerPage';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function FindPartner() {
    return (
        <ProtectedRoute>
            <FindPartnerPage />
        </ProtectedRoute>
    );
}
