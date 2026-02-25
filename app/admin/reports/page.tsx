'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Badge } from '../../../src/components/ui/Badge';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Loader2, AlertTriangle, ArrowRight, Calendar, Flag, Shield } from 'lucide-react';
import { api } from '../../../src/lib/api';

interface ReportRecord {
    id: string;
    reporter: { id: string; username: string; full_name?: string; avatar?: string; email?: string };
    reported_user: { id: string; username: string; full_name?: string; avatar?: string; email?: string };
    reason: string;
    report_type?: string;
    severity?: string;
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

    const handleDismissReport = async (reportId: string) => {
        setResolvingId(reportId);
        try {
            await api.reports.dismiss(parseInt(reportId, 10));
            setReports(prev => prev.map(r =>
                r.id === reportId ? { ...r, status: 'dismissed' } : r
            ));
        } catch (err) {
            console.error('Dismiss failed', err);
        } finally {
            setResolvingId(null);
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch(severity) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-orange-500';
            case 'low': return 'text-yellow-500';
            default: return 'text-theme-text-muted';
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
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-theme-text mb-2">All Clear!</h3>
                        <p className="text-theme-text-secondary">No reports pending review.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report) => (
                            <Card key={report.id} className={`p-4 ${report.status === 'pending' ? 'border-l-4 border-l-orange-500' : ''}`}>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    {/* Reporter & Reported User */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <AlertTriangle className={`w-4 h-4 ${getSeverityColor(report.severity)}`} />
                                            <div className="flex items-center gap-2">
                                                <Badge variant={report.status === 'pending' ? 'warning' : report.status === 'resolved' ? 'success' : 'outline'} className="capitalize text-xs">
                                                    {report.status}
                                                </Badge>
                                                {report.report_type && (
                                                    <Badge variant="outline" className="capitalize text-xs">
                                                        {report.report_type}
                                                    </Badge>
                                                )}
                                                {report.severity && (
                                                    <span className={`text-xs font-semibold ${getSeverityColor(report.severity)} capitalize`}>
                                                        {report.severity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                                            {/* Reporter */}
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Avatar 
                                                    src={report.reporter.avatar} 
                                                    fallback={(report.reporter.full_name || report.reporter.username)?.charAt(0).toUpperCase() || 'R'} 
                                                    size="sm"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-theme-text truncate">
                                                        {report.reporter.full_name || report.reporter.username}
                                                    </p>
                                                    <p className="text-xs text-theme-text-muted truncate">
                                                        {report.reporter.email || report.reporter.username}
                                                    </p>
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-theme-text-muted shrink-0 hidden sm:block" />

                                            {/* Reported User */}
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <Avatar 
                                                    src={report.reported_user.avatar} 
                                                    fallback={(report.reported_user.full_name || report.reported_user.username)?.charAt(0).toUpperCase() || 'U'} 
                                                    size="sm"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-red-400 truncate">
                                                        {report.reported_user.full_name || report.reported_user.username}
                                                    </p>
                                                    <p className="text-xs text-red-400/70 truncate">
                                                        {report.reported_user.email || report.reported_user.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Reason/Message */}
                                        <div className="bg-theme-bg-elevated rounded p-3 border border-theme-border">
                                            <div className="flex items-start gap-1.5 mb-1">
                                                <Flag className="w-3 h-3 text-theme-text-muted mt-0.5" />
                                                <p className="text-xs font-semibold text-theme-text-muted uppercase tracking-wide">Reason</p>
                                            </div>
                                            <p className="text-xs text-theme-text leading-relaxed">{report.reason}</p>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-theme-text-muted">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(report.created_at).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'short', 
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {report.status === 'pending' && (
                                        <div className="flex flex-col gap-2 lg:w-32">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                isLoading={resolvingId === report.id}
                                                onClick={() => handleResolveReport(report.id)}
                                                className="w-full"
                                            >
                                                Resolve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                isLoading={resolvingId === report.id}
                                                onClick={() => handleDismissReport(report.id)}
                                                className="w-full"
                                            >
                                                Dismiss
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Card>
        </>
    );
}
