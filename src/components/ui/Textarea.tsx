'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
interface TextareaProps extends
  React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        }
        <textarea
          ref={ref}
          className={`
            w-full bg-[#0A1A3A]/50 border border-white/10 rounded-lg px-4 py-2.5
            text-white placeholder-gray-500
            focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props} />

        {error &&
        <div className="flex items-center mt-1 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        }
      </div>);

  }
);
Textarea.displayName = 'Textarea';