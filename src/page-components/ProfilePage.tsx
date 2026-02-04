'use client';

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { Camera, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
export function ProfilePage() {
  const { user } = useAuth();
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Avatar */}
        <div className="relative mb-12">
          <div className="h-48 rounded-3xl bg-gradient-to-r from-[#1a1a4a] to-[#0A1A3A] border border-white/5 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>
          <div className="absolute -bottom-12 left-8 flex items-end">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-[#0A1A3A] bg-[#1a1a4a] overflow-hidden">
                <Avatar
                  src={user?.avatar}
                  fallback={user?.name?.charAt(0) || 'U'}
                  size="xl"
                  className="w-full h-full" />

              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-[#D4AF37] rounded-full text-[#0A1A3A] shadow-lg hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="ml-6 mb-4">
              <h1 className="text-3xl font-serif font-bold text-white">
                {user?.name}
              </h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pt-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h3 className="text-xl font-serif font-bold text-white mb-6">
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Input label="Full Name" defaultValue={user?.name} />
                <Input label="Email" defaultValue={user?.email} disabled />
                <Select
                  label="Country"
                  options={[
                  {
                    value: 'uk',
                    label: 'United Kingdom'
                  },
                  {
                    value: 'us',
                    label: 'United States'
                  },
                  {
                    value: 'ca',
                    label: 'Canada'
                  }]
                  } />

                <Select
                  label="Time Zone"
                  options={[
                  {
                    value: 'gmt',
                    label: 'GMT (London)'
                  },
                  {
                    value: 'est',
                    label: 'EST (New York)'
                  }]
                  } />

              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-serif font-bold text-white mb-6">
                Memorization Profile
              </h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    label="Current Level"
                    options={[
                    {
                      value: 'intermediate',
                      label: 'Intermediate'
                    }]
                    } />

                  <Select
                    label="Primary Language"
                    options={[
                    {
                      value: 'english',
                      label: 'English'
                    }]
                    } />

                </div>
                <Textarea
                  label="Study Goals"
                  rows={4}
                  defaultValue="I aim to complete Surah Al-Kahf this month and review Juz 30." />

              </div>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" leftIcon={<Save className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <AvailabilityCalendar />

            <Card className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                Account Settings
              </h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="secondary" className="w-full justify-start">
                  Notification Settings
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10">

                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>);

}