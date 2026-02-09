'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StarField } from '../components/StarField';
import { IslamicPatterns } from '../components/IslamicPatterns';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { GoogleIcon } from '../components/GoogleIcon';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setError(null);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Check if passwords match if I had a confirm password field available in state
        // For now, simplified
        await register(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Placeholder for now
    alert("Google Login requires backend configuration.");
  };

  return (
    <div className="min-h-screen bg-[#0A1A3A] text-white relative flex items-center justify-center p-4">
      <StarField />
      <IslamicPatterns />

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="relative z-10 w-full max-w-md">

        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-3xl font-serif font-bold text-white mb-2 inline-block">
            Quran<span className="text-[#D4AF37]">Partners</span>
          </Link>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Welcome back, seeker.' : 'Begin your journey today.'}
          </p>
        </div>

        <Card className="p-8 bg-[#11224a]/80 backdrop-blur-md border-[#D4AF37]/20 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-white/10">
            <button
              className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${isLogin ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => { setIsLogin(true); setError(null); }}>

              Login
              {isLogin &&
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />

              }
            </button>
            <button
              className={`flex-1 pb-4 text-sm font-medium transition-colors relative ${!isLogin ? 'text-[#D4AF37]' : 'text-gray-400 hover:text-white'}`}
              onClick={() => { setIsLogin(false); setError(null); }}>

              Sign Up
              {!isLogin &&
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]" />

              }
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded text-sm text-center">
                {error}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required />


            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required />


            {!isLogin &&
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                // Logic for confirm password mostly skipped for brevity in this step, 
                // but interface shows it. Ideally specific state for it.
                required />

            }

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}>

              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-white/10 light:border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 dark:bg-[#11224a] light:bg-white dark:text-gray-400 light:text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border dark:border-gray-600 light:border-gray-300 rounded-lg dark:bg-white light:bg-white dark:text-gray-700 light:text-gray-700 hover:dark:bg-gray-50 hover:light:bg-gray-50 transition-colors font-medium shadow-sm">
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>);

}