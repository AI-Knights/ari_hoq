'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

interface PresenceContextType {
    onlineUsers: Record<string | number, boolean>;
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: {} });

export function PresenceProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Record<string | number, boolean>>({});

    const wsUrl = user?.id ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//127.0.0.1:8000/ws/status/?token=${localStorage.getItem('access_token')}` : null;
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
