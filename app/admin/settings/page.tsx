'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { Button } from '../../../src/components/ui/Button';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Camera, Save, CheckCircle, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../../src/contexts/AuthContext';
import { api } from '../../../src/lib/api';

export default function AdminSettingsPage() {
    const { user, updateUser } = useAuth();

    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [name, setName] = useState(user?.name || '');

    // Password State
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setSaved(false);
        }
    };

    const hasChanges =
        name !== (user?.name || '') ||
        avatarFile !== null;

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError('');
        setSaved(false);

        try {
            const formData = new FormData();
            formData.append('full_name', name);
            formData.append('username', name);

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await updateUser(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            setSaveError(error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        setIsChangingPassword(true);
        setPasswordError('');
        setPasswordSuccess(false);

        try {
            await api.auth.changePassword({ old_password: oldPassword, new_password: newPassword });
            setPasswordSuccess(true);
            setOldPassword('');
            setNewPassword('');
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            console.error('Failed to change password:', error);
            setPasswordError(error.message || 'Failed to change password. Please verify your current password.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">Platform Settings</h1>
                <p className="text-theme-text-secondary">Configure your admin profile and global platform toggles.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8">
                        <h3 className="text-xl font-serif font-bold text-theme-text mb-6">Admin Profile</h3>

                        <div className="flex flex-col sm:flex-row gap-8 mb-8 items-center sm:items-start">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-theme-border bg-theme-bg overflow-hidden flex items-center justify-center">
                                    <Avatar
                                        src={avatarPreview || user?.avatar}
                                        fallback={user?.name?.charAt(0) || 'A'}
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

                            <div className="flex-1 w-full space-y-6">
                                <Input
                                    label="Display Name"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                />
                                <Input label="Email" defaultValue={user?.email} disabled />
                            </div>
                        </div>

                        {saveError && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {saveError}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-theme-border">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                                isLoading={isSaving}
                                className="w-full sm:w-auto"
                            >
                                {saved ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Saved Successfully
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="p-8">
                        <h3 className="text-xl font-serif font-bold text-theme-text mb-6">Change Password</h3>

                        <div className="space-y-6 mb-8 max-w-md">
                            <Input
                                label="Current Password"
                                type="password"
                                value={oldPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={newPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                            />
                        </div>

                        {passwordError && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {passwordError}
                            </div>
                        )}

                        <div className="flex justify-start pt-4 border-t border-theme-border">
                            <Button
                                onClick={handlePasswordChange}
                                disabled={isChangingPassword || !oldPassword || !newPassword}
                                isLoading={isChangingPassword}
                                className="w-full sm:w-auto"
                            >
                                {passwordSuccess ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Password Updated
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-theme-border">
                        <div className="bg-[#D4AF37]/10 p-4 rounded-full mb-6 relative">
                            <div className="absolute inset-0 bg-[#D4AF37] blur-xl opacity-20 rounded-full"></div>
                            <SettingsIcon className="w-12 h-12 text-[#D4AF37] relative z-10" />
                        </div>
                        <h2 className="text-xl font-bold text-theme-text mb-2">Global Settings</h2>
                        <p className="text-theme-text-secondary text-sm">
                            System configuration toggles and maintenance controls will appear here in the next release.
                        </p>
                    </Card>
                </div>
            </div>
        </>
    );
}
