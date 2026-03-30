'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

// Dynamically import Joyride to prevent "window is not defined" SSR errors
const Joyride = dynamic(() => import('react-joyride') as any, { ssr: false }) as any;

export function OnboardingTour() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [run, setRun] = useState(false);

    useEffect(() => {
        if (!user) return;
        if (typeof window === 'undefined') return;

        const hasCompletedLocal = localStorage.getItem(`tour_completed_${user.id}`);
        // Combine backend flag with local storage fallback
        const hasCompleted = user.has_completed_onboarding || hasCompletedLocal === 'true';
        const isDesktop = window.innerWidth >= 1024;

        if (!hasCompleted && isDesktop) {
            // Delay slightly to ensure UI is fully rendered
            const timer = setTimeout(() => setRun(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleJoyrideCallback = async (data: any) => {
        const { status } = data;
        const finishedStatuses = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            if (user) {
                localStorage.setItem(`tour_completed_${user.id}`, 'true');
                try {
                    // Lazy-load API to avoid circular deps if any, or just import
                    const { api } = await import('../../../src/lib/api');
                    await api.auth.completeOnboarding();
                } catch (e) {
                    console.error('Failed to save onboarding status to database', e);
                }
            }
            setRun(false);
        }
    };

    const steps: any[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div>
                    <h2 className="text-lg font-bold mb-2">Welcome to QuranPartners! 🎉</h2>
                    <p className="text-sm">Let\'s take a quick 1-minute tour to help you set up your study dashboard and find your ideal Hifz partner.</p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.tour-step-home',
            content: 'This is your Dashboard pane. It cleanly summarizes your active streak, upcoming messages, and overall availability status.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-hifz',
            content: 'Track every single Surah you\'ve memorized here. Accurate tracking helps the platform find the best matched study partner!',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-partner',
            content: 'Our matching algorithm lives here. Discover and connect with global brothers/sisters sharing similar study goals.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-friends',
            content: 'Manage an overview of your active study friendships and handle incoming connection requests.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-chat',
            content: 'Chat securely in real-time. Use the built-in video-calling tool to conduct secure practice sessions completely within the browser!',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-profile',
            content: 'Be sure to jump in here first! Set up your timezone and preferred study languages to appear correctly across the platform.',
            placement: 'right',
            disableBeacon: true,
        }
    ];

    const isDark = theme === 'dark';

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={true}
            scrollToFirstStep={true}
            showProgress={true}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#D4AF37',
                    backgroundColor: isDark ? '#1a1a4a' : '#ffffff',
                    textColor: isDark ? '#ffffff' : '#0A1A3A',
                    arrowColor: isDark ? '#1a1a4a' : '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.6)',
                },
                buttonNext: {
                    backgroundColor: '#D4AF37',
                    color: '#0A1A3A',
                    fontWeight: 'bold',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                },
                buttonBack: {
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(10,26,58,0.7)',
                    marginRight: '8px',
                },
                buttonSkip: {
                    color: isDark ? '#ff6b6b' : '#d32f2f',
                },
                tooltipContainer: {
                    textAlign: 'left',
                },
            }}
        />
    );
}
