'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { getAccessToken } from '../lib/tokenUtils';

interface PresenceContextType {
    onlineUsers: Record<string | number, boolean>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: {} });

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Record<string | number, boolean>>({});
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

            const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            apiUrl = apiUrl.replace(/\/+$/, '').replace('http://', '').replace('https://', '');
            setWsUrl(`${protocol}//${apiUrl}/ws/status/?token=${token}`);
        };

        buildWsUrl();
    }, [user?.id]);

    const { client } = useWebSocket(wsUrl);

    useEffect(() => {
        if (!client) {
            setOnlineUsers({});
            return;
        }

        const handleMessage = (data: any) => {
            if (data.type === 'status_update' && data.user_id) {
                setOnlineUsers(prev => ({
                    ...prev,
                    [data.user_id]: data.status === 'online'
                }));
            }
        };

        client.on('message', handleMessage);
        return () => client.off('message', handleMessage);
    }, [client]);

    return (
        <PresenceContext.Provider value={{ onlineUsers }}>
            {children}
        </PresenceContext.Provider>
    );
}

export const usePresence = () => useContext(PresenceContext);
