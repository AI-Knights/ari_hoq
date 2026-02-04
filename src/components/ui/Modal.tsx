'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop */}
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
          onClick={onClose}
          className="fixed inset-0 z-50 bg-[#0A1A3A]/80 backdrop-blur-sm flex items-center justify-center p-4">

            {/* Modal Content */}
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${maxWidths[maxWidth]} bg-[#11224a] border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden`}>

              <div className="flex items-center justify-between p-6 border-b border-white/5">
                {title &&
              <h3 className="text-xl font-serif font-bold text-white">
                    {title}
                  </h3>
              }
                <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5">

                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}