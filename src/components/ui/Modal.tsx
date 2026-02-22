'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  // Close on escape key
  useEffect(() => {
    setMounted(true);
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
  if (!mounted) return null;

  return createPortal(
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
            className="fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-4 bg-theme-bg/80"
            style={{ backgroundColor: 'var(--theme-overlay, rgba(10, 26, 58, 0.4))' }}>

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
              className={`w-full ${maxWidths[maxWidth]} bg-theme-card border border-[#D4AF37]/20 rounded-2xl shadow-2xl overflow-hidden`}>

              <div className="flex items-center justify-between p-6 border-b border-theme-border">
                {title &&
                  <h3 className="text-xl font-serif font-bold text-theme-text">
                    {title}
                  </h3>
                }
                <button
                  onClick={onClose}
                  className="text-theme-text-secondary hover:text-theme-text transition-colors p-1 rounded-full hover:bg-theme-hover">

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
    </AnimatePresence>,
    document.body
  );
}