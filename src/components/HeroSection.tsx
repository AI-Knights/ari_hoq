'use client';

import React, { memo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from './Globe';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui/Avatar';
import { api } from '../lib/api';

export function HeroSection() {
  const { user } = useAuth();
  const router = useRouter();
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch authentic stats from the backend database
    const fetchStats = async () => {
      try {
        const data = await api.public.stats();
        if (data && typeof data.total_users === 'number') {
          setUserCount(data.total_users);
        }
      } catch (e) {
        console.error('Failed to fetch user stats', e);
      }
    };

    fetchStats();
    
    // Poll every 30 seconds for new users joining
    const interval = setInterval(fetchStats, 30000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 md:pt-40 lg:pt-48 overflow-hidden">
      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div
          initial={{
            opacity: 0,
            x: -50
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          transition={{
            duration: 1,
            ease: 'easeOut'
          }}
          className="text-left space-y-8">

          <div className="inline-block px-4 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 backdrop-blur-sm">
            <span className="text-[#D4AF37] text-sm font-medium tracking-wider uppercase">
              Global Community
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight text-theme-text">
            Connect with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
              Quran Partners
            </span>{' '}
            <br />
            Worldwide
          </h1>

          <p className="text-lg md:text-xl text-theme-text-secondary max-w-lg leading-relaxed">
            Join a global community of seekers on the path of Quran
            memorization. Find your perfect partner, track progress, and grow
            together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => router.push(user ? '/dashboard' : '/auth?tab=signup')}
              className="group bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A1A3A] px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center">

              {user ? 'Go to Dashboard' : 'Start Your Journey'}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                const element = document.getElementById('how-it-works');
                if (element)
                  element.scrollIntoView({
                    behavior: 'smooth'
                  });
              }}
              className="px-8 py-4 rounded-full font-medium text-theme-text border border-theme-subtle hover:bg-theme-hover transition-all backdrop-blur-sm">

              Learn More
            </button>
          </div>

          <div className="pt-8 text-sm text-theme-text-secondary">
            <p>Join <span className="font-bold text-[#D4AF37] transition-all duration-500">{userCount !== null ? userCount.toLocaleString() : '...'}</span> memorizers today</p>
          </div>


        </motion.div>

        {/* Globe Visualization */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            duration: 1.5,
            delay: 0.2
          }}
          className="relative flex justify-center items-center">

          <Globe />

          {/* Floating decorative elements around globe */}
          <motion.div
            className="absolute top-10 right-10 p-4 bg-theme-card/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg shadow-theme max-w-[150px]"
            initial={{
              y: 20,
              opacity: 0
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            transition={{
              delay: 1.5,
              duration: 0.8
            }}>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-theme-text-secondary">
                New Match
              </span>
            </div>
            <p className="text-xs text-theme-text">
              Ahmed matched with Omar in London
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}>

        <div className="w-6 h-10 border-2 border-theme-border rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-[#D4AF37] rounded-full"></div>
        </div>
      </motion.div>
    </section>);

}