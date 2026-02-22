'use client';

import { HifzJourneyPage } from '../../src/page-components/HifzJourneyPage';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function HifzJourney() {
    return (
        <ProtectedRoute>
            <HifzJourneyPage />
        </ProtectedRoute>
    );
}
