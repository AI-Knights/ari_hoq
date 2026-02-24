'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatInterface } from '../components/ChatInterface';
import dynamic from 'next/dynamic';
import { Avatar } from '../components/ui/Avatar';
import { Search, Loader2, Video, PhoneOff, MicOff, CameraOff } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { usePresence } from '../contexts/PresenceContext';
import { useRouter } from 'next/navigation';
import { useWebSocket } from '../hooks/useWebSocket';
import { prewarmPermissions, clearPrewarmedTracks } from '../lib/videoUtils';

// VideoCall uses browser APIs — SSR must be disabled
const VideoCall = dynamic(
  () => import('../components/VideoCall').then(mod => mod.VideoCall),
  { ssr: false }
);

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

interface CallInfo {
  channelName: string;
  token: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerId: string;
}

// ── Deterministic channel name from two user IDs ──────────────────────────
function makeChannelName(idA: string | number, idB: string | number): string {
  const a = String(idA).replace(/\D/g, '').substring(0, 8);
  const b = String(idB).replace(/\D/g, '').substring(0, 8);
  const [first, second] = [a, b].sort();
  return `call${first}${second}`;
}

export function ChatPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { onlineUsers } = usePresence();

  // ── Chat state ────────────────────────────────────────────────────────────
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [activeThread, setActiveThread] = useState<ConversationThread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
  const [notFriendTarget, setNotFriendTarget] = useState<string | null>(null);

  // ── Video calling state ───────────────────────────────────────────────────
  const [incomingCall, setIncomingCall] = useState<{
    channelName: string; callerId: string; callerName: string; callerAvatar?: string;
  } | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallInfo | null>(null);
  const [outgoingStatus, setOutgoingStatus] = useState<'Calling...' | 'Ringing...'>('Calling...');
  const [activeCall, setActiveCall] = useState<(CallInfo & { autoJoin?: boolean }) | null>(null);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [remoteCameraOff, setRemoteCameraOff] = useState(false);

  // ── Ringtones ─────────────────────────────────────────────────────────────
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringbackRef = useRef<HTMLAudioElement | null>(null);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Standard ringback for caller (American)
    ringbackRef.current = new Audio('/ringtone.wav');
    ringbackRef.current.loop = true;
    // Distict melodic tone for receiver
    ringtoneRef.current = new Audio('/ringtone_receiver.mp3');
    ringtoneRef.current.loop = true;

    return () => {
      ringbackRef.current?.pause();
      ringtoneRef.current?.pause();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    };
  }, []);

  const stopRinging = useCallback(() => {
    ringtoneRef.current?.pause();
    if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    ringbackRef.current?.pause();
    if (ringbackRef.current) ringbackRef.current.currentTime = 0;
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  }, []);

  // ── Always-fresh refs (stale-closure safe for WS handlers) ───────────────
  const activeThreadRef = useRef<ConversationThread | null>(null);
  const threadsRef = useRef<ConversationThread[]>([]);
  const outgoingCallRef = useRef<CallInfo | null>(null);
  const pendingReadsRef = useRef<Set<string>>(new Set());

  useEffect(() => { activeThreadRef.current = activeThread; }, [activeThread]);
  useEffect(() => { threadsRef.current = threads; }, [threads]);
  useEffect(() => { outgoingCallRef.current = outgoingCall; }, [outgoingCall]);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadThreads = useCallback(async () => {
    try {
      const [data, friendsData] = await Promise.all([api.messages.threads(), api.friends.list()]);
      setThreads(Array.isArray(data) ? data : []);
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

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const getWsUrl = useCallback(() => {
    if (!user?.id || typeof window === 'undefined') return null;
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev.projectyard.top';
    apiUrl = apiUrl.replace(/\/+$/, '');
    if (apiUrl.endsWith('/api')) apiUrl = apiUrl.slice(0, -4);
    const wsBase = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    return `${wsBase}/ws/chat/?token=${localStorage.getItem('access_token')}`;
  }, [user?.id]);

  const { sendMessage, client } = useWebSocket(getWsUrl());

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

        } else if (data.type === 'incoming_call') {
          // If we are already busy, send busy signal
          if (activeCall || incomingCall || outgoingCall) {
            sendMessage({ type: 'call_busy', recipient_id: data.sender_id, channel_name: data.channel_name });
            return;
          }

          setIncomingCall({
            channelName: data.channel_name,
            callerId: String(data.sender_id),
            callerName: data.caller_info?.name || data.caller_info?.username || 'Unknown',
            callerAvatar: data.caller_info?.avatar || undefined,
          });

          // Play receiving ringtone
          ringtoneRef.current?.play().catch(e => console.warn('[Audio] Autoplay blocked:', e));

          // Reply with ringing signal
          sendMessage({ type: 'call_ringing', recipient_id: data.sender_id, channel_name: data.channel_name });

        } else if (data.type === 'call_ringing') {
          if (outgoingCallRef.current && outgoingCallRef.current.channelName === data.channel_name) {
            setOutgoingStatus('Ringing...');
            ringbackRef.current?.play().catch(e => console.warn('[Audio] Autoplay blocked:', e));
          }

        } else if (data.type === 'call_busy') {
          stopRinging();
          setOutgoingCall(null);
          alert(`${outgoingCallRef.current?.partnerName || 'User'} is busy on another call.`);

        } else if (data.type === 'call_accept') {
          stopRinging();
          // Callee accepted — caller mounts VideoCall with autoJoin
          if (outgoingCallRef.current) {
            setActiveCall({ ...outgoingCallRef.current, autoJoin: true });
          }
          setOutgoingCall(null);

        } else if (data.type === 'call_reject' || data.type === 'call_rejected' || data.type === 'call_missed' || data.type === 'call_cancelled') {
          stopRinging();
          clearPrewarmedTracks();
          setOutgoingCall(null);
          setIncomingCall(null);

        } else if (data.type === 'call_end') {
          stopRinging();
          clearPrewarmedTracks();
          setActiveCall(null);
          setOutgoingCall(null);
          setIncomingCall(null);
          setRemoteMuted(false);
          setRemoteCameraOff(false);

        } else if (data.type === 'user_muted') {
          setRemoteMuted(true);
        } else if (data.type === 'user_unmuted') {
          setRemoteMuted(false);
        } else if (data.type === 'camera_off') {
          setRemoteCameraOff(true);
        } else if (data.type === 'camera_on') {
          setRemoteCameraOff(false);

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
            return prev.map(t => String(t.partner.id) === msgPartnerId ? {
              ...t,
              last_message: newMsg.content,
              last_message_sender_id: senderStr,
              timestamp: newMsg.timestamp.toISOString(),
              unread: senderStr === String(user?.id) ? t.unread
                : (activeThreadRef.current && String(activeThreadRef.current.partner.id) === msgPartnerId ? 0 : t.unread + 1),
            } : t);
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
    }
  }, [messages, activeThread, user, client, sendMessage]);

  useEffect(() => {
    if (!threads.length || typeof window === 'undefined') return;
    const userId = new URLSearchParams(window.location.search).get('userId');
    if (!userId) return;
    if (friendIds.size > 0 && !friendIds.has(userId)) { setNotFriendTarget(userId); return; }
    setNotFriendTarget(null);
    const t = threads.find(t => String(t.partner.id) === userId);
    if (t && !activeThread) setActiveThread(t);
  }, [threads, friendIds, activeThread]);

  // ── Message handlers ──────────────────────────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!activeThread || !user) return;
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

  const handleDeleteChat = async () => {
    if (!activeThread) return;
    await api.messages.deleteChat(activeThread.partner.id);
    setActiveThread(null); loadThreads();
  };

  const handleUnfriend = async () => {
    if (!activeThread) return;
    await api.friends.unfriend(activeThread.partner.id);
    setActiveThread(null); loadThreads();
  };

  const handleBlockUser = async () => {
    if (!activeThread) return;
    await api.friends.block(activeThread.partner.id);
    setActiveThread(null); loadThreads();
  };

  // ── Call handlers ─────────────────────────────────────────────────────────
  const handleInitiateCall = async () => {
    if (!activeThread || !user || !client || client.readyState !== WebSocket.OPEN) return;

    try {
      // Start pre-warming immediately
      prewarmPermissions();

      const { channel_name } = await api.video.initiate(activeThread.partner.id);

      const callInfo: CallInfo = {
        channelName: channel_name,
        token: '', // Hook will fetch it
        partnerName: activeThread.partner.name || activeThread.partner.username || 'Partner',
        partnerAvatar: activeThread.partner.avatar || undefined,
        partnerId: String(activeThread.partner.id),
      };
      setOutgoingCall(callInfo);
      setOutgoingStatus('Calling...');

      // 60-second missed call timeout
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = setTimeout(() => {
        if (outgoingCallRef.current?.channelName === channel_name) {
          stopRinging();
          clearPrewarmedTracks();
          setOutgoingCall(null);
          api.video.end(channel_name, 'missed').catch(() => { });
        }
      }, 60000);

    } catch (err) {
      console.error('[ChatPage] Failed to initiate call:', err);
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Pre-warm permissions at the moment of acceptance (as requested)
      prewarmPermissions();
      await api.video.accept(incomingCall.channelName);
      stopRinging();
      // Immediately set active call with autoJoin: true
      // This click (user gesture) allows join() to run immediately.
      setActiveCall({
        channelName: incomingCall.channelName,
        token: '',
        partnerName: incomingCall.callerName,
        partnerAvatar: incomingCall.callerAvatar,
        partnerId: incomingCall.callerId,
        autoJoin: true,
      });
      sendMessage({
        type: 'call_accept',
        recipient_id: incomingCall.callerId,
        channel_name: incomingCall.channelName
      });
      setIncomingCall(null);
    } catch (err) {
      console.error('[ChatPage] Failed to accept call:', err);
    }
  };

  const handleEndCall = () => {
    const call = activeCall || outgoingCall;
    stopRinging();
    clearPrewarmedTracks();
    if (call && client?.readyState === WebSocket.OPEN) {
      sendMessage({ type: 'call_end', recipient_id: call.partnerId, channel_name: call.channelName });
    }
    setActiveCall(null);
    setOutgoingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;
    stopRinging();
    clearPrewarmedTracks();
    sendMessage({ type: 'call_reject', recipient_id: incomingCall.callerId, channel_name: incomingCall.channelName });
    setIncomingCall(null);
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

      {/* ── Outgoing call overlay (caller waiting) ──────────────── */}
      {outgoingCall && !activeCall && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1b3e] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <span className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/40 animate-ping" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#D4AF37]/60 bg-[#1a2f5e]">
                {outgoingCall.partnerAvatar
                  ? <img src={outgoingCall.partnerAvatar} alt="" className="w-full h-full object-cover" />
                  : <span className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">{(outgoingCall.partnerName || '?').charAt(0).toUpperCase()}</span>
                }
              </div>
            </div>
            <h3 className="text-2xl font-serif text-white font-bold mb-1">{outgoingCall.partnerName}</h3>
            <p className="text-gray-400 text-sm mb-8 animate-pulse">{outgoingStatus}</p>
            <button onClick={handleEndCall} className="w-16 h-16 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full flex items-center justify-center mx-auto text-white">
              <PhoneOff className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}

      {/* ── Active video call (both sides) ─────────────────────── */}
      {activeCall && (
        <VideoCall
          channelName={activeCall.channelName}
          partnerName={activeCall.partnerName}
          partnerAvatar={activeCall.partnerAvatar}
          autoJoin={activeCall.autoJoin}
          onCallEnd={handleEndCall}
          remoteMutedFromWs={remoteMuted}
          remoteCameraOffFromWs={remoteCameraOff}
          onMuteToggle={(isMuted) => {
            if (client?.readyState === WebSocket.OPEN) {
              sendMessage({ type: isMuted ? 'user_muted' : 'user_unmuted', recipient_id: activeCall.partnerId, channel_name: activeCall.channelName });
            }
          }}
          onCameraToggle={(isOff) => {
            if (client?.readyState === WebSocket.OPEN) {
              sendMessage({ type: isOff ? 'camera_off' : 'camera_on', recipient_id: activeCall.partnerId, channel_name: activeCall.channelName });
            }
          }}
        />
      )}

      {/* ── Incoming call modal ─────────────────────────────────── */}
      {incomingCall && !activeCall && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1b3e] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <span className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/40 animate-ping" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#D4AF37]/60 bg-[#1a2f5e]">
                {incomingCall.callerAvatar
                  ? <img src={incomingCall.callerAvatar} alt="" className="w-full h-full object-cover" />
                  : <span className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">{(incomingCall.callerName || '?').charAt(0).toUpperCase()}</span>
                }
              </div>
            </div>
            <h3 className="text-2xl font-serif text-white font-bold mb-1">{incomingCall.callerName}</h3>
            <p className="text-[#D4AF37] text-sm mb-8 tracking-wide">Incoming video call…</p>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <button onClick={handleRejectCall} className="w-16 h-16 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full flex items-center justify-center text-white"><PhoneOff className="w-7 h-7 rotate-135" /></button>
                <span className="text-xs text-gray-400">Decline</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <button onClick={handleAcceptCall} className="w-16 h-16 bg-green-600 hover:bg-green-700 active:scale-95 rounded-full flex items-center justify-center text-white"><Video className="w-7 h-7" /></button>
                <span className="text-xs text-gray-400">Accept</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat layout ─────────────────────────────────────────── */}
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
                const isOnline = onlineUsers[thread.partner.id];
                const status = isOnline === true ? 'online' : isOnline === false ? 'offline' : thread.partner.status ?? 'offline';
                const isFriend = friendIds.has(String(thread.partner.id));
                return (
                  <button
                    key={thread.partner.id}
                    onClick={() => {
                      if (!isFriend) { setNotFriendTarget(String(thread.partner.id)); return; }
                      setNotFriendTarget(null); setActiveThread(thread);
                      if (thread.unread > 0) setThreads(prev => prev.map(t => t.partner.id === thread.partner.id ? { ...t, unread: 0 } : t));
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
                  status: (onlineUsers[activeThread.partner.id] === true ? 'online' : 'offline') as any,
                }}
                existingMessages={messages}
                onSendMessage={handleSendMessage}
                isLoadingMessages={isLoadingMessages}
                onLoadMore={loadMoreMessages}
                hasMore={hasMore}
                onDeleteChat={handleDeleteChat}
                onUnfriend={handleUnfriend}
                onBlock={handleBlockUser}
                onCallInitiate={handleInitiateCall}
                onProfile={() => router.push(`/u/${activeThread.partner.id}`)}
                onBack={() => {
                  setActiveThread(null);
                  if (typeof window !== 'undefined') window.history.replaceState({}, '', '/chat');
                }}
              />
            ) : notFriendTarget ? (
              <div className="h-full flex items-center justify-center bg-theme-card border border-theme-border lg:rounded-2xl">
                <div className="text-center px-6">
                  <p className="text-xl font-serif font-bold mb-2">Not Friends</p>
                  <p className="text-sm text-theme-text-secondary mb-4">Re-add them to chat.</p>
                  <button onClick={() => router.push('/friends')} className="text-[#D4AF37] text-sm hover:underline">Go to Friends →</button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-theme-card border border-theme-border lg:rounded-2xl">
                <p className="text-xl font-serif font-bold text-theme-text-secondary">Select a conversation</p>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </div>
  );
}
