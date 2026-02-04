'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { FindPartnerPage } from '../../src/page-components/FindPartnerPage';

export default function FindPartner() {
    return (
        <ProtectedRoute>
            <FindPartnerPage />
        </ProtectedRoute>
    );
}
