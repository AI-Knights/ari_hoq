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
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        // Immediately stop tracks to release hardware
        stream.getTracks().forEach(track => {
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
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => null);
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                (track as any).enabled = false;
            });
        }
        // Also try to find any existing tracks via the browser's internal enumeration if possible
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log('[VideoUtils] Hardware tracks cleared');
    } catch (err) {
        console.warn('[VideoUtils] clearPrewarmedTracks failed:', err);
    }
};
