'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

export function OnboardingTour() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [run, setRun] = useState(false);
    const [JoyrideComponent, setJoyrideComponent] = useState<any>(null);

    // Dynamically load Joyride only on the client side to avoid SSR "window is not defined"
    useEffect(() => {
        import('react-joyride').then((mod) => {
            const m = mod as any;
            setJoyrideComponent(() => m.default || m.Joyride || m);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!user) return;
        if (typeof window === 'undefined') return;

        const hasCompletedLocal = localStorage.getItem(`tour_completed_${user.id}`);
        // Check both backend flag (cross-device) AND localStorage (fast local check)
        const hasCompleted = user.has_completed_onboarding || hasCompletedLocal === 'true';
        const isDesktop = window.innerWidth >= 1024;

        if (!hasCompleted && isDesktop) {
            // Small delay to ensure the Sidebar is fully rendered before pointing at it
            const timer = setTimeout(() => setRun(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleJoyrideCallback = async (data: any) => {
        const { status } = data;
        const finishedStatuses = ['finished', 'skipped'];

        if (finishedStatuses.includes(status)) {
            setRun(false);
            if (user) {
                // Save locally first for instant effect
                localStorage.setItem(`tour_completed_${user.id}`, 'true');
                // Then persist to database for cross-device sync
                try {
                    await api.auth.completeOnboarding();
                } catch (e) {
                    // Fail silently — localStorage already covers local sessions
                }
            }
        }
    };

    const steps: any[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Welcome to QuranPartners! 🎉
                    </h2>
                    <p style={{ fontSize: '14px' }}>
                        Let's take a quick tour to help you get started and find your ideal Hifz partner.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.tour-step-home',
            content: 'This is your Dashboard. See your active streak, upcoming messages, and availability status at a glance.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-hifz',
            content: "Track every Surah you've memorized here. Accurate tracking helps us find your best-matched study partner!",
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-partner',
            content: 'Discover and connect with brothers/sisters around the world who share your memorization goals.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-friends',
            content: 'Manage your active study friendships and handle incoming connection requests here.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-chat',
            content: 'Chat securely in real-time and use the built-in video calling for live practice sessions.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-profile',
            content: 'Start here! Set your timezone and preferred study languages so partners can find you easily.',
            placement: 'right',
            disableBeacon: true,
        },
    ];

    // Don't render anything until Joyride JS is loaded on the client AND we want to run
    if (!JoyrideComponent || !run) return null;

    const isDark = theme === 'dark';
    const Joyride = JoyrideComponent;

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
                    overlayColor: 'rgba(0, 0, 0, 0.65)',
                    // Colors are overridden by .react-joyride__tooltip CSS in globals.css
                    // to properly use CSS variables for dark/light theme switching
                },
            }}
        />
    );
}
