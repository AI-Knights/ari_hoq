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
