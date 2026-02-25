import { Suspense } from 'react';
import { AuthPage } from '../../src/page-components/AuthPage';

export default function Auth() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-theme-bg" />}>
            <AuthPage />
        </Suspense>
    );
}
