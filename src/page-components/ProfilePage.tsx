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
import { updateProfileServerAction, changePasswordServerAction, deleteAccountServerAction } from '../lib/actions/profile';

export function ProfilePage({ initialUser }: { initialUser?: any }) {
  const { user, updateUser, logout } = useAuth();
  
  // Use initialUser from Server Component if available, otherwise fallback to AuthContext
  const activeUser = initialUser || user;

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form state initialized from activeUser
  const [name, setName] = useState(activeUser?.name || activeUser?.full_name || '');
  const [level, setLevel] = useState(activeUser?.level || '');
  const [bio, setBio] = useState(activeUser?.bio || '');
  const [location, setLocation] = useState(activeUser?.location || '');
  const [timezone, setTimezone] = useState(activeUser?.timezone || '');
  const [primaryLanguage, setPrimaryLanguage] = useState(activeUser?.primary_language || '');
  const [gender, setGender] = useState(activeUser?.gender || '');

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
    name !== (activeUser?.name || activeUser?.full_name || '') ||
    level !== (activeUser?.level || '') ||
    bio !== (activeUser?.bio || '') ||
    location !== (activeUser?.location || '') ||
    timezone !== (activeUser?.timezone || '') ||
    primaryLanguage !== (activeUser?.primary_language || '') ||
    gender !== (activeUser?.gender || '') ||
    avatarFile !== null;

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const result = await changePasswordServerAction({ old_password: oldPassword, new_password: newPassword });
      if (!result.success) throw new Error(result.error);
      
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setDeleteError('');
    
    if (!deletePassword) {
      setDeleteError('Password is required.');
      return;
    }
    
    setIsDeleting(true);
    try {
      const result = await deleteAccountServerAction({ password: deletePassword });
      if (!result.success) throw new Error(result.error);
      
      logout();
      window.location.href = '/auth';
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append('full_name', name);
      formData.append('username', name);
      formData.append('level', level);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('timezone', timezone);
      formData.append('primary_language', primaryLanguage);
      formData.append('gender', gender);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const result = await updateProfileServerAction(formData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const updatedUser = result.data as any;

      // Update local client authentication context
      updateUser({
        ...updatedUser,
        name: updatedUser.full_name || updatedUser.username || name,
        avatar: avatarPreview || updatedUser.avatar || activeUser?.avatar,
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
                <Button 
                  variant="secondary" 
                  className="w-full justify-start"
                  onClick={() => setShowPasswordModal(true)}>
                  Change Password
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-theme-text">Change Password</h3>
            <Input
              type="password"
              label="Current Password"
              value={oldPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowPasswordModal(false);
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordError('');
                }}
                disabled={isChangingPassword}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 whitespace-nowrap"
                onClick={handleChangePassword}
                isLoading={isChangingPassword}
                disabled={isChangingPassword}>
                Change Password
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
            <p className="text-theme-text-secondary">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <Input
              type="password"
              label="Confirm Password"
              value={deletePassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
            />
            {deleteError && (
              <p className="text-red-500 text-sm">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                disabled={isDeleting}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white border-red-500 whitespace-nowrap"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                disabled={isDeleting}>
                Delete Account
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}