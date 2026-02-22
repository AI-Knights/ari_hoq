import { useEffect, useState, useCallback, useRef } from 'react';
import { WebSocketClient } from '../lib/websocket';

export function useWebSocket(url: string | null) {
    const [client, setClient] = useState<WebSocketClient | null>(null);
    const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
    const urlRef = useRef(url);

    // Keep track of readyState changes
    useEffect(() => {
        if (!client) return;

        const updateState = () => setReadyState(client.readyState);
        client.on('open', updateState);
        client.on('close', updateState);
        client.on('error', updateState);

        updateState();

        return () => {
            client.off('open', updateState);
            client.off('close', updateState);
            client.off('error', updateState);
        };
    }, [client]);

    useEffect(() => {
        if (!url) {
            setClient(null);
            setReadyState(WebSocket.CLOSED);
            return;
        }

        const newClient = new WebSocketClient(url);
        setClient(newClient);
        newClient.connect();

        return () => {
            newClient.close();
            setClient(null);
        };
    }, [url]);

    const sendMessage = useCallback((data: any) => {
        client?.send(data);
    }, [client]);

    return {
        sendMessage,
        client,
        readyState
    };
}
