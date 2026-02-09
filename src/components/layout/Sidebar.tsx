'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Users,
  MessageCircle,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldAlert,
  Search,
  BookOpen
} from
  'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';

export function Sidebar() {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const links = [
    {
      to: '/dashboard',
      icon: Home,
      label: 'Home'
    },
    {
      to: '/hifz-journey',
      icon: BookOpen,
      label: 'Hifz Journey'
    },
    {
      to: '/find-partner',
      icon: Search,
      label: 'Find Partner'
    },
    {
      to: '/friends',
      icon: Users,
      label: 'Friends'
    },
    {
      to: '/chat',
      icon: MessageCircle,
      label: 'Chat'
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile'
    }];

  const adminLinks = [
    {
      to: '/admin',
      icon: Shield,
      label: 'Admin Dashboard'
    }];

  const modLinks = [
    {
      to: '/moderator',
      icon: ShieldAlert,
      label: 'Moderator Panel'
    }];

  const activeClass =
    'bg-[#D4AF37]/10 text-[#D4AF37] border-r-2 border-[#D4AF37]';
  const inactiveClass = 'text-gray-400 hover:text-white hover:bg-white/5';
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  const SidebarContent = () =>
    <div className="flex flex-col h-full bg-[#0A1A3A] border-r border-white/5">
      {/* Logo Area */}
      <div className="p-6 border-b border-white/5">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-3 w-full group">
          <div className="relative h-10 w-28 xs:h-12 xs:w-32 sm:h-14 sm:w-36 md:h-16 md:w-44">
            <Image
              src="/logo.png"
              alt="QuranPartners Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 375px) 112px, (max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
            />
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((link) =>
          <Link
            key={link.to}
            href={link.to}
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === link.to ? activeClass : inactiveClass}`}>

            <link.icon className="w-5 h-5 mr-3" />
            {link.label}
          </Link>
        )}

        {/* Role Based Links */}
        {user?.role === 'admin' &&
          <>
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminLinks.map((link) =>
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === link.to ? activeClass : inactiveClass}`}>

                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            )}
          </>
        }

        {(user?.role === 'moderator' || user?.role === 'admin') &&
          <>
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Moderation
              </p>
            </div>
            {modLinks.map((link) =>
              <Link
                key={link.to}
                href={link.to}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === link.to ? activeClass : inactiveClass}`}>

                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </Link>
            )}
          </>
        }
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/5 bg-[#0A1A3A]/50">
        <div className="flex items-center mb-4 px-2">
          <Avatar
            src={user?.avatar}
            fallback={user?.name?.charAt(0) || 'U'}
            size="sm" />

          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">

          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#0A1A3A] border-b border-white/5 flex items-center justify-between px-4 shadow-sm">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative h-10 w-28">
            <Image
              src="/logo.png"
              alt="QuranPartners Logo"
              fill
              className="object-contain"
              priority
              sizes="112px"
            />
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-white hover:bg-white/5 transition-colors">
          {isMobileOpen ?
            <X className="w-6 h-6" /> :
            <Menu className="w-6 h-6" />
          }
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen &&
          <>
            <motion.div
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 1
              }}
              exit={{
                opacity: 0
              }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />

            <motion.div
              initial={{
                x: -280
              }}
              animate={{
                x: 0
              }}
              exit={{
                x: -280
              }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200
              }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden shadow-2xl">

              <SidebarContent />
            </motion.div>
          </>
        }
      </AnimatePresence>
    </>);

}