'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check localStorage for saved theme
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme;
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setTheme('dark');
            } else {
                setTheme('light');
            }
        }
    }, []);

    useEffect(() => {
        if (mounted && typeof window !== 'undefined') {
            localStorage.setItem('theme', theme);
            // Update document class for global theme styles
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    // Return a default context if used outside provider (for SSR)
    if (context === undefined) {
        return {
            theme: 'dark' as Theme,
            toggleTheme: () => { }
        };
    }
    return context;
}
