'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  // Helper function to determine if a link is active
  const isActive = (path: string) => pathname === path;

  // Base link styles
  const getLinkClass = (path: string) => {
    return `transition-colors text-sm font-medium ${isActive(path)
      ? 'text-[#D4AF37]'
      : 'text-theme-text-secondary hover:text-[#D4AF37]'
      }`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (pathname !== '/') {
      router.push(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      // Need a small timeout if just mounted, but since we are already on '/', it's immediate
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
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
          <a href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative z-10">
            <div className="relative h-10 w-28 xs:h-12 xs:w-32 sm:h-14 sm:w-36 md:h-16 md:w-44">
              <Image
                src={theme === 'light' ? '/logo-dark.png' : '/logo.png'}
                alt="QuranPartners Logo"
                fill
                className="object-contain pointer-events-none"
                priority
                sizes="(max-width: 375px) 112px, (max-width: 640px) 128px, (max-width: 768px) 144px, 176px"
              />
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-colors text-sm font-medium whitespace-nowrap text-theme-text-secondary hover:text-[#D4AF37]`}
            >
              How it Works
            </button>
            <Link href="/about" className={getLinkClass('/about')}>
              About
            </Link>

            {/* Login link — only when NOT signed in */}
            {!user && (
              <Link href="/auth" className={getLinkClass('/auth')}>
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
      </motion.nav>

      {/* Extracted Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-theme-card border-l border-theme-border shadow-2xl z-[101] md:hidden overflow-y-auto flex flex-col"
              style={{ position: 'fixed' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-theme-border">
                <span className="font-semibold text-lg text-theme-text">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg text-theme-text hover:bg-theme-hover transition-colors" aria-label="Close mobile menu">
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col p-4 space-y-2">
                <button onClick={() => scrollToSection('how-it-works')} className="text-theme-text-secondary hover:text-[#D4AF37] py-3 px-2 text-left rounded-lg hover:bg-theme-hover transition-colors block w-full">
                  How it Works
                </button>
                <Link href="/about" className={`${isActive('/about') ? 'text-[#D4AF37]' : 'text-theme-text-secondary hover:text-[#D4AF37]'} py-3 px-2 rounded-lg hover:bg-theme-hover transition-colors block`} onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </Link>

                {/* Login — only when NOT signed in */}
                {!user && (
                  <Link href="/auth" className={`${isActive('/auth') ? 'text-[#D4AF37]' : 'text-theme-text-secondary hover:text-[#D4AF37]'} py-3 px-2 rounded-lg hover:bg-theme-hover transition-colors block`} onClick={() => setIsMobileMenuOpen(false)}>
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
    </>
  );
}