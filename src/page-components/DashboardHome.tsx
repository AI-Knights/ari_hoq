'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { ProgressCard } from '../components/ProgressCard';
import { FriendCard } from '../components/FriendCard';
import { Globe } from '../components/Globe';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Search, MessageCircle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
export function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const recentMatches = [
    {
      id: '1',
      name: 'Omar Farooq',
      level: 'Intermediate',
      language: ['English', 'Arabic'],
      status: 'online' as const
    },
    {
      id: '2',
      name: 'Sarah Ahmed',
      level: 'Advanced',
      language: ['English', 'Urdu'],
      status: 'offline' as const
    }];

  return (
    <DashboardLayout>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className="flex justify-between items-end">

            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2">
                Assalamu Alaikum, {user?.name}
              </h1>
              <p className="text-gray-400">
                Ready to continue your memorization journey?
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-400">Current Date</p>
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
                <h3 className="font-bold text-white mb-1">Find a Partner</h3>
                <p className="text-sm text-gray-400">
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
                <h3 className="font-bold text-white mb-1">Messages</h3>
                <p className="text-sm text-gray-400">2 unread messages</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37] transition-colors">
                <MessageCircle className="w-6 h-6 text-[#D4AF37] group-hover:text-[#0A1A3A]" />
              </div>
            </Card>
          </div>

          {/* Progress Section */}
          <ProgressCard
            totalSurahs={114}
            completedSurahs={12}
            currentSurah="Surah Al-Kahf"
            streakDays={5} />


          {/* Recent Matches */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-white">
                Recent Matches
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/friends')}>

                View All
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {recentMatches.map((match) =>
                <FriendCard
                  key={match.id}
                  user={match}
                  variant="friend"
                  onAction={(action) => {
                    if (action === 'chat') router.push('/chat');
                  }} />

              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Mini Globe Widget */}
          <Card className="p-6 bg-[#11224a]/80 backdrop-blur-md overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-50">
              <Globe />
            </div>
            <div className="relative z-10 text-center mt-auto bg-[#0A1A3A]/80 p-4 rounded-xl backdrop-blur-sm w-full">
              <p className="text-[#D4AF37] font-bold text-2xl">1,240</p>
              <p className="text-sm text-gray-300">Seekers online now</p>
            </div>
          </Card>

          {/* Daily Verse/Quote */}
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
    </DashboardLayout>);

}