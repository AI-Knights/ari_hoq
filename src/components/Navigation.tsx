'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'border-white/10 py-2 sm:py-3 md:py-4' : 'border-transparent py-3 sm:py-4 md:py-6'
        }`}
      style={{
        backgroundColor: `rgba(10, 26, 58, ${isScrolled ? 0.9 : 0})`,
        backdropFilter: isScrolled ? 'blur(10px)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Logo - Responsive sizing */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
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
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium whitespace-nowrap"
          >
            How it Works
          </button>
          <Link
            href="/about"
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium"
          >
            About
          </Link>
          <Link
            href="/auth"
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium"
          >
            Login
          </Link>
          <ThemeToggle />
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#D4AF37] hover:bg-[#b5952f] dark:text-[#0A1A3A] light:text-white px-4 lg:px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)] text-sm whitespace-nowrap"
          >
            Dashboard
          </button>
        </div>

        {/* Mobile Menu Button & Theme Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="dark:text-white light:text-gray-900 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -20
            }}
            transition={{
              duration: 0.2
            }}
            className="md:hidden absolute top-full left-0 right-0 dark:bg-[#0A1A3A]/95 light:bg-white/95 backdrop-blur-md border-b dark:border-white/10 light:border-gray-200 shadow-xl"
          >
            <div className="flex flex-col px-4 sm:px-6 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 py-3 text-left font-medium transition-colors border-b dark:border-white/5 light:border-gray-200"
              >
                How it Works
              </button>
              <Link
                href="/about"
                className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 py-3 font-medium transition-colors border-b dark:border-white/5 light:border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/auth"
                className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 py-3 font-medium transition-colors border-b dark:border-white/5 light:border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    router.push('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-[#D4AF37] hover:bg-[#b5952f] dark:text-[#0A1A3A] light:text-white px-6 py-3 rounded-full font-semibold w-full transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}