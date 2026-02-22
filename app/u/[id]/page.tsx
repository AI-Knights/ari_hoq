import { ProtectedRoute } from '@/src/components/layout/ProtectedRoute';
import { PublicProfilePage } from '@/src/page-components/PublicProfilePage';

export default async function ProfileView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <ProtectedRoute>
            <PublicProfilePage userId={id} />
        </ProtectedRoute>
    );
}
