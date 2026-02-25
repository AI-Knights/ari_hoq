import { usePresence } from '../contexts/PresenceContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Unified hook for determining user online/offline status.
 * 
 * Priority:
 * 1. WebSocket real-time status from PresenceContext (most accurate)
 * 2. Backend API status from user object (fallback)
 * 3. Privacy rules: Non-friends and blocked users always show as offline
 * 
 * This ensures consistent status display across all components.
 */
export function useUserStatus() {
  const { onlineUsers } = usePresence();
  const { user: currentUser } = useAuth();

  /**
   * Get the online status of a user
   * @param userId - The ID of the user to check
   * @param userObj - Optional user object with status field from API
   * @param isFriend - Whether the user is a friend (for privacy)
   * @param isBlocked - Whether there's a block between users
   * @returns 'online' | 'offline'
   */
  const getStatus = (
    userId: string | number,
    userObj?: { status?: string },
    isFriend: boolean = true,
    isBlocked: boolean = false
  ): 'online' | 'offline' => {
    // Privacy: Always show blocked users and non-friends as offline
    if (isBlocked || !isFriend) {
      return 'offline';
    }

    // Don't check status for yourself
    if (currentUser && String(userId) === String(currentUser.id)) {
      return 'online';
    }

    const userIdStr = String(userId);

    // Priority 1: WebSocket real-time status (most accurate)
    if (onlineUsers[userIdStr] !== undefined) {
      return onlineUsers[userIdStr] ? 'online' : 'offline';
    }

    // Priority 2: API status from user object (fallback)
    if (userObj?.status) {
      return userObj.status === 'online' ? 'online' : 'offline';
    }

    // Default: offline
    return 'offline';
  };

  /**
   * Check if a user is currently online
   */
  const isUserOnline = (
    userId: string | number,
    userObj?: { status?: string },
    isFriend: boolean = true,
    isBlocked: boolean = false
  ): boolean => {
    return getStatus(userId, userObj, isFriend, isBlocked) === 'online';
  };

  return {
    getStatus,
    isUserOnline,
    onlineUsers,
  };
}
