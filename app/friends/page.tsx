import { FriendsPage } from '../../src/page-components/FriendsPage';
import { serverApi } from '../../src/lib/server-api';

export default async function Friends() {
    // Fetch data securely on the Next.js server before rendering
    const [friendsRes, blockedRes] = await Promise.all([
        serverApi.get('/friends/'),
        serverApi.get('/friends/blocked/')
    ]);

    return (
        <FriendsPage 
            initialFriendsData={friendsRes.success ? friendsRes.data : []} 
            initialBlockedData={blockedRes.success ? blockedRes.data : []} 
        />
    );
}
