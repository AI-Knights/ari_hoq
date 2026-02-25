'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export function Navigation() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'border-theme-border py-2 sm:py-3 md:py-4' : 'border-transparent py-3 sm:py-4 md:py-6'
        }`}
      style={{
        backgroundColor: isScrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative h-10 w-28 xs:h-12 xs:w-32 sm:h-14 sm:w-36 md:h-16 md:w-44">
            <Image
              src={theme === 'light' ? '/logo-dark.png' : '/logo.png'}
              alt="QuranPartners Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 375px) 112px, (max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-theme-text-secondary hover:text-theme-text transition-colors text-sm font-medium whitespace-nowrap"
          >
            How it Works
          </button>
          <Link href="/about" className="text-theme-text-secondary hover:text-theme-text transition-colors text-sm font-medium">
            About
          </Link>

          {/* Login link — only when NOT signed in */}
          {!user && (
            <Link href="/auth" className="text-theme-text-secondary hover:text-theme-text transition-colors text-sm font-medium">
              Login
            </Link>
          )}

          <ThemeToggle />

          <button
            onClick={() => router.push(user ? '/dashboard' : '/auth?tab=signup')}
            className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A1A3A] px-4 lg:px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)] text-sm whitespace-nowrap"
          >
            {user ? 'Dashboard' : 'Get Started'}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-theme-text p-2 hover:bg-theme-hover rounded-lg transition-colors"
            aria-label="Open mobile menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-theme-card border-l border-theme-border shadow-2xl z-50 md:hidden overflow-y-auto flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-theme-border">
                <span className="font-semibold text-lg text-theme-text">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg text-theme-text hover:bg-theme-hover transition-colors" aria-label="Close mobile menu">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col p-4 space-y-2">
                <button onClick={() => scrollToSection('how-it-works')} className="text-theme-text-secondary hover:text-theme-text py-3 px-2 text-left rounded-lg hover:bg-theme-hover transition-colors block w-full">
                  How it Works
                </button>
                <Link href="/about" className="text-theme-text-secondary hover:text-theme-text py-3 px-2 rounded-lg hover:bg-theme-hover transition-colors block" onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </Link>

                {/* Login — only when NOT signed in */}
                {!user && (
                  <Link href="/auth" className="text-theme-text-secondary hover:text-theme-text py-3 px-2 rounded-lg hover:bg-theme-hover transition-colors block" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                )}

                <div className="pt-4 mt-2 border-t border-theme-border">
                  <button
                    onClick={() => { router.push(user ? '/dashboard' : '/auth?tab=signup'); setIsMobileMenuOpen(false); }}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A1A3A] px-6 py-3 rounded-full font-semibold w-full shadow-lg transition-all"
                  >
                    {user ? 'Dashboard' : 'Get Started'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}