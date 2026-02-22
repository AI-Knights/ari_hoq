'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { Loader2 } from 'lucide-react';
import { api } from '../../../src/lib/api';

interface ReportRecord {
    id: string;
    reporter: { username: string; full_name?: string; gender?: string };
    reported_user: { username: string; full_name?: string; gender?: string };
    reason: string;
    status: string;
    created_at: string;
}

export default function AdminReportsPage() {
    const [reports, setReports] = useState<ReportRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resolvingId, setResolvingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const reportsData = await api.reports.list();
            setReports(Array.isArray(reportsData) ? reportsData : reportsData.results ?? []);
        } catch (err) {
            console.error('Failed to load reports', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleResolveReport = async (reportId: string) => {
        setResolvingId(reportId);
        try {
            await api.reports.resolve(parseInt(reportId, 10));
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, status: 'resolved' } : r
            ));
        } catch (err) {
            console.error('Resolve failed', err);
        } finally {
            setResolvingId(null);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">Reported Content</h1>
                <p className="text-theme-text-secondary">Review and resolve user-submitted reports and flagged activity.</p>
            </div>

            <Card className="p-6 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-theme-border text-theme-text-secondary text-sm">
                                        <th className="pb-4 pl-4">Reporter</th>
                                        <th className="pb-4">Reported User</th>
                                        <th className="pb-4">Reason</th>
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme-border">
                                    {reports.map((report) => (
                                        <tr key={report.id} className="text-sm hover:bg-theme-bg-hover transition-colors">
                                            <td className="py-4 pl-4 text-theme-text">{report.reporter?.username}</td>
                                            <td className="py-4 text-theme-text">{report.reported_user?.username}</td>
                                            <td className="py-4 text-theme-text-secondary max-w-xs truncate">{report.reason}</td>
                                            <td className="py-4 text-theme-text-secondary">{new Date(report.created_at).toLocaleDateString()}</td>
                                            <td className="py-4">
                                                <Badge variant={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'default'}>
                                                    {report.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                {report.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        isLoading={resolvingId === report.id}
                                                        onClick={() => handleResolveReport(report.id)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {reports.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-theme-text-secondary">No reports pending!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>
        </>
    );
}
