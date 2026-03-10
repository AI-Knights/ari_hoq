import { ChatPage } from '../../src/page-components/ChatPage';
import { serverApi } from '../../src/lib/server-api';

export default async function Chat() {
    const [threadsRes, friendsRes, blockedRes] = await Promise.all([
        serverApi.get('/messages/threads/'),
        serverApi.get('/friends/list/'),
        serverApi.get('/friends/blocked/')
    ]);

    return (
        <ChatPage 
            initialThreadsData={threadsRes.success ? threadsRes.data : []}
            initialFriendsData={friendsRes.success ? friendsRes.data : []} 
            initialBlockedData={blockedRes.success ? blockedRes.data : []} 
        />
    );
}
