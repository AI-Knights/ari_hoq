import { DashboardHome } from '../../src/page-components/DashboardHome';
import { serverApi } from '../../src/lib/server-api';

export default async function Dashboard() {
    // Fetch dashboard stats on the server — pass null if auth not yet resolved
    const res = await serverApi.get('/dashboard/stats/');

    return <DashboardHome initialStats={res.success ? res.data : null} />;
}
