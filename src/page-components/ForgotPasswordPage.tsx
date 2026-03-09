'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Step = 'email' | 'verify' | 'success';

export function ForgotPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('email');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOtpChange = (i: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[i] = value.slice(-1);
    setOtp(next);
    if (value && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus();
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.auth.passwordResetRequest({ email });
      setResetToken(response.reset_token);
      setOtp(['', '', '', '', '', '']);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please check your email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await api.auth.passwordResetConfirm({
        reset_token: resetToken,
        otp: code,
        new_password: newPassword,
      });
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-theme-bg via-theme-bg-elevated to-theme-bg flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-serif font-bold text-[#D4AF37] mb-4">QuranPartners</h1>
          <p className="text-xl text-theme-text-secondary mb-8 max-w-md">
            Connect with memorization partners around the world. Study together, grow together.
          </p>
          <div className="text-[#D4AF37] font-serif text-2xl italic">
            "اقْرَأْ بِاسْمِ رَبِّكَ"
          </div>
          <p className="text-theme-text-muted text-sm mt-2">Read in the name of your Lord — Al-'Alaq 96:1</p>
        </div>
      </div>

      {/* Right — Reset Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-theme-bg">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* ── Email Step ── */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => router.push('/auth')}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-theme-text mb-2">Reset Password</h2>
                <p className="text-theme-text-secondary mb-6 sm:mb-8">Enter your email to receive a reset code.</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-5">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Send Reset Code
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Verify & Reset Step ── */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <button
                  onClick={() => { setStep('email'); setError(''); }}
                  className="flex items-center gap-2 text-theme-text-secondary hover:text-theme-text mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Email
                </button>

                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-theme-text text-center mb-2">Enter Reset Code</h2>
                <p className="text-theme-text-secondary text-center mb-2 text-sm sm:text-base">
                  We sent a code to
                </p>
                <p className="text-[#D4AF37] text-center font-medium mb-6 sm:mb-8 text-sm sm:text-base">{email}</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {/* OTP input boxes */}
                  <div className="flex gap-2 sm:gap-3 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onPaste={e => {
                          const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          if (pasted.length === 6) {
                            const arr = pasted.split('');
                            setOtp(arr);
                            otpRefs.current[5]?.focus();
                          }
                        }}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border-2 focus:outline-none transition-all"
                        style={{
                          color: '#0A1A3A',
                          backgroundColor: '#FFFFFF',
                          borderColor: '#D4AF37',
                        }}
                      />
                    ))}
                  </div>

                  <Input
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-theme-text-secondary hover:text-theme-text transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="text-theme-text-secondary hover:text-theme-text transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                    Reset Password
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── Success ── */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                <h2 className="text-3xl font-serif font-bold text-theme-text mb-2">Password Reset!</h2>
                <p className="text-theme-text-secondary mb-8">
                  Your password has been successfully reset.
                </p>

                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => router.push('/auth')}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Back to Sign In
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
