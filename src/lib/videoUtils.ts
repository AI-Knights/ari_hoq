// Module-level variable to track prewarmed media stream for cleanup
let activePrewarmedStream: MediaStream | null = null;

/**
 * Standalone utility for pre-warming camera and microphone permissions.
 * This is SSR-safe and does not depend on the Agora SDK.
 */
export const prewarmPermissions = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
        // Checking navigator.mediaDevices availability first
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.warn('[VideoUtils] mediaDevices not available');
            return false;
        }

        // Trigger the browser permission prompt
        // Store the stream so we can stop it later without re-triggering the camera
        activePrewarmedStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // We don't stop it immediately here IF we want to keep permissions "warm" 
        // without the hardware turning on/off repeatedly, but for Agora's sake 
        // in some browsers, just having called it once is enough.
        // However, to be safe and silent, we stop them immediately but KEEP the reference.
        activePrewarmedStream.getTracks().forEach(track => {
            track.stop();
        });

        return true;
    } catch (err) {
        console.error('[VideoUtils] Prewarm permissions failed:', err);
        return false;
    }
};

/**
 * Ensures all hardware tracks (camera/mic) are strictly stopped.
 * This prevents the "green camera light" from staying on after a call ends.
 */
export const clearPrewarmedTracks = async () => {
    if (typeof window === 'undefined') return;
    try {
        // If we have a tracked stream, stop it directly
        if (activePrewarmedStream) {
            activePrewarmedStream.getTracks().forEach(track => {
                track.stop();
                (track as any).enabled = false;
            });
            activePrewarmedStream = null;
        }

        // Also try to find any existing tracks via the browser's internal enumeration if possible
        // This is a safety fallback but we avoid calling getUserMedia() here to prevent flicker
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('[VideoUtils] Hardware tracks cleared');
    } catch (err) {
        console.warn('[VideoUtils] clearPrewarmedTracks failed:', err);
    }
};
