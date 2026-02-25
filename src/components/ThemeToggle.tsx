'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent rendering until mounted to avoid hydration mismatch
    if (!mounted) {
        return (
            <div className="p-2 w-9 h-9" aria-label="Loading theme toggle">
                {/* Placeholder with same size */}
            </div>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-theme-hover transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-theme-text-secondary hover:text-theme-text transition-colors" />
            ) : (
                <Moon className="w-5 h-5 text-theme-text-secondary hover:text-theme-text transition-colors" />
            )}
        </button>
    );
}
