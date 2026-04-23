'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { PasswordInput } from '../../../src/components/ui/PasswordInput';
import { Button } from '../../../src/components/ui/Button';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Camera, Save, CheckCircle, Shield, Settings as SettingsIcon } from 'lucide-react';
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

    // 2FA State
    const [is2FALoading, setIs2FALoading] = useState(false);
    const [qrData, setQrData] = useState<string | null>(null);
    const [totpSecret, setTotpSecret] = useState<string | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [twoFAError, setTwoFAError] = useState('');

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

            await api.auth.updateProfile(formData);
            await updateUser(formData);
            setSaved(true);
            setAvatarFile(null);
            setAvatarPreview(null);
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

    const handleEnable2FAInit = async () => {
        setIs2FALoading(true);
        setTwoFAError('');
        try {
            const data = await api.auth.enable2FAInit();
            setQrData(data.qr_data);
            setTotpSecret(data.secret);
        } catch (error: any) {
            setTwoFAError(error.message || 'Failed to initiate 2FA setup.');
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleSetup2FA = async () => {
        if (!totpSecret || !verificationCode) return;
        setIs2FALoading(true);
        setTwoFAError('');
        try {
            await api.auth.setup2FA({ secret: totpSecret, code: verificationCode });
            await updateUser({ ...user, is_2fa_enabled: true } as any);
            setQrData(null);
            setTotpSecret(null);
            setVerificationCode('');
        } catch (error: any) {
            setTwoFAError(error.message || 'Invalid verification code.');
        } finally {
            setIs2FALoading(false);
        }
    };

    const handleDisable2FA = async () => {
        setIs2FALoading(true);
        setTwoFAError('');
        try {
            await api.auth.disable2FA();
            await updateUser({ ...user, is_2fa_enabled: false } as any);
        } catch (error: any) {
            setTwoFAError(error.message || 'Failed to disable 2FA.');
        } finally {
            setIs2FALoading(false);
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

                    {/* 2FA API UI Card */}
                    <Card className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-[#D4AF37]" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-theme-text">Two-Factor Authentication</h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className={`w-2 h-2 rounded-full ${user?.is_2fa_enabled ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-400'}`}></div>
                                        <span className={user?.is_2fa_enabled ? 'text-green-500' : 'text-theme-text-secondary'}>
                                            {user?.is_2fa_enabled ? 'Active & Secure' : 'Currently Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {!qrData && (
                                <Button
                                    onClick={user?.is_2fa_enabled ? handleDisable2FA : handleEnable2FAInit}
                                    variant={user?.is_2fa_enabled ? 'danger' : 'secondary'}
                                    size="sm"
                                    isLoading={is2FALoading}
                                    className={!user?.is_2fa_enabled ? "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 px-8" : "px-8"}
                                >
                                    {user?.is_2fa_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                                </Button>
                            )}
                        </div>

                        {twoFAError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                {twoFAError}
                            </div>
                        )}

                        {qrData && (
                            <div className="mt-6 p-6 bg-theme-bg-secondary rounded-lg border border-theme-border flex flex-col items-center">
                                <p className="text-theme-text font-medium mb-4 text-center">
                                    Scan this QR code with your authenticator app:
                                </p>
                                <div className="bg-white p-2 rounded-xl mb-4 shadow-sm">
                                    <img src={qrData} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                                <div className="mb-6 px-4 py-2 bg-theme-bg rounded-md border border-theme-border text-center">
                                    <p className="text-sm text-theme-text-secondary mb-1">Or enter this secret manually:</p>
                                    <code className="text-[#D4AF37] font-mono tracking-wider">{totpSecret}</code>
                                </div>
                                
                                <div className="w-full max-w-xs space-y-4">
                                    <Input
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="text-center text-xl tracking-[0.5em] font-mono"
                                        maxLength={6}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => { setQrData(null); setTotpSecret(null); setTwoFAError(''); }}
                                            variant="ghost"
                                            className="flex-1"
                                            disabled={is2FALoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSetup2FA}
                                            disabled={verificationCode.length !== 6 || is2FALoading}
                                            isLoading={is2FALoading}
                                            className="flex-1"
                                        >
                                            Verify
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Change Password Card */}
                    <Card className="p-8">
                        <h3 className="text-xl font-serif font-bold text-theme-text mb-6">Change Password</h3>

                        <div className="space-y-6 mb-8 max-w-md">
                            <PasswordInput
                                label="Current Password"
                                value={oldPassword}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
                            />
                            <PasswordInput
                                label="New Password"
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
            </div>
        </>
    );
}
