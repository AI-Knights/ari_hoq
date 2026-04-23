'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
};

/**
 * Password field with a built-in show/hide toggle.
 * Drop-in replacement for <Input type="password" ... />
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const [show, setShow] = useState(false);

    const toggle = (e: React.MouseEvent) => {
      e.preventDefault();       // avoid form submission if inside a form
      e.stopPropagation();
      setShow((v) => !v);
    };

    const EyeIcon = (
      <button
        type="button"
        onClick={toggle}
        className="text-theme-text-secondary hover:text-theme-text transition-colors focus:outline-none"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    );

    return (
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        label={label}
        error={error}
        rightIcon={EyeIcon}
        className={className}
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
