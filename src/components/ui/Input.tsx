'use client';

import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
          <label className="block text-sm font-medium text-theme-text-secondary mb-1.5">
            {label}
          </label>
        }
        <div className="relative">
          {leftIcon &&
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary">
              {leftIcon}
            </div>
          }
          <input
            ref={ref}
            className={`
              w-full rounded-lg px-4 py-2.5
              bg-theme-input border border-theme-input text-theme-input
              focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            style={{
              backgroundColor: 'var(--theme-input-bg)',
              borderColor: error ? undefined : 'var(--theme-input-border)',
              color: 'var(--theme-input-text)'
            }}
            {...props} />

          {rightIcon &&
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-secondary">
              {rightIcon}
            </div>
          }
        </div>
        {error &&
          <div className="flex items-center mt-1 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        }
      </div>);

  }
);
Input.displayName = 'Input';