import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'interactive';
}
export function Card({
  className = '',
  variant = 'default',
  children,
  ...props
}: CardProps) {
  const baseStyles =
    'rounded-2xl overflow-hidden transition-colors duration-300';
  const variants = {
    default: 'bg-theme-card border border-theme-border shadow-theme',
    glass:
      'bg-theme-card backdrop-blur-md border border-theme-subtle shadow-theme',
    interactive:
      'bg-theme-card backdrop-blur-md border border-theme-subtle hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all cursor-pointer shadow-theme'
  };
  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}>

      {children}
    </motion.div>);

}