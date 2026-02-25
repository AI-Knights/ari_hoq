import { Suspense } from 'react';
import { ForgotPasswordPage } from '../../src/page-components/ForgotPasswordPage';

export default function ForgotPassword() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-theme-bg" />}>
            <ForgotPasswordPage />
        </Suspense>
    );
}
