'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const router = useRouter();
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 40
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-theme-bg-elevated to-theme-bg border border-[#D4AF37]/30 p-8 md:p-16 text-center max-w-5xl mx-auto">

          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-theme-text mb-6">
              Begin Your Memorization Journey Today
            </h2>
            <p className="text-theme-text-secondary text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of students worldwide. Find your partner, stay
              consistent, and achieve your hifz goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mb-6 justify-center">
              <button
                onClick={() => router.push('/auth')}
                className="bg-[#D4AF37] hover:bg-[#b5952f] text-[#0A1A3A] px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center whitespace-nowrap">

                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <a
                href="https://discord.gg/HXTbFhhm"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full font-medium text-theme-text border border-theme-border hover:bg-theme-bg-hover transition-all text-center">

                Join Global Community
              </a>
            </div>

            <p className="text-sm text-theme-text-muted">
              Free to join. Connect with partners in minutes. No credit card
              required.
            </p>
          </div>
        </motion.div>
      </div>
    </section>);

}