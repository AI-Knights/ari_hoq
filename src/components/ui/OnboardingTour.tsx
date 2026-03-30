'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

// ─── Custom Tooltip Component ──────────────────────────────────────────────
// Using tooltipComponent prop gives us 100% control — Joyride's inline styles
// can't be overridden by CSS, so we render our own card entirely.
function TourTooltip({
    continuous,
    index,
    step,
    size,
    backProps,
    closeProps,
    skipProps,
    primaryProps,
    tooltipProps,
    isLastStep,
}: any) {
    const isDark = typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark');

    const card: React.CSSProperties = {
        backgroundColor: isDark ? '#11224a' : '#ffffff',
        color: isDark ? '#ffffff' : '#1a1a2e',
        border: `1px solid rgba(212, 175, 55, 0.3)`,
        borderRadius: '16px',
        boxShadow: isDark
            ? '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.1)'
            : '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,175,55,0.15)',
        padding: '24px',
        maxWidth: '340px',
        minWidth: '280px',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
    };

    const header: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
    };

    const stepBadge: React.CSSProperties = {
        fontSize: '11px',
        fontWeight: 600,
        color: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.12)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '999px',
        padding: '2px 10px',
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
    };

    const closeBtn: React.CSSProperties = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
        fontSize: '18px',
        lineHeight: 1,
        padding: '0 0 0 8px',
    };

    const content: React.CSSProperties = {
        fontSize: '14px',
        lineHeight: '1.65',
        color: isDark ? 'rgba(255,255,255,0.85)' : '#4b5563',
        textAlign: 'left',
        margin: '0 0 20px',
    };

    const footer: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
    };

    const skipBtnStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
        padding: '6px 0',
    };

    const backBtnStyle: React.CSSProperties = {
        background: 'none',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.7)' : '#374151',
        padding: '7px 16px',
        transition: 'opacity 0.15s',
    };

    const nextBtnStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #D4AF37 0%, #c49b27 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 700,
        color: '#0A1A3A',
        padding: '8px 20px',
        boxShadow: '0 2px 8px rgba(212, 175, 55, 0.35)',
        transition: 'opacity 0.15s, transform 0.15s',
    };

    const rightButtons: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    // Separator line between header badge and content
    const divider: React.CSSProperties = {
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        margin: '12px 0',
    };

    return (
        <div {...tooltipProps} style={card}>
            {/* Header row: step badge + close */}
            <div style={header}>
                <span style={stepBadge}>Step {index + 1} of {size}</span>
                <button {...closeProps} style={closeBtn} aria-label="Close tour">×</button>
            </div>

            <div style={divider} />

            {/* Main content */}
            <div style={content}>{step.content}</div>

            {/* Footer: skip left, back+next right */}
            <div style={footer}>
                {!isLastStep && (
                    <button {...skipProps} style={skipBtnStyle}>Skip tour</button>
                )}
                {isLastStep && <span />}

                <div style={rightButtons}>
                    {index > 0 && (
                        <button {...backProps} style={backBtnStyle}>Back</button>
                    )}
                    <button {...primaryProps} style={nextBtnStyle}>
                        {isLastStep ? 'Done ✓' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Tour Component ───────────────────────────────────────────────────
export function OnboardingTour() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [run, setRun] = useState(false);
    const [JoyrideComponent, setJoyrideComponent] = useState<any>(null);

    // Dynamically load Joyride only on the client side
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
        const hasCompleted = user.has_completed_onboarding || hasCompletedLocal === 'true';
        const isDesktop = window.innerWidth >= 1024;

        if (!hasCompleted && isDesktop) {
            const timer = setTimeout(() => setRun(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const handleJoyrideCallback = async (data: any) => {
        const { status } = data;
        if (['finished', 'skipped'].includes(status)) {
            setRun(false);
            if (user) {
                localStorage.setItem(`tour_completed_${user.id}`, 'true');
                try {
                    await api.auth.completeOnboarding();
                } catch (_) {}
            }
        }
    };

    const steps: any[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div>
                    <p style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                        Welcome to QuranPartners! 🎉
                    </p>
                    <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'inherit', opacity: 0.8 }}>
                        Let's take a quick tour so you know your way around the platform.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.tour-step-home',
            content: 'Your Dashboard — see your current streak, upcoming messages, and availability status at a glance.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-hifz',
            content: "Track every Surah you've memorized. Accurate progress helps us match you with the ideal study partner.",
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-partner',
            content: 'Discover brothers and sisters around the world who share your memorization goals and schedule.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-friends',
            content: 'Manage your study friendships and respond to incoming connection requests here.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-chat',
            content: 'Chat in real-time and use the built-in video calling for live recitation sessions.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-profile',
            content: 'Set up your profile first — timezone, language, and availability make you visible to partners.',
            placement: 'right',
            disableBeacon: true,
        },
    ];

    if (!JoyrideComponent || !run) return null;

    const Joyride = JoyrideComponent;

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous={true}
            showSkipButton={false}
            scrollToFirstStep={true}
            showProgress={false}
            disableScrolling={false}
            tooltipComponent={TourTooltip}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    overlayColor: 'rgba(0, 0, 0, 0.7)',
                    arrowColor: theme === 'dark' ? '#11224a' : '#ffffff',
                },
            }}
        />
    );
}
