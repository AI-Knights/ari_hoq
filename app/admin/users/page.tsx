'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { Input } from '../../../src/components/ui/Input';
import { Badge } from '../../../src/components/ui/Badge';
import { Search, Ban, Eye, Loader2, CheckCircle, AlertTriangle, ShieldAlert, Trash2 } from 'lucide-react';
import { api } from '../../../src/lib/api';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Modal } from '../../../src/components/ui/Modal';
import { useUserStatus } from '../../../src/hooks/useUserStatus';

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
    hifz_progress?: { surah_number: number; status: string }[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { getStatus } = useUserStatus();

    // Modal States
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [userToSuspend, setUserToSuspend] = useState<UserRecord | null>(null);
    const [isBanning, setIsBanning] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate status from last_active timestamp (3 minutes threshold)
    const getUserStatus = (user: UserRecord): 'online' | 'offline' => {
        if (!user.last_active) return 'offline';
        const lastActive = new Date(user.last_active);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
        return diffMinutes <= 3 ? 'online' : 'offline';
    };

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

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            await api.admin.deleteUser(userToDelete.id);
            setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            if (selectedUser?.id === userToDelete.id) {
                setSelectedUser(null);
            }
        } catch (err) {
            console.error('Delete failed', err);
        } finally {
            setIsDeleting(false);
            setUserToDelete(null);
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
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-theme-border">
                                        <th className="pb-3 pl-4 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider">User</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider hidden md:table-cell">Email</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Role</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Status</th>
                                        <th className="pb-3 pr-4 text-right text-xs font-semibold text-theme-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, index) => (
                                        <tr 
                                            key={user.id} 
                                            className={`border-b border-theme-border last:border-0 hover:bg-theme-bg-hover transition-colors group ${
                                                isSuspended(user) ? 'opacity-60' : ''
                                            }`}
                                        >
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar 
                                                        src={user.avatar} 
                                                        fallback={(user.full_name || user.username)?.charAt(0).toUpperCase() || 'U'} 
                                                        size="md"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-theme-text group-hover:text-[#D4AF37] transition-colors">
                                                            {user.full_name || user.username}
                                                        </p>
                                                        <p className="text-xs text-theme-text-muted md:hidden">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 hidden md:table-cell">
                                                <span className="text-sm text-theme-text-secondary">{user.email}</span>
                                            </td>
                                            <td className="py-4">
                                                <Badge 
                                                    variant={user.role === 'admin' ? 'default' : user.role === 'moderator' ? 'warning' : 'outline'}
                                                    className="capitalize font-medium"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                <span className={`text-sm font-medium ${isSuspended(user) ? 'text-red-400' : 'text-green-400'}`}>
                                                    {isSuspended(user) ? 'Suspended' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => setSelectedUser(user)}
                                                        className="p-2 text-theme-text-secondary hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToSuspend(user)}
                                                        title={isSuspended(user) ? "Reactivate User" : "Suspend User"}
                                                        className={`p-2 rounded-lg transition-all ${
                                                            isSuspended(user)
                                                                ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                                                : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                                                        }`}
                                                    >
                                                        {isSuspended(user) ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setUserToDelete(user)}
                                                        title="Permanently Delete User"
                                                        className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-1"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            {users.length === 0 && (
                                <div className="text-center py-12">
                                    <ShieldAlert className="w-12 h-12 text-theme-text-muted mx-auto mb-3" />
                                    <p className="text-theme-text-secondary">No users found</p>
                                </div>
                            )}
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

                        {/* Hifz Progress Grid */}
                        {selectedUser.hifz_progress && selectedUser.hifz_progress.length > 0 && (
                            <div>
                                <p className="text-xs text-theme-text-secondary uppercase tracking-wider mb-3">Hifz Progress</p>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                                    {selectedUser.hifz_progress.map((progress) => {
                                        let bgColor = 'bg-theme-bg border border-theme-border';
                                        let textColor = 'text-theme-text-secondary';
                                        
                                        if (progress.status === 'mastered') {
                                            bgColor = 'bg-green-500/20 border-green-500/30';
                                            textColor = 'text-green-500 font-medium';
                                        } else if (progress.status === 'reviewing') {
                                            bgColor = 'bg-yellow-500/20 border-yellow-500/30';
                                            textColor = 'text-yellow-500 font-medium';
                                        } else if (progress.status === 'memorizing') {
                                            bgColor = 'bg-blue-500/20 border-blue-500/30';
                                            textColor = 'text-blue-500 font-medium';
                                        }
                                        
                                        return (
                                            <div 
                                                key={progress.surah_number} 
                                                className={`flex items-center justify-center h-8 rounded text-xs ${bgColor} ${textColor}`}
                                                title={`Surah ${progress.surah_number} - ${progress.status}`}
                                            >
                                                {progress.surah_number}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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

                            <div className="flex gap-2">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setUserToDelete(selectedUser);
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Account
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

            {/* Delete User Confirmation Modal */}
            <Modal
                isOpen={!!userToDelete}
                onClose={() => !isDeleting && setUserToDelete(null)}
                title="Permanently Delete User"
                maxWidth="sm"
            >
                {userToDelete && (
                    <div className="space-y-6 text-center">
                        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
                            <Trash2 className="w-6 h-6" />
                        </div>

                        <div>
                            <p className="text-theme-text mb-2">
                                Are you sure you want to permanently delete <strong>{userToDelete.username}</strong>?
                            </p>
                            <p className="text-sm text-theme-text-secondary">
                                This action cannot be undone. All user data, including progress and messages, will be permanently removed.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setUserToDelete(null)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleDeleteConfirm}
                                isLoading={isDeleting}
                            >
                                Yes, Delete Permanently
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
}
