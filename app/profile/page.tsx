import { ProfilePage } from '../../src/page-components/ProfilePage';
import { serverApi } from '../../src/lib/server-api';

export default async function Profile() {
    const res = await serverApi.get('/auth/me/');
    return <ProfilePage initialUser={res.success ? res.data : null} />;
}
