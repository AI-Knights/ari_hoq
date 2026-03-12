'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatInterface } from '../components/ChatInterface';
import dynamic from 'next/dynamic';
import { Avatar } from '../components/ui/Avatar';
import { Search, Loader2, Video, PhoneOff, MicOff, CameraOff, MessageSquare } from 'lucide-react';
import { api, apiFetch } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useUserStatus } from '../hooks/useUserStatus';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '../hooks/useWebSocket';
import { notifyMessagesRead } from '../hooks/useUnreadMessages';
import { getAccessToken } from '../lib/tokenUtils';

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



// ── Deterministic channel name from two user IDs ──────────────────────────
function makeChannelName(idA: string | number, idB: string | number): string {
  const a = String(idA).replace(/\D/g, '').substring(0, 8);
  const b = String(idB).replace(/\D/g, '').substring(0, 8);
  const [first, second] = [a, b].sort();
  return `call${first}${second}`;
}

export function ChatPage({
  initialThreadsData,
  initialFriendsData,
  initialBlockedData
}: {
  initialThreadsData?: any,
  initialFriendsData?: any,
  initialBlockedData?: any
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { getStatus } = useUserStatus();

  // ── Chat state ────────────────────────────────────────────────────────────
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!initialThreadsData);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  // ── Always-fresh refs (stale-closure safe for WS handlers) ───────────────
  const activeThreadRef = useRef<ConversationThread | null>(null);
  const threadsRef = useRef<ConversationThread[]>([]);
  const pendingReadsRef = useRef<Set<string>>(new Set());

  useEffect(() => { activeThreadRef.current = activeThread; }, [activeThread]);

  // ── Data loading ──────────────────────────────────────────────────────────
  
  const processThreadsData = useCallback((data: any, friendsData: any, blockedData: any) => {
      setThreads(Array.isArray(data) ? data : []);
      const myId = user?.id;
      const friendships = Array.isArray(friendsData) ? friendsData : (friendsData?.results ?? []);
      const fIds = new Set<string>();
      for (const f of friendships) {
        if (f.status === 'accepted') {
          if (String(f.user1?.id) !== String(myId)) fIds.add(String(f.user1?.id));
          if (String(f.user2?.id) !== String(myId)) fIds.add(String(f.user2?.id));
        }
      }
      setFriendIds(fIds);

      const bIds = new Set<string>();
      const blocks = Array.isArray(blockedData) ? blockedData : (blockedData?.results ?? []);
      blocks.forEach((u: any) => bIds.add(String(u.id)));
      setBlockedIds(bIds);
  }, [user?.id]);

  const loadThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, friendsData, blockedData] = await Promise.all([
        api.messages.threads(),
        api.friends.list(),
        api.friends.listBlocked()
      ]);
      processThreadsData(data, friendsData, blockedData);
    } catch (err) {
      console.error('Failed to load threads', err);
    } finally {
      setIsLoading(false);
    }
  }, [processThreadsData]);

  const loadMessages = useCallback(async (partnerId: string | number, startOffset = 0) => {
    setIsLoadingMessages(true);
    try {
      const data = await api.messages.conversation(partnerId, 50, startOffset);
      const msgs = Array.isArray(data) ? data.map(m => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
      if (startOffset === 0) {
        setMessages(msgs);
      } else {
        setMessages(prev => {
          const ids = new Set(prev.map(m => String(m.id)));
          return [...msgs.filter(m => !ids.has(String(m.id))), ...prev];
        });
      }
      setHasMore(msgs.length === 50);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const loadMoreMessages = async () => {
    if (!activeThread || isLoadingMessages || !hasMore) return;
    const next = offset + 50;
    setOffset(next);
    await loadMessages(activeThread.partner.id, next);
  };

  useEffect(() => { 
    if (initialThreadsData || initialFriendsData || initialBlockedData) {
      processThreadsData(initialThreadsData || [], initialFriendsData || [], initialBlockedData || []);
    } else {
      loadThreads(); 
    }
  }, [initialThreadsData, initialFriendsData, initialBlockedData, processThreadsData, loadThreads]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const [wsUrl, setWsUrl] = useState<string | null>(null);

  // Fetch access token from cookie and build WebSocket URL
  useEffect(() => {
    if (!user?.id || typeof window === 'undefined') {
      setWsUrl(null);
      return;
    }

    const buildWsUrl = async () => {
      const token = await getAccessToken();
      if (!token) {
        setWsUrl(null);
        return;
      }

      let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      apiUrl = apiUrl.replace(/\/+$/, '');
      if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
      const wsBase = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
      setWsUrl(`${wsBase}/ws/chat/?token=${token}`);
    };

    buildWsUrl();
  }, [user?.id]);

  const { sendMessage, client } = useWebSocket(wsUrl);

  // ── WebSocket message handler ─────────────────────────────────────────────
  // NOTE: do NOT add track refs to deps — they are mutable refs (stable)
  useEffect(() => {
    if (!client) return;

    const handleMessage = (data: any) => {
      try {
        if (data.type === 'read_receipt') {
          const idsToRead = data.message_ids ? data.message_ids.map(String) : [String(data.message_id)];

          setMessages(prev => {
            idsToRead.forEach((id: string) => pendingReadsRef.current.add(id));
            return prev.map(msg => idsToRead.includes(String(msg.id)) ? { ...msg, is_read: true } : msg);
          });

          if (data.partner_id) {
            setThreads(prev => prev.map(t => String(t.partner.id) === String(data.partner_id) ? { ...t, unread: 0 } : t));
          }
        } else if (data.message) {
          const newMsg = { ...data.message, timestamp: new Date(data.message.timestamp || Date.now()) };
          if (pendingReadsRef.current.has(String(newMsg.id))) {
            newMsg.is_read = true;
            pendingReadsRef.current.delete(String(newMsg.id));
          }

          const senderStr = String(newMsg.sender?.id ?? newMsg.sender_id ?? newMsg.sender);
          const recipientStr = String(newMsg.recipient?.id ?? newMsg.recipient_id ?? newMsg.recipient);
          const msgPartnerId = senderStr === String(user?.id) ? recipientStr : senderStr;

          if (activeThreadRef.current && String(activeThreadRef.current.partner.id) === msgPartnerId) {
            setMessages(prev => {
              const exists = prev.some(m => String(m.id) === String(newMsg.id));
              if (exists) return prev;

              // If we have a temp_id match, replace the optimistic message
              if (data.temp_id) {
                const tempIndex = prev.findIndex(m => String(m.id) === String(data.temp_id));
                if (tempIndex !== -1) {
                  const next = [...prev];
                  next[tempIndex] = newMsg;
                  return next;
                }
              }

              return [...prev, newMsg];
            });

            if (senderStr !== String(user?.id) && client.readyState === WebSocket.OPEN) {
              sendMessage({ type: 'read_receipt', message_id: newMsg.id });
            }
          }

          setThreads(prev => {
            const exists = prev.some(t => String(t.partner.id) === msgPartnerId);
            if (!exists) { loadThreads(); return prev; }

            const updatedThreads = prev.map(t => String(t.partner.id) === msgPartnerId ? {
              ...t,
              last_message: newMsg.content,
              last_message_sender_id: senderStr,
              timestamp: newMsg.timestamp.toISOString(),
              unread: senderStr === String(user?.id) ? t.unread
                : (activeThreadRef.current && String(activeThreadRef.current.partner.id) === msgPartnerId ? 0 : t.unread + 1),
            } : t);

            // If unread count increased, notify sidebar
            if (senderStr !== String(user?.id) &&
              !(activeThreadRef.current && String(activeThreadRef.current.partner.id) === msgPartnerId)) {
              notifyMessagesRead();
            }

            return updatedThreads;
          });
        }
      } catch (err) {
        console.error('[CHAT] WS error:', err);
      }
    };

    client.on('message', handleMessage);
    return () => client.off('message', handleMessage);
  }, [client, user?.id, loadThreads, sendMessage]);

  // ── Active thread effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (!activeThread) return;
    if (typeof window !== 'undefined') window.history.replaceState({}, '', `/chat?userId=${activeThread.partner.id}`);
    setOffset(0); setHasMore(true);
    loadMessages(activeThread.partner.id, 0);
  }, [activeThread?.partner.id, loadMessages]);

  useEffect(() => {
    if (!activeThread || !user || !client || client.readyState !== WebSocket.OPEN) return;

    const unread = messages.filter(m =>
      String(m.sender?.id ?? m.sender_id ?? m.sender) !== String(user.id) &&
      !m.is_read &&
      !pendingReadsRef.current.has(String(m.id))
    );

    if (unread.length > 0) {
      const ids = unread.map(m => String(m.id));
      ids.forEach(id => pendingReadsRef.current.add(id));

      sendMessage({ type: 'read_receipt', message_ids: ids });

      setMessages(prev => prev.map(m =>
        ids.includes(String(m.id)) ? { ...m, is_read: true } : m
      ));

      // Notify that messages have been read
      notifyMessagesRead();
    }
  }, [messages, activeThread, user, client, sendMessage]);

  useEffect(() => {
    if (!threads.length || typeof window === 'undefined') return;
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (!userId) return;
    const t = threads.find(t => String(t.partner.id) === userId);
    if (t && !activeThread) setActiveThread(t);
  }, [threads, activeThread]);

  // ── Message handlers ──────────────────────────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!activeThread || !user) return;

    const partnerIdStr = String(activeThread.partner.id);
    const isFriend = friendIds.has(partnerIdStr);
    const isBlocked = blockedIds.has(partnerIdStr);

    if (!isFriend || isBlocked) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, content, sender: user, recipient: activeThread.partner, timestamp: new Date(), is_read: false };
    setMessages(prev => [...prev, optimistic]);
    setThreads(prev => prev.map(t => t.partner.id === activeThread.partner.id
      ? { ...t, last_message: content, last_message_sender_id: user.id, timestamp: new Date().toISOString() }
      : t));
    try {
      if (client?.readyState === WebSocket.OPEN) {
        sendMessage({ content, recipient_id: activeThread.partner.id, temp_id: tempId });
      } else {
        const raw = await api.messages.send({ recipient_id: activeThread.partner.id, content });
        setMessages(prev => prev.map(m => m.id === tempId ? { ...raw, timestamp: new Date(raw.timestamp || Date.now()) } : m));
      }
    } catch (err) {
      console.error('Send failed', err);
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  const handleDeleteChat = async (forBoth: boolean) => {
    if (!activeThread) return;
    try {
      await api.messages.deleteChat(activeThread.partner.id, forBoth);
      setMessages([]);
      loadThreads();
      setActiveThread(null);
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  };

  const handleUnfriend = async () => {
    if (!activeThread) return;
    try {
      await api.friends.unfriend(activeThread.partner.id);
      loadThreads();
    } catch (err) {
      console.error('Unfriend failed', err);
    }
  };

  const handleBlockUser = async () => {
    if (!activeThread) return;
    try {
      await api.friends.block(activeThread.partner.id);
      setActiveThread(null);
      loadThreads();
    } catch (err) {
      console.error('Block failed', err);
    }
  };

  const handleReportUser = async (data: { reason: string; reportType: string; severity: string; blockUser: boolean }) => {
    if (!activeThread) return;
    try {
      await api.friends.reportAndBlock({
        user_id: activeThread.partner.id,
        reason: data.reason,
        report_type: data.reportType,
        severity: data.severity,
        block_user: data.blockUser,
      });
      setActiveThread(null);
      loadThreads();
      // Could show a success toast here
    } catch (err: any) {
      console.error('Report failed', err);
      alert(err.message || 'Failed to submit report. Please try again.');
    }
  };

  // ── Call handlers ─────────────────────────────────────────────────────────
  // ── Call handlers ─────────────────────────────────────────────────────────
  const handleInitiateCall = async () => {
    if (!activeThread || !user) return;
    try {
      // Rather than starting a WebRTC session, we tell the backend to generate a Jitsi Room
      // and inject it as a message linking to the room.
      const threadId = activeThread.partner.id;
      const res = await apiFetch('/chat/meeting/', {
        method: 'POST',
        body: JSON.stringify({ thread_id: threadId })
      });
      // The backend handles injecting the message, the WS listener will naturally append it to the chat
    } catch (err: any) {
      console.error('[ChatPage] Failed to initiate Jitsi meeting:', err);
      alert(err.message || 'Failed to start meeting.');
    }
  };

  // ── Utilities ─────────────────────────────────────────────────────────────
  const formatTime = (ts: string) => {
    if (!ts) return '';
    const diffMins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full">
      <DashboardLayout isFullHeight={true}>
        <div className="flex-1 min-h-0 flex lg:grid lg:grid-cols-4 lg:gap-6 overflow-hidden">
          {/* Sidebar */}
          <div className={`${activeThread ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto h-full min-h-0 flex-col bg-theme-card lg:border border-theme-border lg:rounded-2xl overflow-hidden lg:col-span-1`}>
            <div className="p-4 border-b border-theme-border shrink-0">
              <h2 className="text-xl font-serif font-bold text-theme-text mb-4">Messages</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                <input type="text" placeholder="Search chats..." className="w-full bg-theme-input border border-theme-input-border rounded-lg pl-9 pr-4 py-2 text-sm text-theme-text focus:outline-none focus:border-[#D4AF37]" />
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" /></div>
              ) : threads.length === 0 ? (
                <p className="p-6 text-center text-sm text-theme-text-secondary">No conversations yet.</p>
              ) : threads.map(thread => {
                const isFriend = friendIds.has(String(thread.partner.id));
                const isBlocked = blockedIds.has(String(thread.partner.id));
                // Use unified status hook with friend and block awareness
                const status = getStatus(thread.partner.id, thread.partner, isFriend, isBlocked);
                return (
                  <button
                    key={thread.partner.id}
                    onClick={() => {
                      setActiveThread(thread);
                      if (thread.unread > 0) {
                        setThreads(prev => prev.map(t => t.partner.id === thread.partner.id ? { ...t, unread: 0 } : t));
                        // Notify sidebar to update unread indicator
                        notifyMessagesRead();
                      }
                    }}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-theme-bg-hover transition-colors text-left border-b border-theme-border ${activeThread?.partner.id === thread.partner.id ? 'bg-theme-bg-hover border-l-2 border-l-[#D4AF37]' : ''} ${!isFriend ? 'opacity-60' : ''}`}
                  >
                    <Avatar src={thread.partner.avatar || undefined} fallback={(thread.partner.name || thread.partner.username || 'U').charAt(0)} status={isFriend ? status as any : 'offline'} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-medium truncate text-theme-text text-sm">{thread.partner.name || thread.partner.username}</span>
                        <span className="text-xs text-theme-muted shrink-0 ml-2">{formatTime(thread.timestamp)}</span>
                      </div>
                      <p className="text-xs text-theme-text-secondary truncate">
                        {thread.last_message_sender_id && String(thread.last_message_sender_id) === String(user?.id) ? 'You: ' : ''}{thread.last_message}
                      </p>
                    </div>
                    {thread.unread > 0 && (
                      <span className="w-5 h-5 bg-[#D4AF37] text-[#0A1A3A] text-xs font-bold rounded-full flex items-center justify-center shrink-0">{thread.unread}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className={`${activeThread ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'} w-full lg:col-span-3 h-full min-h-0`}>
            {activeThread ? (
              <ChatInterface
                partner={{
                  id: String(activeThread.partner.id),
                  name: activeThread.partner.name || activeThread.partner.username || 'Unknown',
                  avatar: activeThread.partner.avatar || undefined,
                  status: getStatus(
                    activeThread.partner.id,
                    activeThread.partner,
                    friendIds.has(String(activeThread.partner.id)),
                    blockedIds.has(String(activeThread.partner.id))
                  ) as any,
                }}
                isFriend={friendIds.has(String(activeThread.partner.id))}
                isBlocked={blockedIds.has(String(activeThread.partner.id))}
                existingMessages={messages}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
                onLoadMore={loadMoreMessages}
                hasMore={hasMore}
                onDeleteChat={handleDeleteChat}
                onUnfriend={handleUnfriend}
                onBlock={handleBlockUser}
                onReport={handleReportUser}
                onCallInitiate={handleInitiateCall}
                onProfile={() => router.push(`/u/${activeThread.partner.id}`)}
                onBack={() => {
                  setActiveThread(null);
                  if (typeof window !== 'undefined') window.history.replaceState({}, '', '/chat');
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-theme-bg-subtle border border-theme-border lg:rounded-2xl backdrop-blur-sm">
                <div className="text-center px-6">
                  <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-theme-text mb-2">Your Conversations</h3>
                  <p className="text-theme-text-secondary max-w-xs mx-auto">Select a friend from the list to start a conversation or continue where you left off.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </div>
  );
}
