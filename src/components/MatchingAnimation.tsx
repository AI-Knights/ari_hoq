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
        setStage(4);
        setTimeout(onComplete, 1500);
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
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      className="fixed inset-0 z-50 bg-[#0A1A3A]/95 backdrop-blur-md flex flex-col items-center justify-center">

      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        {/* Globe Container */}
        <motion.div
          animate={{
            scale: stage === 4 ? 0.8 : 1,
            opacity: stage === 4 ? 0 : 1
          }}
          transition={{
            duration: 0.5
          }}
          className="absolute inset-0">

          <Globe />
        </motion.div>

        {/* Text Overlay */}
        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
          <AnimatePresence mode="wait">
            {stage === 1 &&
            <motion.p
              key="1"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              className="text-2xl font-serif text-white">

                Analyzing your preferences...
              </motion.p>
            }
            {stage === 2 &&
            <motion.p
              key="2"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              className="text-2xl font-serif text-white">

                Scanning global community...
              </motion.p>
            }
            {stage === 3 &&
            <motion.p
              key="3"
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -20
              }}
              className="text-2xl font-serif text-white">

                Finding compatible partners...
              </motion.p>
            }
            {stage === 4 &&
            <motion.div
              key="4"
              initial={{
                opacity: 0,
                scale: 0.5
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              className="flex flex-col items-center">

                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <p className="text-3xl font-serif font-bold text-white">
                  Match Found!
                </p>
              </motion.div>
            }
          </AnimatePresence>
        </div>

        {/* Scanning Effect Ring */}
        {stage < 4 &&
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: 'linear'
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
          className="absolute inset-0 border border-[#D4AF37]/30 rounded-full border-dashed" />

        }
      </div>
    </motion.div>);

}