/**
 * Token utilities for cookie-based authentication.
 * 
 * Since httpOnly cookies cannot be read by JavaScript, we need to call
 * a server endpoint to get the access token when needed (e.g., for WebSocket URLs).
 */

/**
 * Fetches the access token from the server's httpOnly cookie.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/auth/token', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        return data.token || null;
    } catch (error) {
        console.error('Failed to fetch access token:', error);
        return null;
    }
}
