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
            className="p-2 rounded-full dark:bg-white/10 light:bg-gray-200 hover:dark:bg-white/20 hover:light:bg-gray-300 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 dark:text-[#D4AF37] light:text-yellow-600" />
            ) : (
                <Moon className="w-5 h-5 dark:text-[#D4AF37] light:text-gray-700" />
            )}
        </button>
    );
}
