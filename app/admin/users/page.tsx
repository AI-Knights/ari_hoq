'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Badge } from '../../../src/components/ui/Badge';
import { Search, Ban, Eye, Loader2, CheckCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api } from '../../../src/lib/api';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Modal } from '../../../src/components/ui/Modal';

interface AvailabilitySlot {
    day_of_week: string;
    time_slot: string;
}

interface UserRecord {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    role: string;
    is_suspended: boolean;
    avatar?: string;
    level?: string;
    location?: string;
    bio?: string;
    timezone?: string;
    primary_language?: string;
    gender?: string;
    memorized_surahs_count?: number;
    current_streak?: number;
    date_joined?: string;
    last_active?: string;
    availability?: AvailabilitySlot[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<UserRecord | null>(null);
    const [isBanning, setIsBanning] = useState(false);

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const usersData = await api.admin.allUsers();
            setUsers(Array.isArray(usersData) ? usersData : usersData.results ?? []);
        } catch (err) {
            console.error('Failed to load admin data', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = async (q: string) => {
        setSearchQuery(q);
        if (!q) { loadData(); return; }
        try {
            const data = await api.admin.allUsers(q);
            setUsers(Array.isArray(data) ? data : data.results ?? []);
        } catch (err) {
            console.error('Search failed', err);
        }
    };

    const handleSuspendConfirm = async () => {
        if (!userToSuspend) return;
        setIsBanning(true);
        try {
            const result = await api.admin.banUser(userToSuspend.id);
            setUsers(prev => prev.map(u =>
                u.id === userToSuspend.id ? { ...u, is_suspended: result.is_suspended ?? !u.is_suspended } : u
            ));

            // If the details modal is also open for this user, update that state too
            if (selectedUser?.id === userToSuspend.id) {
                setSelectedUser(prev => prev ? { ...prev, is_suspended: result.is_suspended ?? !prev.is_suspended } : null);
            }
        } catch (err) {
            console.error('Suspend/Reactivate failed', err);
        } finally {
            setIsBanning(false);
            setUserToSuspend(null);
        }
    };

    const isSuspended = (user: UserRecord) => user.is_suspended === true;

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">User Management</h1>
                <p className="text-theme-text-secondary">View, search, and manage platform users.</p>
            </div>

            <Card className="p-6 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="w-64">
                                <Input
                                    placeholder="Search users..."
                                    leftIcon={<Search className="w-4 h-4" />}
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-theme-border text-theme-text-secondary text-sm">
                                        <th className="pb-4 pl-4">User</th>
                                        <th className="pb-4 hidden sm:table-cell">Email</th>
                                        <th className="pb-4">Role</th>
                                        <th className="pb-4">Status</th>
                                        <th className="pb-4 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme-border">
                                    {users.map((user) => (
                                        <tr key={user.id} className="text-sm hover:bg-theme-hover transition-colors">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={user.avatar} fallback={user.full_name || user.username} size="sm" />
                                                    <span className="font-medium text-theme-text">{user.full_name || user.username}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-theme-text-secondary hidden sm:table-cell">{user.email}</td>
                                            <td className="py-4 text-theme-text-secondary capitalize">{user.role}</td>
                                            <td className="py-4">
                                                <Badge variant={isSuspended(user) ? 'danger' : 'success'}>
                                                    {isSuspended(user) ? 'Suspended' : 'Active'}
                                                </Badge>
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-1.5 text-theme-text-secondary hover:text-theme-text rounded hover:bg-theme-bg-hover transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToSuspend(user)}
                                                        title={isSuspended(user) ? "Reactivate User" : "Suspend User"}
                                                        className={`p-1.5 rounded transition-colors ${isSuspended(user)
                                                            ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                                            : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                                            }`}
                                                    >
                                                        {isSuspended(user) ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Card>

            {/* User Details Modal */}
            <Modal
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                title="User Profile Details"
                maxWidth="lg"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <Avatar src={selectedUser.avatar} fallback={selectedUser.full_name || selectedUser.username} size="lg" />
                            <div>
                                <h3 className="text-xl font-bold text-theme-text">{selectedUser.full_name || selectedUser.username}</h3>
                                <p className="text-theme-text-secondary">{selectedUser.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="default" className="capitalize">{selectedUser.role}</Badge>
                                    <Badge variant={isSuspended(selectedUser) ? 'danger' : 'success'}>
                                        {isSuspended(selectedUser) ? 'Suspended' : 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Profile Details Grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-theme-border">
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Level</p>
                                <p className="text-theme-text font-medium capitalize">{selectedUser.level || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Location</p>
                                <p className="text-theme-text font-medium">{selectedUser.location || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Time Zone</p>
                                <p className="text-theme-text font-medium">{selectedUser.timezone || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Primary Language</p>
                                <p className="text-theme-text font-medium">{selectedUser.primary_language || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Gender</p>
                                <p className="text-theme-text font-medium capitalize">{selectedUser.gender || '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Memorized Surahs</p>
                                <p className="text-theme-text font-medium">{selectedUser.memorized_surahs_count ?? '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Current Streak</p>
                                <p className="text-theme-text font-medium">{selectedUser.current_streak != null ? `${selectedUser.current_streak} days` : '—'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-theme-text font-medium">{selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString() : '—'}</p>
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-1">Study Goals &amp; Bio</p>
                            <p className="text-theme-text bg-theme-bg p-3 rounded-lg border border-theme-border min-h-[60px]">
                                {selectedUser.bio || 'No bio provided.'}
                            </p>
                        </div>

                        {/* Weekly Availability Grid */}
                        {selectedUser.availability && selectedUser.availability.length > 0 && (() => {
                            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                            const slots = ['Morning', 'Afternoon', 'Evening', 'Night'];
                            const active = new Set(selectedUser.availability!.map(a => `${a.day_of_week}-${a.time_slot}`));
                            return (
                                <div>
                                    <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-3">Weekly Availability</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr>
                                                    <th className="text-left text-theme-muted pb-2 pr-2 w-20"></th>
                                                    {days.map(d => (
                                                        <th key={d} className="text-center text-theme-text-secondary pb-2 px-1 font-medium">{d}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {slots.map(slot => (
                                                    <tr key={slot}>
                                                        <td className="text-theme-text-secondary pr-2 py-1">{slot}</td>
                                                        {days.map(day => {
                                                            const isActive = active.has(`${day}-${slot}`);
                                                            return (
                                                                <td key={day} className="text-center py-1 px-1">
                                                                    <div className={`w-6 h-6 mx-auto rounded ${isActive
                                                                        ? 'bg-[#D4AF37]'
                                                                        : 'bg-theme-bg border border-theme-border'
                                                                        }`} />
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="pt-6 border-t border-theme-border flex justify-between items-center">
                            <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                                Close
                            </Button>

                            <Button
                                variant={isSuspended(selectedUser) ? 'primary' : 'danger'}
                                onClick={() => setUserToSuspend(selectedUser)}
                            >
                                {isSuspended(selectedUser) ? (
                                    <><CheckCircle className="w-4 h-4 mr-2" /> Reactivate Account</>
                                ) : (
                                    <><Ban className="w-4 h-4 mr-2" /> Suspend Account</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Suspend/Reactivate Confirmation Modal */}
            <Modal
                isOpen={!!userToSuspend}
                onClose={() => !isBanning && setUserToSuspend(null)}
                title={userToSuspend && isSuspended(userToSuspend) ? "Reactivate User" : "Suspend User"}
                maxWidth="sm"
            >
                {userToSuspend && (
                    <div className="space-y-6 text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${isSuspended(userToSuspend) ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {isSuspended(userToSuspend) ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                        </div>

                        <div>
                            <p className="text-theme-text mb-2">
                                Are you sure you want to {isSuspended(userToSuspend) ? 'reactivate' : 'suspend'} <strong>{userToSuspend.username}</strong>?
                            </p>
                            <p className="text-sm text-theme-text-secondary">
                                {isSuspended(userToSuspend)
                                    ? "They will regain full access to the platform."
                                    : "They will be immediately logged out and blocked from accessing the platform."}
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setUserToSuspend(null)}
                                disabled={isBanning}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={isSuspended(userToSuspend) ? 'primary' : 'danger'}
                                onClick={handleSuspendConfirm}
                                isLoading={isBanning}
                            >
                                Yes, {isSuspended(userToSuspend) ? 'Reactivate' : 'Suspend'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
