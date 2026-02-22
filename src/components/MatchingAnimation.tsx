'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from './Globe';
import { CheckCircle2 } from 'lucide-react';

interface MatchingAnimationProps {
  isMatching: boolean;
  onComplete: () => void;
}

export function MatchingAnimation({
  isMatching,
  onComplete
}: MatchingAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (isMatching) {
      setStage(1);
      const timer1 = setTimeout(() => setStage(2), 2000);
      const timer2 = setTimeout(() => setStage(3), 4000);
      const timer3 = setTimeout(() => {
        onComplete();
      }, 5500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      setStage(0);
    }
  }, [isMatching, onComplete]);

  if (!isMatching) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-theme-bg/95 backdrop-blur-md flex flex-col items-center justify-center"
    >
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        {/* Globe Container */}
        <motion.div
          animate={{
            scale: 1,
            opacity: 1
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Globe />
        </motion.div>

        {/* Text Overlay */}
        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
          <AnimatePresence mode="wait">
            {stage === 1 && (
              <motion.p
                key="1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-2xl font-serif text-theme-text"
              >
                Analyzing your preferences...
              </motion.p>
            )}
            {stage === 2 && (
              <motion.p
                key="2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-2xl font-serif text-theme-text"
              >
                Scanning global community...
              </motion.p>
            )}
            {stage === 3 && (
              <motion.p
                key="3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-2xl font-serif text-theme-text"
              >
                Finding compatible partners...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Scanning Effect Ring */}
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="absolute inset-0 border border-[#D4AF37]/30 rounded-full border-dashed"
        />
      </div>
    </motion.div>
  );
}