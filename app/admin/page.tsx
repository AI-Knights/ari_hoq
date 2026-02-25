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
    user_activity: {
        last_hour: number;
        last_day: number;
        last_week: number;
        inactive: number;
    };
    hifz_distribution: {
        '0-25': number;
        '26-50': number;
        '51-75': number;
        '76-100': number;
    };
    recent_signups: number;
    recent_friendships: number;
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
                <>
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

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* User Activity Timeline */}
                        <Card className="p-6">
                            <h3 className="text-lg font-serif font-bold text-theme-text mb-4">User Activity Timeline</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-theme-text-secondary">Active in Last Hour</span>
                                        <span className="text-green-500 font-semibold">{adminStats.user_activity.last_hour} users</span>
                                    </div>
                                    <div className="h-3 bg-theme-bg-elevated rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-green-500 to-green-300 rounded-full transition-all duration-500"
                                            style={{ width: `${(adminStats.user_activity.last_hour / Math.max(1, adminStats.total_users)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-theme-text-secondary">Active Today</span>
                                        <span className="text-blue-400 font-semibold">{adminStats.user_activity.last_day} users</span>
                                    </div>
                                    <div className="h-3 bg-theme-bg-elevated rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all duration-500"
                                            style={{ width: `${(adminStats.user_activity.last_day / Math.max(1, adminStats.total_users)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-theme-text-secondary">Active This Week</span>
                                        <span className="text-[#D4AF37] font-semibold">{adminStats.user_activity.last_week} users</span>
                                    </div>
                                    <div className="h-3 bg-theme-bg-elevated rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#fce588] rounded-full transition-all duration-500"
                                            style={{ width: `${(adminStats.user_activity.last_week / Math.max(1, adminStats.total_users)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-theme-text-secondary">Inactive Users</span>
                                        <span className="text-gray-500 font-semibold">{adminStats.user_activity.inactive} users</span>
                                    </div>
                                    <div className="h-3 bg-theme-bg-elevated rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-gray-500 to-gray-300 rounded-full transition-all duration-500"
                                            style={{ width: `${(adminStats.user_activity.inactive / Math.max(1, adminStats.total_users)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Hifz Progress Distribution */}
                        <Card className="p-6">
                            <h3 className="text-lg font-serif font-bold text-theme-text mb-4">Hifz Progress Distribution</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-theme-bg-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-12 bg-gradient-to-b from-red-400 to-red-600 rounded"></div>
                                        <div>
                                            <p className="text-sm font-medium text-theme-text">0-25% Complete</p>
                                            <p className="text-xs text-theme-text-muted">Beginning stage</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-theme-text">{adminStats.hifz_distribution['0-25']}</p>
                                        <p className="text-xs text-theme-text-muted">
                                            {Math.round((adminStats.hifz_distribution['0-25'] / Math.max(1, adminStats.total_users)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-theme-bg-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-12 bg-gradient-to-b from-orange-400 to-orange-600 rounded"></div>
                                        <div>
                                            <p className="text-sm font-medium text-theme-text">26-50% Complete</p>
                                            <p className="text-xs text-theme-text-muted">Making progress</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-theme-text">{adminStats.hifz_distribution['26-50']}</p>
                                        <p className="text-xs text-theme-text-muted">
                                            {Math.round((adminStats.hifz_distribution['26-50'] / Math.max(1, adminStats.total_users)) * 100)}%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-theme-bg-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-12 bg-gradient-to-b from-blue-400 to-blue-600 rounded"></div>
                                        <div>
                                            <p className="text-sm font-medium text-theme-text">51-75% Complete</p>
                                            <p className="text-xs text-theme-text-muted">Advanced learners</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-theme-text">{adminStats.hifz_distribution['51-75']}</p>
                                        <p className="text-xs text-theme-text-muted">
                                            {Math.round((adminStats.hifz_distribution['51-75'] / Math.max(1, adminStats.total_users)) * 100)}%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-theme-bg-elevated rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-12 bg-gradient-to-b from-green-400 to-green-600 rounded"></div>
                                        <div>
                                            <p className="text-sm font-medium text-theme-text">76-100% Complete</p>
                                            <p className="text-xs text-theme-text-muted">Near completion</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-theme-text">{adminStats.hifz_distribution['76-100']}</p>
                                        <p className="text-xs text-theme-text-muted">
                                            {Math.round((adminStats.hifz_distribution['76-100'] / Math.max(1, adminStats.total_users)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Platform Growth */}
                    <Card className="p-6 mb-8">
                        <h3 className="text-lg font-serif font-bold text-theme-text mb-4">Platform Growth (Last 7 Days)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-theme-bg-elevated rounded-lg">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-[#D4AF37]" />
                                </div>
                                <p className="text-3xl font-bold text-[#D4AF37] mb-1">{adminStats.recent_signups}</p>
                                <p className="text-sm text-theme-text-secondary">New Signups</p>
                                <p className="text-xs text-theme-text-muted mt-2">
                                    {adminStats.total_users > 0 ? ((adminStats.recent_signups / adminStats.total_users) * 100).toFixed(1) : 0}% growth
                                </p>
                            </div>
                            
                            <div className="text-center p-6 bg-theme-bg-elevated rounded-lg">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-green-500" />
                                </div>
                                <p className="text-3xl font-bold text-green-500 mb-1">{adminStats.recent_friendships}</p>
                                <p className="text-sm text-theme-text-secondary">New Partnerships</p>
                                <p className="text-xs text-theme-text-muted mt-2">
                                    {adminStats.total_users > 0 ? (adminStats.recent_friendships / (adminStats.total_users / 2)).toFixed(1) : 0} avg per user
                                </p>
                            </div>

                            <div className="text-center p-6 bg-theme-bg-elevated rounded-lg">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className="text-3xl font-bold text-blue-500 mb-1">{adminStats.messages_today}</p>
                                <p className="text-sm text-theme-text-secondary">Messages Today</p>
                                <p className="text-xs text-theme-text-muted mt-2">
                                    {adminStats.total_users > 0 ? (adminStats.messages_today / adminStats.total_users).toFixed(1) : 0} per user
                                </p>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </>
    );
}
