'use client';

import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';
import { ChatPage } from '../../src/page-components/ChatPage';

export default function Chat() {
    return (
        <ProtectedRoute>
            <ChatPage />
        </ProtectedRoute>
    );
}
