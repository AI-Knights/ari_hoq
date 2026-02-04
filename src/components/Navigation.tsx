'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'border-white/10 py-4' : 'border-transparent py-6'}`}
      style={{
        backgroundColor: `rgba(10, 26, 58, ${isScrolled ? 0.9 : 0})`,
        backdropFilter: isScrolled ? 'blur(10px)' : 'none'
      }}>

      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold font-serif text-white tracking-wide">
            Quran<span className="text-[#D4AF37]">Partners</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium">

            How it Works
          </button>
          <Link
            href="/about"
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium">

            About
          </Link>
          <Link
            href="/auth"
            className="dark:text-gray-300 light:text-gray-700 hover:dark:text-white hover:light:text-gray-900 transition-colors text-sm font-medium">

            Login
          </Link>
          <ThemeToggle />
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#D4AF37] hover:bg-[#b5952f] dark:text-[#0A1A3A] light:text-white px-6 py-2 rounded-full font-semibold transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(212,175,55,0.3)]">

            Dashboard
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2">

            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          className="md:hidden absolute top-full left-0 right-0 bg-[#0A1A3A] border-b border-white/10 p-6 shadow-xl">

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-gray-300 hover:text-white py-2 text-left">

              How it Works
            </button>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setIsMobileMenuOpen(false)}>

              About
            </Link>
            <Link
              href="/auth"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setIsMobileMenuOpen(false)}>

              Login
            </Link>
            <button
              onClick={() => {
                router.push('/auth');
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#D4AF37] text-[#0A1A3A] px-6 py-3 rounded-full font-semibold w-full">

              Sign Up
            </button>
          </div>
        </motion.div>
      }
    </motion.nav>);

}