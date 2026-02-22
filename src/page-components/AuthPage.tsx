'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, ArrowRight, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-react';

type Step = 'login' | 'signup' | 'verify';

export function AuthPage() {
  const { login, register, verifyEmail, resendCode } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('login');
  const [pendingEmail, setPendingEmail] = useState('');

  // Start on signup tab if ?tab=signup is in the URL
  useEffect(() => {
    if (searchParams.get('tab') === 'signup') setStep('signup');
  }, [searchParams]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP fields (6 inputs)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(email, password);
      setPendingEmail(result.email);
      setOtp(['', '', '', '', '', '']);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setError('Please enter the 6-digit code.'); return; }
    setError('');
    setIsLoading(true);
    try {
      const user = await verifyEmail(pendingEmail, code);
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await resendCode(pendingEmail);
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A1A3A] via-[#11224a] to-[#0A1A3A] flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center">
          <h1 className="text-5xl font-serif font-bold text-[#D4AF37] mb-4">QuranPartners</h1>
          <p className="text-xl text-gray-300 mb-8 max-w-md">
            Connect with memorization partners around the world. Study together, grow together.
          </p>
          <div className="text-[#D4AF37] font-serif text-2xl italic">
            "اقْرَأْ بِاسْمِ رَبِّكَ"
          </div>
          <p className="text-gray-400 text-sm mt-2">Read in the name of your Lord — Al-'Alaq 96:1</p>
        </div>
      </div>

      {/* Right — Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0d0d0d]">
        <div className="w-full max-w-md">

          <AnimatePresence mode="wait">
            {/* ── Login ── */}
            {step === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Welcome back</h2>
                <p className="text-gray-400 mb-8">Sign in to continue your journey.</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Sign In
                  </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                  Don't have an account?{' '}
                  <button onClick={() => { setStep('signup'); setError(''); }} className="text-[#D4AF37] hover:underline font-medium">
                    Sign Up
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── Sign Up ── */}
            {step === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-3xl font-serif font-bold text-white mb-2">Create account</h2>
                <p className="text-gray-400 mb-8">Join thousands of Quran memorizers worldwide.</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-5">
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    leftIcon={<Mail className="w-4 h-4" />}
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(p => !p)} className="text-gray-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirmPassword(p => !p)} className="text-gray-400 hover:text-white transition-colors">
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                    value={confirmPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" size="lg" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Create Account
                  </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-8">
                  Already have an account?{' '}
                  <button onClick={() => { setStep('login'); setError(''); }} className="text-[#D4AF37] hover:underline font-medium">
                    Sign In
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── Verification ── */}
            {step === 'verify' && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                </div>

                <h2 className="text-3xl font-serif font-bold text-white text-center mb-2">Check your email</h2>
                <p className="text-gray-400 text-center mb-2">
                  We sent a 6-digit code to
                </p>
                <p className="text-[#D4AF37] text-center font-medium mb-8">{pendingEmail}</p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerify}>
                  {/* OTP input boxes */}
                  <div className="flex gap-3 justify-center mb-8">
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
                        className={`
                          w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-[#11224a] text-white
                          focus:outline-none transition-all
                          ${digit ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-white/10 focus:border-[#D4AF37]/60'}
                        `}
                      />
                    ))}
                  </div>

                  <Button type="submit" size="lg" className="w-full mb-4" isLoading={isLoading}>
                    Continue
                  </Button>
                </form>

                <div className="text-center space-y-3">
                  <p className="text-gray-500 text-sm">Didn't receive the code?</p>
                  <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="flex items-center gap-2 mx-auto text-sm text-[#D4AF37] hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                  <button
                    onClick={() => { setStep('signup'); setError(''); setOtp(['', '', '', '', '', '']); }}
                    className="block mx-auto text-sm text-gray-500 hover:text-gray-300"
                  >
                    ← Use a different email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}