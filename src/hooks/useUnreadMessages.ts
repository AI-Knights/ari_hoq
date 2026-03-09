'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from './useWebSocket';
import { getAccessToken } from '../lib/tokenUtils';

export function useUnreadMessages() {
  const [hasUnread, setHasUnread] = useState(false);
  const { user } = useAuth();
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  // Fetch access token from cookie and build WebSocket URL
  useEffect(() => {
    if (!user?.id) {
      setWsUrl(null);
      return;
    }

    const buildWsUrl = async () => {
      const token = await getAccessToken();
      if (!token) {
        setWsUrl(null);
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 
        (typeof window !== 'undefined' && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1' 
          ? 'wss://dev.projectyard.top' 
          : 'ws://127.0.0.1:8000');
      
      setWsUrl(`${baseUrl}/ws/chat/?token=${token}`);
    };

    buildWsUrl();
  }, [user?.id]);

  const { client } = useWebSocket(wsUrl);

  const checkUnreadMessages = useCallback(async () => {
    if (!user) {
      setHasUnread(false);
      return;
    }

    try {
      const threads = await api.messages.threads();
      const totalUnread = Array.isArray(threads)
        ? threads.reduce((sum: number, thread: any) => sum + (thread.unread || 0), 0)
        : 0;
      setHasUnread(totalUnread > 0);
    } catch (error) {
      console.error('Failed to check unread messages:', error);
      setHasUnread(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkUnreadMessages();

      // Poll for updates every 30 seconds
      const interval = setInterval(checkUnreadMessages, 30000);

      // Listen for custom event when messages are marked as read
      const handleMessagesRead = () => {
        // Add small delay to let backend process read receipts
        setTimeout(() => {
          checkUnreadMessages();
        }, 300);
      };

      window.addEventListener('messagesRead', handleMessagesRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messagesRead', handleMessagesRead);
      };
    }
  }, [user, checkUnreadMessages]);

  // Listen to WebSocket messages globally for real-time updates
  useEffect(() => {
    if (!client || !user) return;

    const handleMessage = (data: any) => {
      try {
        if (data.type === 'chat_message') {
          const senderStr = String(data.sender_id || data.sender || '');
          // If message is from someone else, check for unread messages
          if (senderStr !== String(user.id)) {
            checkUnreadMessages();
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message in sidebar:', err);
      }
    };

    client.on('message', handleMessage);
    return () => client.off('message', handleMessage);
  }, [client, user, checkUnreadMessages]);

  return { hasUnread, refresh: checkUnreadMessages };
}

// Helper function to trigger refresh from anywhere
export function notifyMessagesRead() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('messagesRead'));
  }
}
