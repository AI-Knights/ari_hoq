'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { ProgressCard } from '../components/ProgressCard';
import { FriendCard } from '../components/FriendCard';
import { Globe } from '../components/Globe';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Search, MessageCircle, BookOpen, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';

interface DashboardStats {
  streak: number;
  completed_surahs: number;
  total_surahs: number;
  online_count: number;
  recent_matches: Array<{
    id: number;
    username: string;
    email: string;
    avatar: string | null;
    level: string | null;
    primary_language: string | null;
  }>;
}

export function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.dashboard.stats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-end">

            <div>
              <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">
                Assalamu Alaikum, {user?.name}
              </h1>
              <p className="text-theme-text-secondary">
                Ready to continue your memorization journey?
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm text-theme-text-secondary">Current Date</p>
              <p className="text-[#D4AF37] font-medium font-serif">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card
              variant="interactive"
              className="p-6 flex items-center justify-between group"
              onClick={() => router.push('/find-partner')}>

              <div>
                <h3 className="font-bold text-theme-text mb-1">Find a Partner</h3>
                <p className="text-sm text-theme-text-secondary">
                  Match with compatible seekers
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                <Search className="w-6 h-6 text-[#D4AF37] group-hover:text-[#0A1A3A]" />
              </div>
            </Card>

            <Card
              variant="interactive"
              className="p-6 flex items-center justify-between group"
              onClick={() => router.push('/chat')}>

              <div>
                <h3 className="font-bold text-theme-text mb-1">Messages</h3>
                <p className="text-sm text-theme-text-secondary">
                  {isLoading ? 'Loading...' : `${stats?.recent_matches?.length ?? 0} conversations`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                <MessageCircle className="w-6 h-6 text-[#D4AF37] group-hover:text-[#0A1A3A]" />
              </div>
            </Card>
          </div>

          {/* Progress Section */}
          <ProgressCard
            totalSurahs={114}
            completedSurahs={stats?.completed_surahs ?? 0}
            currentSurah="Tap Hifz Journey to update"
            streakDays={stats?.streak ?? 0}
          />

          {/* Recent Matches */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-theme-text">
                Recent Partners
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/friends')}>
                View All
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-24 text-theme-text-secondary">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading...
              </div>
            ) : stats?.recent_matches?.length === 0 ? (
              <Card className="p-8 text-center text-theme-text-secondary">
                <p>No partners yet.</p>
                <Button className="mt-4" onClick={() => router.push('/find-partner')}>Find Your First Partner</Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {stats?.recent_matches?.map((match) => (
                  <FriendCard
                    key={match.id}
                    user={{
                      id: String(match.id),
                      name: match.username,
                      level: match.level || 'Unknown',
                      language: match.primary_language ? [match.primary_language] : [],
                      status: 'online' as const,
                      avatar: match.avatar || undefined,
                    }}
                    variant="friend"
                    onAction={(action, userId) => {
                      if (action === 'chat') router.push(`/chat?userId=${userId}`);
                      if (action === 'profile') router.push(`/u/${userId}`);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Mini Globe Widget */}
          <Card className="p-6 bg-theme-card backdrop-blur-md overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-50">
              <Globe />
            </div>
            <div className="relative z-10 text-center mt-auto p-4 rounded-xl backdrop-blur-sm w-full" style={{ backgroundColor: 'var(--theme-bg)', opacity: 0.9 }}>
              <p className="text-[#D4AF37] font-bold text-2xl">
                {isLoading ? '...' : (stats?.online_count ?? 0).toLocaleString()}
              </p>
              <p className="text-sm text-theme-text-secondary">Seekers online now</p>
            </div>
          </Card>

          {/* Daily Quote */}
          <Card className="p-6 bg-gradient-to-br from-[#11224a] to-[#0A1A3A] border border-[#D4AF37]/20">
            <BookOpen className="w-8 h-8 text-[#D4AF37] mb-4" />
            <blockquote className="text-lg font-serif text-white italic mb-4">
              "The best of you are those who learn the Quran and teach it."
            </blockquote>
            <p className="text-sm text-gray-400 text-right">
              — Prophet Muhammad (ﷺ)
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}