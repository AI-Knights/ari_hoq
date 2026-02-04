'use client';

import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    value: string;
    label: string;
  }[];
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label &&
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        }
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full bg-[#0A1A3A]/50 border border-white/10 rounded-lg px-4 py-2.5
              text-white appearance-none
              focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}>

            {options.map((option) =>
            <option
              key={option.value}
              value={option.value}
              className="bg-[#0A1A3A] text-white">

                {option.label}
              </option>
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
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
Select.displayName = 'Select';