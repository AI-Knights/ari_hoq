type WebSocketEvent = 'open' | 'close' | 'error' | 'message';
type WebSocketCallback = (data?: any) => void;

export class WebSocketClient {
    private url: string;
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectDelay = 30000;
    private heartbeatInterval = 30000;
    private heartbeatTimer?: NodeJS.Timeout;
    private reconnectTimer?: NodeJS.Timeout;
    private listeners: Map<WebSocketEvent, Set<WebSocketCallback>> = new Map();
    private isIntentionallyClosed = false;

    constructor(url: string) {
        this.url = url;
    }

    public connect() {
        this.isIntentionallyClosed = false;
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log(`[WS] 🟢 Connected to ${this.url}`);
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.emit('open');
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emit('message', data);
            } catch (err) {
                console.error('[WS] ❌ Failed to parse message:', err);
            }
        };

        this.socket.onclose = (event) => {
            this.stopHeartbeat();
            if (!this.isIntentionallyClosed) {
                console.log(`[WS] 🛑 Disconnected (Code: ${event.code}). Reconnecting...`);
                this.emit('close', event);
                this.scheduleReconnect();
            }
        };

        this.socket.onerror = (error) => {
            console.warn(`[WS] ⚠️ Connection error on ${this.url}:`, error);
            // Some browsers don't provide error details in the error object
            if (this.socket?.readyState === WebSocket.CLOSED) {
                console.warn('[WS] ❌ Connection failed (ReadyState: CLOSED)');
            }
            this.emit('error', error);
        };
    }

    public send(data: any) {
        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('[WS] ⚠️ Attempted to send message while socket is not OPEN');
        }
    }

    public close() {
        this.isIntentionallyClosed = true;
        this.stopHeartbeat();
        clearTimeout(this.reconnectTimer);
        if (this.socket) {
            this.socket.onclose = null; // Prevent onclose from triggering reconnect
            this.socket.close();
        }
    }

    public on(event: WebSocketEvent, callback: WebSocketCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    public off(event: WebSocketEvent, callback: WebSocketCallback) {
        this.listeners.get(event)?.delete(callback);
    }

    public get readyState() {
        return this.socket?.readyState ?? WebSocket.CLOSED;
    }

    private emit(event: WebSocketEvent, data?: any) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'ping' }));
            }
        }, this.heartbeatInterval);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
        }
    }

    private scheduleReconnect() {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
        console.log(`[WS] 🔄 Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts + 1})`);

        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }
}
