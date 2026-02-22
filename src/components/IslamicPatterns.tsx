'use client';

import React from 'react';
import { motion } from 'framer-motion';
export function IslamicPatterns() {
  return (
    <div className="islamic-patterns fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Large rotating pattern - Top Right */}
      <motion.div
        className="absolute -top-20 -right-20 w-96 h-96 opacity-[0.03]"
        style={{ color: 'var(--theme-pattern-color, white)' }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: 'linear'
        }}>

        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 L61.8 38.2 L100 50 L61.8 61.8 L50 100 L38.2 61.8 L0 50 L38.2 38.2 Z" />
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1" />

          <rect
            x="35"
            y="35"
            width="30"
            height="30"
            transform="rotate(45 50 50)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1" />

        </svg>
      </motion.div>

      {/* Medium pattern - Bottom Left */}
      <motion.div
        className="absolute bottom-10 -left-10 w-64 h-64 opacity-[0.04] text-[#D4AF37]"
        animate={{
          rotate: -360
        }}
        transition={{
          duration: 150,
          repeat: Infinity,
          ease: 'linear'
        }}>

        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z" />
          <path
            d="M50 20 L70 50 L50 80 L30 50 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2" />

        </svg>
      </motion.div>

      {/* Small floating pattern - Middle Right */}
      <motion.div
        className="absolute top-1/3 right-10 w-32 h-32 opacity-[0.05]"
        style={{ color: 'var(--theme-pattern-color, white)' }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut'
        }}>

        <svg
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">

          <circle cx="50" cy="50" r="40" />
          <path d="M50 10 L85 85 L15 85 Z" />
          <path d="M50 90 L85 15 L15 15 Z" />
        </svg>
      </motion.div>
    </div>);

}