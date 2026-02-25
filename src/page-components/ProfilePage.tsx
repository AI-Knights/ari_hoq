'use client';

import React, { useState, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Avatar } from '../components/ui/Avatar';
import { AvailabilityCalendar } from '../components/AvailabilityCalendar';
import { Camera, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { LANGUAGES, TIMEZONES, LOCATIONS } from '../constants/languages-timezones';

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state initialized from user context
  const [name, setName] = useState(user?.name || '');
  const [level, setLevel] = useState(user?.level || '');
  const [bio, setBio] = useState((user as any)?.bio || '');
  const [location, setLocation] = useState((user as any)?.location || '');
  const [timezone, setTimezone] = useState((user as any)?.timezone || '');
  const [primaryLanguage, setPrimaryLanguage] = useState((user as any)?.primary_language || '');
  const [gender, setGender] = useState((user as any)?.gender || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  // Determine if there are any unsaved changes
  const hasChanges =
    name !== (user?.name || '') ||
    level !== (user?.level || '') ||
    bio !== ((user as any)?.bio || '') ||
    location !== ((user as any)?.location || '') ||
    timezone !== ((user as any)?.timezone || '') ||
    primaryLanguage !== ((user as any)?.primary_language || '') ||
    gender !== ((user as any)?.gender || '') ||
    avatarFile !== null;

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      let payload: any;
      if (avatarFile) {
        payload = new FormData();
        payload.append('full_name', name);
        payload.append('username', name);
        payload.append('level', level);
        payload.append('bio', bio);
        payload.append('location', location);
        payload.append('timezone', timezone);
        payload.append('primary_language', primaryLanguage);
        payload.append('gender', gender);
        payload.append('avatar', avatarFile);
      } else {
        payload = {
          full_name: name,
          username: name,
          level,
          bio,
          location,
          timezone,
          primary_language: primaryLanguage,
          gender,
        };
      }

      const updatedUser = await api.auth.updateProfile(payload);
      updateUser({
        ...updatedUser,
        name: updatedUser.full_name || updatedUser.username || name,
        avatar: avatarPreview || updatedUser.avatar || user?.avatar,
      });
      setAvatarFile(null); // Clear the selected file to reset "hasChanges" state
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Avatar */}
        {/* mb-20 ensures the overlapping avatar has space before the cards grid */}
        <div className="relative mb-20">
          <div className="h-48 rounded-3xl bg-gradient-to-r from-theme-bg-elevated to-theme-bg border border-theme-border overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
          </div>
          <div className="absolute -bottom-16 sm:-bottom-12 left-0 right-0 sm:left-8 flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-start">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-theme-bg bg-theme-bg overflow-hidden flex items-center justify-center">
                <Avatar
                  src={avatarPreview || user?.avatar}
                  fallback={user?.name?.charAt(0) || 'U'}
                  size="xl"
                  className="w-full h-full"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 bg-[#D4AF37] rounded-full text-[#0A1A3A] shadow-lg hover:scale-110 transition-transform cursor-pointer"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {/* Avatar is shifted down 48px (-bottom-12) or 64px 
                Align text vertically relative to the avatar circle size */}
            <div className="mt-4 sm:mt-0 sm:ml-6 mb-2 sm:mb-6 flex flex-col justify-end text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-theme-text">
                {user?.name}
              </h1>
              <p className="text-sm sm:text-base text-theme-text-secondary">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 pt-20 sm:pt-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 overflow-visible relative z-20">
              <h3 className="text-xl font-serif font-bold text-theme-text mb-6">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6 items-end">
                <Input
                  label="Display Name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                />
                <Input label="Email" defaultValue={user?.email} disabled />
                <Select
                  label="Gender"
                  value={gender}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGender(e.target.value)}
                  options={[
                    { value: '', label: 'Prefer not to say' },
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <SearchableSelect
                  label="Location"
                  placeholder="Select Location"
                  options={LOCATIONS}
                  value={location}
                  onChange={setLocation}
                />
                <div className="md:col-span-2">
                  <SearchableSelect
                    label="Time Zone"
                    placeholder="Select Time Zone"
                    options={TIMEZONES}
                    value={timezone}
                    onChange={setTimezone}
                  />
                </div>
              </div>
            </Card>

            <AvailabilityCalendar />

            <Card className="p-8 overflow-visible relative z-10">
              <h3 className="text-xl font-serif font-bold text-theme-text mb-6">Memorization Profile</h3>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Select
                    label="Current Level"
                    value={level}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLevel(e.target.value)}
                    options={[
                      { value: 'beginner', label: 'Beginner (Juz 30)' },
                      { value: 'intermediate', label: 'Intermediate (5-10 Juz)' },
                      { value: 'advanced', label: 'Advanced (15+ Juz)' },
                      { value: 'hafiz', label: 'Hafiz (Revision)' },
                    ]}
                  />
                  <SearchableSelect
                    label="Primary Language"
                    placeholder="Select Language"
                    options={LANGUAGES}
                    value={primaryLanguage}
                    onChange={setPrimaryLanguage}
                  />
                </div>
                <Textarea
                  label="Study Goals & Bio"
                  rows={4}
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
                  placeholder="I aim to complete Surah Al-Kahf this month..."
                />
              </div>
            </Card>

            {saveError && (
              <p className="text-red-500 text-sm">{saveError}</p>
            )}

            <div className="flex justify-end">
              <Button
                size="lg"
                leftIcon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={!hasChanges && !isSaving && !saved}
                className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-theme-text mb-4">Account Settings</h3>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">Change Password</Button>
                <Button variant="secondary" className="w-full justify-start">Notification Settings</Button>
                <Button variant="secondary" className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}