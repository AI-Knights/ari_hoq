'use client';

import { ChatPage } from '../../src/page-components/ChatPage';
import { ProtectedRoute } from '../../src/components/layout/ProtectedRoute';

export default function Chat() {
    return (
        <ProtectedRoute>
            <ChatPage />
        </ProtectedRoute>
    );
}
