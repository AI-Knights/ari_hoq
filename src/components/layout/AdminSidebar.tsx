'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    Flag,
    Settings,
    LogOut,
    Menu,
    X,
    Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from '../ThemeToggle';

export function AdminSidebar() {
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/reports', icon: Flag, label: 'Reports' },
        { to: '/admin/settings', icon: Settings, label: 'Settings' }
    ];

    const activeClass = "bg-[#D4AF37]/10 text-[#D4AF37] border-r-2 border-[#D4AF37]";
    const inactiveClass = "text-theme-text-secondary hover:bg-theme-bg-hover hover:text-theme-text";

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full border-r border-theme-border transition-colors duration-300" style={{ backgroundColor: 'var(--theme-bg)' }}>
            {/* Logo Area */}
            <div className="p-6 border-b border-theme-border">
                <button onClick={() => router.push('/admin')} className="flex items-center gap-3 w-full group">
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
                {adminLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.to;

                    return (
                        <Link
                            key={link.to}
                            href={link.to}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive ? activeClass : inactiveClass}`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {link.label}
                        </Link>
                    );
                })}

                <div className="px-6 py-4 mt-4">
                    <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider">
                        User Site
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${inactiveClass}`}
                >
                    <Home className="w-5 h-5 mr-3" />
                    Exit to Dashboard
                </Link>
            </nav>

            {/* User Profile, Theme Toggle & Logout */}
            <div className="p-4 border-t border-theme-border bg-theme-subtle">
                <div className="flex items-center mb-3 px-2">
                    <Avatar
                        src={user?.avatar}
                        fallback={user?.name?.charAt(0) || 'U'}
                        size="sm" />

                    <div className="ml-3 overflow-hidden flex-1">
                        <p className="text-sm font-medium text-theme-text truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-theme-text-secondary truncate">{user?.email}</p>
                    </div>

                    {/* Theme Toggle next to user info */}
                    <ThemeToggle />
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">

                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-theme-border z-40 px-4 flex items-center justify-between" style={{ backgroundColor: 'var(--theme-bg)' }}>
                <button onClick={() => router.push('/admin')} className="flex items-center gap-2">
                    <div className="relative h-8 w-24">
                        <Image src="/logo.png" alt="QuranPartners" fill className="object-contain" priority />
                    </div>
                    <span className="text-xs font-bold text-[#D4AF37] uppercase">Admin</span>
                </button>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="p-2 text-theme-text hover:text-[#D4AF37] transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed inset-y-0 left-0 w-72 z-50 bg-theme-bg shadow-2xl"
                        >
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="absolute top-4 right-4 p-2 text-theme-text-secondary hover:text-theme-text bg-theme-hover rounded-full transition-colors z-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-40">
                <SidebarContent />
            </div>
        </>
    );
}
