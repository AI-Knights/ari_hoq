'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../src/components/ui/Card';
import { Users, FileText, MessageCircle, UserX, Loader2 } from 'lucide-react';
import { api } from '../../src/lib/api';

interface StatsRecord {
    total_users: number;
    active_reports: number;
    suspended_users: number;
    messages_today: number;
}

export default function AdminDashboardPage() {
    const [adminStats, setAdminStats] = useState<StatsRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const statsData = await api.admin.stats();
            setAdminStats(statsData);
        } catch (err) {
            console.error('Failed to load admin stats', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">Admin Dashboard</h1>
                <p className="text-theme-text-secondary">System overview and platform statistics.</p>
            </div>

            {/* Stats Row */}
            {adminStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 flex items-center gap-3">
                        <Users className="w-8 h-8 text-[#D4AF37]" />
                        <div>
                            <p className="text-2xl font-bold text-theme-text">{adminStats.total_users}</p>
                            <p className="text-xs text-theme-text-secondary">Total Users</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-orange-400" />
                        <div>
                            <p className="text-2xl font-bold text-theme-text">{adminStats.active_reports}</p>
                            <p className="text-xs text-theme-text-secondary">Open Reports</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-3">
                        <UserX className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-2xl font-bold text-theme-text">{adminStats.suspended_users}</p>
                            <p className="text-xs text-theme-text-secondary">Suspended</p>
                        </div>
                    </Card>
                    <Card className="p-4 flex items-center gap-3">
                        <MessageCircle className="w-8 h-8 text-blue-400" />
                        <div>
                            <p className="text-2xl font-bold text-theme-text">{adminStats.messages_today}</p>
                            <p className="text-xs text-theme-text-secondary">Msgs Today</p>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
