'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatInterface } from '../components/ChatInterface';
import { Avatar } from '../components/ui/Avatar';
import { Search, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { usePresence } from '../contexts/PresenceContext';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '../hooks/useWebSocket';

interface ConversationThread {
  partner: {
    id: string | number;
    username: string;
    name?: string;
    avatar: string | null;
    status: 'online' | 'offline' | 'busy';
  };
  last_message: string;
  last_message_sender_id: string | number | null;
  timestamp: string;
  unread: number;
}

export function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { onlineUsers } = usePresence();

  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [notFriendTarget, setNotFriendTarget] = useState<string | null>(null);
  const activeThreadRef = useRef<ConversationThread | null>(null);
  const pendingReadsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    activeThreadRef.current = activeThread;
  }, [activeThread]);

  const loadThreads = useCallback(async () => {
    try {
      const [data, friendsData] = await Promise.all([
        api.messages.threads(),
        api.friends.list(),
      ]);
      setThreads(Array.isArray(data) ? data : []);

      // Build set of accepted friend IDs for the friendship guard
      const myId = user?.id;
      const friendships = Array.isArray(friendsData) ? friendsData : (friendsData?.results ?? []);
      const ids = new Set<string>();
      for (const f of friendships) {
        if (f.status === 'accepted') {
          if (String(f.user1?.id) !== String(myId)) ids.add(String(f.user1?.id));
          if (String(f.user2?.id) !== String(myId)) ids.add(String(f.user2?.id));
        }
      }
      setFriendIds(ids);
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (partnerId: string | number, currentOffset: number = 0) => {
    setIsLoadingMessages(true);
    try {
      const data = await api.messages.conversation(partnerId, 50, currentOffset);
      const newMessages = Array.isArray(data) ? data.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })) : [];

      if (currentOffset === 0) {
        setMessages(newMessages);
      } else {
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => String(m.id)));
          const uniqueNew = newMessages.filter(m => !existingIds.has(String(m.id)));
          return [...uniqueNew, ...prev];
        });
      }

      setHasMore(newMessages.length === 50);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const loadMoreMessages = async () => {
    if (!activeThread || isLoadingMessages || !hasMore) return;
    const nextOffset = offset + 50;
    setOffset(nextOffset);
    await loadMessages(activeThread.partner.id, nextOffset);
  };

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // WebSocket URL and Hook
  const wsUrl = user?.id ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//127.0.0.1:8000/ws/chat/?token=${localStorage.getItem('access_token')}` : null;
  const { sendMessage, client } = useWebSocket(wsUrl);

  // Global WebSocket Event Handling
  useEffect(() => {
    if (!client) return;

    const handleMessage = (data: any) => {
      try {
        if (data.type === 'read_receipt') {
          console.log(`[RECEIVER] 📩 Received read receipt from partner for message ID: ${data.message_id}`);
          setMessages(prev => {
            pendingReadsRef.current.add(String(data.message_id));
            return prev.map(msg => {
              if (String(msg.id) === String(data.message_id)) {
                return { ...msg, is_read: true };
              }
              return msg;
            });
          });
          if (data.partner_id) {
            setThreads(prev => prev.map(t =>
              String(t.partner.id) === String(data.partner_id) ? { ...t, unread: 0 } : t
            ));
          }
        } else if (data.message) {
          const newMsg = {
            ...data.message,
            timestamp: new Date(data.message.timestamp || Date.now())
          };

          if (pendingReadsRef.current.has(String(newMsg.id))) {
            newMsg.is_read = true;
            pendingReadsRef.current.delete(String(newMsg.id));
          }

          const msgPartnerId = String(newMsg.sender?.id || newMsg.sender_id || newMsg.sender) === String(user?.id)
            ? String(newMsg.recipient?.id || newMsg.recipient_id || newMsg.recipient)
            : String(newMsg.sender?.id || newMsg.sender_id || newMsg.sender);

          const currentActive = activeThreadRef.current;
          if (currentActive && String(currentActive.partner.id) === msgPartnerId) {
            setMessages(prev => {
              if (prev.some(m => String(m.id) === String(newMsg.id))) return prev;
              const isEchoFromMe = String(newMsg.sender?.id || newMsg.sender_id || newMsg.sender) === String(user?.id);
              if (isEchoFromMe) {
                const optimisticMatchIdx = prev.findIndex(m => String(m.id).startsWith('temp-') && m.content === newMsg.content);
                if (optimisticMatchIdx !== -1) {
                  const next = [...prev];
                  next[optimisticMatchIdx] = newMsg;
                  return next;
                }
              }
              return [...prev, newMsg];
            });

            if (String(newMsg.sender?.id || newMsg.sender_id || newMsg.sender) !== String(user?.id)) {
              if (client.readyState === WebSocket.OPEN) {
                client.send({
                  type: 'read_receipt',
                  message_id: newMsg.id
                });
              }
            }
          }

          setThreads(prev => {
            const threadExists = prev.some(t => String(t.partner.id) === msgPartnerId);
            if (!threadExists) {
              loadThreads();
              return prev;
            }
            return prev.map(t =>
              String(t.partner.id) === msgPartnerId
                ? {
                  ...t,
                  last_message: newMsg.content,
                  last_message_sender_id: newMsg.sender?.id || newMsg.sender_id || newMsg.sender,
                  unread: (newMsg.sender?.id || newMsg.sender_id || newMsg.sender) === user?.id
                    ? t.unread
                    : (activeThreadRef.current && String(activeThreadRef.current.partner.id) === msgPartnerId ? 0 : t.unread + 1)
                }
                : t
            );
          });
        }
      } catch (err) {
        console.error('[CHAT] ❌ Parse error:', err);
      }
    };

    client.on('message', handleMessage);
    return () => client.off('message', handleMessage);
  }, [client, user?.id, loadThreads]);

  // Load initial messages when active thread changes
  useEffect(() => {
    if (!activeThread) return;
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/chat?userId=${activeThread.partner.id}`);
    }
    setOffset(0);
    setHasMore(true);
    loadMessages(activeThread.partner.id, 0);

    // Send read receipts for any existing unread messages from this partner
    // We can do this by just sending a generic read ping if the thread had unread messages
    if (activeThread.unread > 0 && client?.readyState === WebSocket.OPEN) {
      // Find the last message id received from them (heuristically from the local unread count or just tell the server we read the thread)
      // Since our backend consumer expects a specific message_id to mark read, we'll let the loadMessages fetch handle it or we can loop through locally loaded messages.
      // Because `loadMessages` marks them read on the server via the API (`api.messages.getThread`), the server already knows they are read.
      // The issue is simply the other person's UI wasn't updating.
      // The API view `getThread` in backend SHOULD broadcast read receipts, but it currently might not.
      // We'll iterate through unread messages once they load and send WS read receipts for them.
    }
  }, [activeThread?.partner.id, loadMessages, client]);

  // Hook to send read receipts when messages load
  useEffect(() => {
    if (!activeThread || !user || !client) return;

    // Find messages from the partner that are marked unread locally
    const unreadFromPartner = messages.filter(
      m => String(m.sender?.id || m.sender_id || m.sender) !== String(user.id) && !m.is_read
    );

    unreadFromPartner.forEach(m => {
      if (client.readyState === WebSocket.OPEN) {
        console.log(`[SENDER] 📖 I opened the chat. Sending read signal for old unread message ${m.id} to backend...`);
        sendMessage({
          type: 'read_receipt',
          message_id: m.id
        });
      }
    });

    // Optimistically mark them as read locally so we don't send duplicate receipts
    if (unreadFromPartner.length > 0) {
      setMessages(prev => prev.map(m =>
        String(m.sender?.id || m.sender_id || m.sender) !== String(user.id) ? { ...m, is_read: true } : m
      ));
    }
  }, [messages, activeThread, user, client, sendMessage]);

  useEffect(() => {
    if (threads.length > 0 && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userIdParam = params.get('userId');
      if (userIdParam) {
        // Friendship guard: only open chat if the user is still a friend
        if (friendIds.size > 0 && !friendIds.has(userIdParam)) {
          setNotFriendTarget(userIdParam);
          return;
        }
        setNotFriendTarget(null);
        const targetThread = threads.find((t) => String(t.partner.id) === userIdParam);
        if (targetThread && !activeThread) {
          setActiveThread(targetThread);
        }
      }
    }
  }, [threads, friendIds, activeThread]);

  const handleSendMessage = async (content: string) => {
    if (!activeThread || !user) return;

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      content,
      sender: user,
      recipient: activeThread.partner,
      timestamp: new Date(),
      is_read: false
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setThreads(prev => prev.map(t =>
      t.partner.id === activeThread.partner.id
        ? { ...t, last_message: content, last_message_sender_id: user.id }
        : t
    ));

    try {
      if (client?.readyState === WebSocket.OPEN) {
        sendMessage({
          content,
          recipient_id: activeThread.partner.id
        });
      } else {
        // Fallback
        const rawMsg = await api.messages.send({ recipient_id: activeThread.partner.id, content });
        const newMsg = { ...rawMsg, timestamp: new Date(rawMsg.timestamp || Date.now()) };
        setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? newMsg : m));
      }
    } catch (err) {
      console.error('Failed to send message', err);
      // Remove optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    }
  };

  const handleDeleteChat = async () => {
    if (!activeThread) return;
    try {
      await api.messages.deleteChat(activeThread.partner.id);
      setActiveThread(null);
      loadThreads();
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleUnfriend = async () => {
    if (!activeThread) return;
    try {
      await api.friends.unfriend(activeThread.partner.id);
      setActiveThread(null);
      loadThreads();
    } catch (err) {
      console.error('Failed to unfriend:', err);
    }
  };

  const handleBlockUser = async () => {
    if (!activeThread) return;
    try {
      await api.friends.block(activeThread.partner.id);
      setActiveThread(null);
      loadThreads();
    } catch (err) {
      console.error('Failed to block:', err);
    }
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="flex-1 min-h-0 flex lg:grid lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Sidebar */}
        <div className={`${activeThread ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto h-full min-h-0 flex-col bg-theme-card border border-theme-border rounded-2xl overflow-hidden backdrop-blur-sm lg:col-span-1`}>
          <div className="p-4 border-b border-theme-border shrink-0">
            <h2 className="text-xl font-serif font-bold text-theme-text mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-theme-input border border-theme-input-border rounded-lg pl-9 pr-4 py-2 text-sm text-theme-text focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
              </div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center text-sm text-theme-text-secondary">
                No conversations yet. Find a partner to start chatting!
              </div>
            ) : (
              threads.map((thread) => {
                const isOnlineContext = onlineUsers[thread.partner.id];
                const currentStatus = isOnlineContext === true
                  ? 'online'
                  : (isOnlineContext === false
                    ? 'offline'
                    : thread.partner.status || 'offline');

                const isFriend = friendIds.has(String(thread.partner.id));

                return (
                  <button
                    key={thread.partner.id}
                    onClick={() => {
                      if (!isFriend) {
                        setActiveThread(null);
                        setNotFriendTarget(String(thread.partner.id));
                        return;
                      }
                      setNotFriendTarget(null);
                      setActiveThread(thread);
                      if (thread.unread > 0) {
                        setThreads(prev => prev.map(t =>
                          t.partner.id === thread.partner.id ? { ...t, unread: 0 } : t
                        ));
                      }
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-theme-bg-hover transition-colors text-left border-b border-theme-border ${activeThread?.partner.id === thread.partner.id ? 'bg-theme-bg-hover border-l-2 border-l-[#D4AF37]' : ''} ${!isFriend ? 'opacity-50' : ''}`}
                  >
                    <div
                      onClick={(e) => { e.stopPropagation(); router.push(`/u/${thread.partner.id}`); }}
                      className="shrink-0 relative z-10 hover:opacity-80 transition-opacity"
                      title="View Profile"
                    >
                      <Avatar
                        src={thread.partner.avatar || undefined}
                        fallback={(thread.partner.name || thread.partner.username || 'U').charAt(0)}
                        status={isFriend ? (currentStatus as any) : 'offline'}
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline mb-1">
                        <span
                          onClick={(e) => { e.stopPropagation(); router.push(`/u/${thread.partner.id}`); }}
                          className={`font-medium truncate relative z-10 hover:underline ${activeThread?.partner.id === thread.partner.id ? 'text-theme-text' : 'text-theme-text-secondary'}`}
                          title="View Profile"
                        >
                          {thread.partner.name || thread.partner.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-theme-muted shrink-0 ml-2">{formatTime(thread.timestamp)}</span>
                      </div>
                      <p className="text-sm text-theme-text-secondary truncate">
                        {thread.last_message_sender_id && String(thread.last_message_sender_id) === user?.id ? 'You: ' : ''}{thread.last_message}
                      </p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 bg-[#D4AF37] text-[#0A1A3A] text-xs font-bold rounded-full flex items-center justify-center">
                        {thread.unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${activeThread ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'} w-full lg:col-span-3 h-full min-h-0`}>
          {activeThread ? (() => {
            const isOnlineContext = onlineUsers[activeThread.partner.id];
            const activeStatus = isOnlineContext === true
              ? 'online'
              : (isOnlineContext === false
                ? 'offline'
                : activeThread.partner.status || 'offline');

            return (
              <ChatInterface
                partner={{
                  id: String(activeThread.partner.id),
                  name: activeThread.partner.name || activeThread.partner.username || 'Unknown User',
                  avatar: activeThread.partner.avatar || undefined,
                  status: activeStatus as any,
                }}
                existingMessages={messages}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
                onLoadMore={loadMoreMessages}
                hasMore={hasMore}
                onDeleteChat={handleDeleteChat}
                onUnfriend={handleUnfriend}
                onBlock={handleBlockUser}
                onProfile={() => router.push(`/u/${activeThread.partner.id}`)}
                onBack={() => {
                  setActiveThread(null);
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/chat');
                  }
                }}
              />
            );
          })() : notFriendTarget ? (
            <div className="h-full flex items-center justify-center bg-theme-card border border-theme-border rounded-2xl">
              <div className="text-center text-theme-text-secondary max-w-sm px-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
                <p className="text-xl font-serif font-bold mb-2 text-theme-text">Not Friends</p>
                <p className="text-sm mb-4">You are no longer friends with this person. Re-add them as a friend to continue chatting.</p>
                <button
                  onClick={() => router.push('/friends')}
                  className="text-[#D4AF37] text-sm font-medium hover:underline"
                >
                  Go to Friends →
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-theme-card border border-theme-border rounded-2xl">
              <div className="text-center text-theme-text-secondary">
                <p className="text-xl font-serif font-bold mb-2">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}