import { PublicProfilePage } from '@/src/page-components/PublicProfilePage';

export default async function ProfileView({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <PublicProfilePage userId={id} />;
}
