'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EVENTS, STATUS } from 'react-joyride';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../lib/api';

// ─── Null Beacon — hides the pulsing indicator entirely ───────────────────
const NullBeacon = () => null;

// ─── Custom Compact Tooltip ────────────────────────────────────────────────
function TourTooltip({
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
        backgroundColor: isDark ? '#0f1f45' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#1e293b',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: '12px',
        boxShadow: isDark
            ? '0 16px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.08)'
            : '0 8px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.12)',
        padding: '16px 18px 14px',
        maxWidth: '280px',
        minWidth: '220px',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
    };

    const topRow: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    };

    const progress: React.CSSProperties = {
        fontSize: '11px',
        fontWeight: 600,
        color: '#D4AF37',
        opacity: 0.85,
        letterSpacing: '0.04em',
    };

    const closeBtn: React.CSSProperties = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
        fontSize: '16px',
        lineHeight: 1,
        padding: '0',
        display: 'flex',
        alignItems: 'center',
    };

    const content: React.CSSProperties = {
        fontSize: '13px',
        lineHeight: '1.6',
        color: isDark ? 'rgba(241,245,249,0.82)' : '#475569',
        textAlign: 'left',
        margin: '0 0 14px',
    };

    const footer: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px',
    };

    const skipBtnStyle: React.CSSProperties = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
        padding: '4px 0',
    };

    const backBtnStyle: React.CSSProperties = {
        background: 'none',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        borderRadius: '7px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.6)' : '#475569',
        padding: '5px 12px',
    };

    const nextBtnStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #D4AF37 0%, #bf9b24 100%)',
        border: 'none',
        borderRadius: '7px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 700,
        color: '#0A1A3A',
        padding: '5px 14px',
        boxShadow: '0 2px 6px rgba(212,175,55,0.3)',
    };

    const rightBtns: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    return (
        <div {...tooltipProps} style={card}>
            {/* Top row: progress + close */}
            <div style={topRow}>
                <span style={progress}>{index + 1} / {size}</span>
                <button {...closeProps} style={closeBtn} title="" aria-label="Close">×</button>
            </div>

            {/* Content */}
            <div style={content}>{step.content}</div>

            {/* Footer */}
            <div style={footer}>
                {!isLastStep
                    ? <button {...skipProps} style={skipBtnStyle} title="">Skip</button>
                    : <span />
                }
                <div style={rightBtns}>
                    {index > 0 && (
                        <button {...backProps} style={backBtnStyle} title="">Back</button>
                    )}
                    <button {...primaryProps} style={nextBtnStyle} title="">
                        {isLastStep ? 'Done ✓' : 'Next →'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Tour Component ───────────────────────────────────────────────────
export function OnboardingTour() {
    const { user, updateUser } = useAuth();
    const { theme } = useTheme();
    const [run, setRun] = useState(false);
    const [JoyrideComponent, setJoyrideComponent] = useState<any>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        import('react-joyride').then((mod) => {
            const m = mod as any;
            setJoyrideComponent(() => m.default || m.Joyride || m);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!user) return;
        if (hasStarted.current) return;
        if (typeof window === 'undefined') return;

        const hasCompletedLocal = localStorage.getItem(`tour_completed_${user.id}`);
        const hasCompleted = user.has_completed_onboarding || hasCompletedLocal === 'true';
        const isDesktop = window.innerWidth >= 1024;

        if (!hasCompleted && isDesktop) {
            hasStarted.current = true;
            // Delay ensures DOM nodes are mounted
            const timer = setTimeout(() => setRun(true), 2000);
            return () => clearTimeout(timer);
        } else {
            hasStarted.current = true;
        }
    }, [user]);

    const handleJoyrideCallback = useCallback(async (data: any) => {
        const { status, type, action } = data;
        
        // React Joyride fires multiple events. The definitive end states are:
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
        const tourEnded = finishedStatuses.includes(status) || type === EVENTS.TOUR_END || action === 'close';

        if (tourEnded) {
            setRun(false); // Stop the tour visually immediately
            
            if (user && user.id) {
                // Set localStorage instantly
                localStorage.setItem(`tour_completed_${user.id}`, 'true');
                
                // Optimistically update React context
                updateUser({ has_completed_onboarding: true });

                try {
                    // Fire background API call
                    await api.auth.completeOnboarding();
                } catch (error) {
                    console.error('Failed to sync tour completion to server');
                }
            }
        }
    }, [user, updateUser]);

    const steps: any[] = [
        {
            target: 'body',
            placement: 'center',
            content: (
                <div>
                    <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                        Welcome to QuranPartners! 🎉
                    </p>
                    <p style={{ fontSize: '13px', lineHeight: '1.6', opacity: 0.8 }}>
                        Quick tour — learn the platform in under a minute.
                    </p>
                </div>
            ),
            disableBeacon: true,
        },
        {
            target: '.tour-step-home',
            content: 'Dashboard — your streak, messages, and availability at a glance.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-hifz',
            content: "Track every Surah you've memorized to get the best partner matches.",
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-partner',
            content: 'Find brothers/sisters worldwide who share your memorization goals.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-friends',
            content: 'Manage friendships and handle incoming connection requests.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-chat',
            content: 'Real-time chat and built-in video calling for live sessions.',
            placement: 'right',
            disableBeacon: true,
        },
        {
            target: '.tour-step-profile',
            content: 'Set your timezone and language first — it makes you discoverable.',
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
            scrollToFirstStep={false}
            showProgress={false}
            disableScrolling={true}
            tooltipComponent={TourTooltip}
            beaconComponent={NullBeacon}
            callback={handleJoyrideCallback}
            styles={{
                options: {
                    zIndex: 10000,
                    overlayColor: 'rgba(0, 0, 0, 0.6)',
                    arrowColor: theme === 'dark' ? '#0f1f45' : '#ffffff',
                },
            }}
        />
    );
}
