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
  const baseStyles = 'rounded-2xl overflow-hidden';
  const variants = {
    default: 'bg-[#11224a] border border-white/5',
    glass: 'bg-[#11224a]/60 backdrop-blur-md border border-white/10',
    interactive:
    'bg-[#11224a]/60 backdrop-blur-md border border-white/10 hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all cursor-pointer'
  };
  return (
    <motion.div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}>

      {children}
    </motion.div>);

}