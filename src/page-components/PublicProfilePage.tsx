'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
    ArrowLeft,
    MapPin,
    Globe2,
    Clock,
    BookOpen,
    TrendingUp,
    CheckCircle2,
    Loader2,
    MessageCircle,
    UserPlus
} from 'lucide-react';
import { api } from '../lib/api';
import { useUserStatus } from '../hooks/useUserStatus';

export function PublicProfilePage({ userId }: { userId: string }) {
    const router = useRouter();
    const { getStatus } = useUserStatus();

    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'accepted' | 'blocked'>('none');
    const [isBlocked, setIsBlocked] = useState(false);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await api.users.get(userId);
            setProfile(data);

            // Check if user is blocked
            try {
                const blockedData = await api.friends.listBlocked();
                const blockedList = Array.isArray(blockedData) ? blockedData : (blockedData?.results ?? []);
                const isUserBlocked = blockedList.some((u: any) => String(u.id) === userId);
                setIsBlocked(isUserBlocked);
                
                if (isUserBlocked) {
                    setFriendshipStatus('blocked');
                    return; // Don't check friendship if blocked
                }
            } catch (blockErr) {
                console.error('Failed to check block status', blockErr);
            }

            // Check friendship status to show appropriate action buttons
            try {
                const friendsData = await api.friends.list();
                const friendsList = Array.isArray(friendsData) ? friendsData : (friendsData.results || []);

                const friendship = friendsList.find((f: any) =>
                    String(f.user1?.id) === userId || String(f.user2?.id) === userId
                );

                if (friendship) {
                    setFriendshipStatus(friendship.status);
                }
            } catch (friendErr) {
                console.error('Failed to load friendship status', friendErr);
            }

        } catch (err: any) {
            console.error('Failed to load profile', err);
            setError(err.message || 'Profile not found or you do not have permission to view it.');
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSendRequest = async () => {
        try {
            await api.friends.sendRequest({ user_id: parseInt(userId, 10), message: "Salam! I'd like to connect." });
            setFriendshipStatus('pending');
        } catch (err) {
            console.error('Failed to send request', err);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center h-64 text-theme-text-secondary">
                    <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading profile...
                </div>
            </DashboardLayout>
        );
    }

    if (error || !profile) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto space-y-6">
                    <Button variant="ghost" className="mb-4" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Back
                    </Button>
                    <Card className="p-12 text-center border-red-500/30 bg-red-500/5">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Unavailable</h2>
                        <p className="text-theme-text-secondary">{error || 'This user profile could not be loaded.'}</p>
                    </Card>
                </div>
            </DashboardLayout>
        );
    }

    // Use unified status hook - only friends can see real status
    const displayStatus = getStatus(
        userId,
        profile,
        friendshipStatus === 'accepted',
        isBlocked
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Navigation */}
                <Button variant="ghost" className="-ml-4 mb-2 hover:bg-theme-bg-hover" onClick={() => router.back()} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    Back
                </Button>

                {/* Profile Header */}
                <Card className="overflow-hidden">
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-[#D4AF37]/20 via-theme-bg-hover to-[#0A1A3A]/40 border-b border-theme-border flex items-center justify-center relative overflow-hidden">
                        {/* Decorative Islamic Pattern watermark idea */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(212, 175, 55, 0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    </div>

                    <div className="px-8 pb-8 relative">
                        {/* Avatar & Action Row */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
                            <div className="relative">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-theme-card bg-theme-bg overflow-hidden shadow-xl">
                                    <Avatar
                                        src={profile.avatar}
                                        fallback={(profile.name || profile.username || 'U').charAt(0).toUpperCase()}
                                        size="xl"
                                        status={displayStatus as any}
                                        className="w-full h-full text-4xl"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4 sm:mt-0">
                                {isBlocked ? (
                                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                                        You've blocked this user
                                    </div>
                                ) : friendshipStatus === 'accepted' ? (
                                    <Button
                                        variant="primary"
                                        leftIcon={<MessageCircle className="w-4 h-4" />}
                                        onClick={() => router.push(`/chat?userId=${userId}`)}>
                                        Message
                                    </Button>
                                ) : friendshipStatus === 'pending' ? (
                                    <Button variant="secondary" disabled>Request Sent</Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        leftIcon={<UserPlus className="w-4 h-4" />}
                                        onClick={handleSendRequest}>
                                        Connect
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-theme-text flex items-center gap-3">
                                    {profile.name || profile.username || 'Anonymous'}
                                    {profile.level === 'Hafiz' && (
                                        <Badge variant="success" className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50">verified</Badge>
                                    )}
                                </h1>
                                <p className="text-theme-text-secondary mt-1">@{profile.username}</p>
                            </div>

                            {profile.bio && (
                                <p className="text-theme-text leading-relaxed bg-theme-bg p-4 rounded-xl border border-theme-border/50 text-sm">
                                    "{profile.bio}"
                                </p>
                            )}

                            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2 text-sm text-theme-text-secondary">
                                {profile.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                        {profile.location}
                                    </div>
                                )}
                                {profile.primary_language && (
                                    <div className="flex items-center gap-2">
                                        <Globe2 className="w-4 h-4 text-[#D4AF37]" />
                                        {profile.primary_language}
                                    </div>
                                )}
                                {profile.timezone && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#D4AF37]" />
                                        {profile.timezone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quranic Stats */}
                <div className="grid sm:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-[#D4AF37]/10 to-transparent border-[#D4AF37]/20">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="w-6 h-6 text-[#D4AF37]" />
                            <h3 className="text-theme-text-secondary font-medium">Hifz Level</h3>
                        </div>
                        <p className="text-2xl font-bold text-theme-text capitalize">{profile.level || 'Beginner'}</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                            <h3 className="text-theme-text-secondary font-medium">Memorized</h3>
                        </div>
                        <p className="text-2xl font-bold text-theme-text">
                            {profile.memorized_surahs_count || 0} <span className="text-sm font-normal text-theme-text-secondary">Surahs</span>
                        </p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            <h3 className="text-theme-text-secondary font-medium">Active Streak</h3>
                        </div>
                        <p className="text-2xl font-bold text-theme-text">
                            {profile.current_streak || 0} <span className="text-sm font-normal text-theme-text-secondary">Days</span>
                        </p>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    );
}
