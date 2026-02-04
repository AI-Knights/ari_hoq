'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Globe } from './Globe';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden">
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

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight text-white">
            Connect with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">
              Quran Partners
            </span>{' '}
            <br />
            Worldwide
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed">
            Join a global community of seekers on the path of Quran
            memorization. Find your perfect partner, track progress, and grow
            together.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={() => router.push('/auth')}
              className="group bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A1A3A] px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center">

              Start Your Journey
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
              className="px-8 py-4 rounded-full font-medium text-white border border-white/20 hover:bg-white/10 transition-all backdrop-blur-sm">

              Learn More
            </button>
          </div>

          <div className="flex items-center space-x-4 pt-8 text-sm text-gray-400">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) =>
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gray-700 border-2 border-[#0A1A3A] flex items-center justify-center text-xs text-white overflow-hidden">

                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                    alt="User" />

                </div>
              )}
            </div>
            <p>Join 10,000+ memorizers today</p>
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
            className="absolute top-10 right-10 p-4 bg-[#0A1A3A]/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg shadow-xl max-w-[150px]"
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
              <span className="text-xs text-gray-300">New Match</span>
            </div>
            <p className="text-xs text-white">
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

        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-[#D4AF37] rounded-full"></div>
        </div>
      </motion.div>
    </section>);

}