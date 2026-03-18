'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Video,
  MoreVertical,
  Phone,
  Check,
  CheckCheck,
  User,
  UserMinus,
  Flag,
  BellOff,
  Trash,
  X,
  ArrowLeft,
  Search
} from
  'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DeleteChatModal } from './modals/DeleteChatModal';
import { ReportModal } from './modals/ReportModal';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}
interface ChatInterfaceProps {
  partner: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'offline' | 'busy';
  };
  existingMessages?: any[];
  onSendMessage?: (content: string) => Promise<void>;
  isLoadingMessages?: boolean;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  onDeleteChat?: (forBoth: boolean) => Promise<void>;
  onUnfriend?: () => Promise<void>;
  onBlock?: () => Promise<void>;
  onReport?: (data: { reason: string; reportType: string; severity: string; blockUser: boolean }) => Promise<void>;
  onBack?: () => void;
  onProfile?: () => void;
  onCallInitiate?: () => void;
  isFriend?: boolean;
  isBlocked?: boolean;
}
export function ChatInterface({
  partner,
  existingMessages,
  onSendMessage,
  isLoadingMessages,
  onLoadMore,
  hasMore,
  onDeleteChat,
  onUnfriend,
  onReport,
  onBlock,
  onBack,
  onProfile,
  onCallInitiate,
  isFriend = true,
  isBlocked = false
}: ChatInterfaceProps) {
  const defaultMessages: Message[] = [
    {
      id: '1',
      text: "Assalamu Alaikum! I see we're both working on Surah Al-Kahf.",
      senderId: 'partner',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read'
    },
    {
      id: '2',
      text: "Wa Alaikum Assalam! Yes, I'm just starting the first 10 verses. Would you like to practice together?",
      senderId: 'me',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read'
    }];

  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>(defaultMessages);

  useEffect(() => {
    if (existingMessages) {
      setMessages(
        existingMessages.map(m => {
          const mSenderId = m.sender?.id || m.sender_id || m.sender;
          return {
            id: String(m.id),
            text: m.content,
            senderId: String(mSenderId) === String(partner.id) ? 'partner' : 'me',
            timestamp: new Date(m.timestamp),
            status: m.is_read ? 'read' : 'sent',
          } as Message;
        })
      );
    }
  }, [existingMessages, partner.id]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmingUnfriend, setConfirmingUnfriend] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setConfirmingUnfriend(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevScrollHeightRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // With flex-col-reverse, the browser naturally anchors to the bottom.
    // We don't need manual scrollTop manipulation most of the time!
  }, [messages, isLoadingMessages]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    // In flex-col-reverse, scrolling to the older messages means scrolling to the TOP
    // However, because it's reversed, scrollTop goes negative in some browsers, or scrollHeight - clientHeight.
    // Let's use a simpler detection: if we are near the top border (which is the end of the scroll container in flex-col-reverse depending on browser).
    // Actually, in standard browsers, for flex-col-reverse, scrollTop = 0 is the BOTTOM, and scrolling UP decreases scrollTop to negative values.
    // A safer cross-browser way is just to check how close to the top edge we are.
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // In Chrome/Firefox with flex-col-reverse, scrollTop is negative when scrolling up.
    // So 0 is bottom. -scrollHeight + clientHeight is the top!
    const isAtTop = Math.abs(scrollTop) + clientHeight >= scrollHeight - 50;

    if (isAtTop && onLoadMore && hasMore && !isLoadingMessages) {
      prevScrollHeightRef.current = scrollHeight;
      await onLoadMore();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage.trim();
    setNewMessage('');

    if (onSendMessage) {
      // Real send via ChatPage
      await onSendMessage(content);
      // NOTE: We do not manually append to `messages` here,
      // ChatPage will pass down the new `existingMessages` list which triggers the useEffect above.
    } else {
      // Demo mode with mock reply
      const msg: Message = {
        id: Date.now().toString(),
        text: content,
        senderId: 'me',
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, msg]);
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: "That sounds great! Let's schedule a session.",
          senderId: 'partner',
          timestamp: new Date(),
          status: 'sent'
        };
        setMessages((prev) => [...prev, reply]);
      }, 2000);
    }
  };
  return (
    <div className="flex flex-col h-full min-h-0 bg-theme-bg-subtle lg:border border-theme-border lg:rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-theme-border flex justify-between items-center bg-theme-card">
        <div className="flex items-center gap-2 lg:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 -ml-1 text-theme-text-secondary hover:text-theme-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer hover:bg-theme-bg-hover p-1 -ml-1 rounded-lg transition-colors"
            onClick={onProfile}
          >
            <Avatar
              src={partner.avatar}
              fallback={(partner.name || 'U').charAt(0)}
              status={partner.status === 'online' ? 'online' : 'offline'}
            />
            <div>
              <h3 className="font-bold text-theme-text text-base lg:text-lg leading-tight hover:underline truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{partner.name}</h3>
              <p className="text-xs lg:text-sm text-theme-text-secondary">
                {partner.status === 'online' ? 'Online now' : 'Last seen recently'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          {isFriend && !isBlocked && (
            <Button
              variant="secondary"
              size="sm"
              className="px-2 lg:px-3"
              leftIcon={<Video className="w-4 h-4" />}
              onClick={onCallInitiate}>
              <span className="hidden lg:inline">Video Call</span>
            </Button>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-theme-bg-hover text-theme-text' : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-bg-hover'}`}>
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-theme-bg shadow-xl border border-theme-border rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-2">
                  <button
                    onClick={() => { setIsMenuOpen(false); if (onProfile) onProfile(); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-theme-text hover:bg-theme-bg-hover transition-colors text-left">
                    <User className="w-4 h-4 text-theme-text-secondary" />
                    View Profile
                  </button>
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsDeleteModalOpen(true); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-theme-text hover:bg-theme-bg-hover transition-colors text-left">
                    <Trash className="w-4 h-4 text-theme-text-secondary" />
                    Clear Chat
                  </button>

                  {/* Unfriend — two-step confirm */}
                  {confirmingUnfriend ? (
                    <div className="px-4 py-2.5 flex items-center gap-2 bg-red-500/10">
                      <span className="text-xs text-red-400 flex-1">Remove friend?</span>
                      <button
                        onClick={async () => { setIsMenuOpen(false); setConfirmingUnfriend(false); if (onUnfriend) await onUnfriend(); }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmingUnfriend(false)}
                        className="px-2 py-1 text-xs bg-theme-bg-hover text-theme-text-secondary rounded hover:bg-theme-border transition-colors">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingUnfriend(true)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left">
                      <UserMinus className="w-4 h-4" />
                      Unfriend
                    </button>
                  )}

                  {/* Report — Changed to open report modal */}
                  <button
                    onClick={() => { setIsMenuOpen(false); setIsReportModalOpen(true); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-yellow-500 hover:bg-yellow-500/10 transition-colors text-left">
                    <Flag className="w-4 h-4" />
                    Report User
                  </button>

                  {/* Simple Block (without report) */}
                  {confirmingBlock ? (
                    <div className="px-4 py-2.5 flex items-center gap-2 bg-red-500/10">
                      <span className="text-xs text-red-400 flex-1 font-medium">Block without reporting?</span>
                      <button
                        onClick={async () => { setIsMenuOpen(false); setConfirmingBlock(false); if (onBlock) await onBlock(); }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmingBlock(false)}
                        className="px-2 py-1 text-xs bg-theme-bg-hover text-theme-text-secondary rounded hover:bg-theme-border transition-colors">
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingBlock(true)}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left">
                      <BellOff className="w-4 h-4" />
                      Block User
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col-reverse custom-scrollbar"
      >
        {/* We reverse the array because flex-col-reverse renders bottom-up. The first element is pushed to the bottom. */}
        {/* But our array gives oldest at index 0, newest at N-1. So reversing it makes newest at index 0 (bottom). */}
        {[...messages].reverse().map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>

              <div
                className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm relative ${
                  isMe 
                    ? 'bg-[#D4AF37] text-[#0A1A3A] rounded-tr-none gold-glow' 
                    : 'bg-[#1a1a4a]/60 backdrop-blur-md border border-white/10 text-theme-text rounded-tl-none'
                }`}>

                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text.split(/(https?:\/\/[^\s]+)/g).map((part, i) => {
                    if (part.startsWith('http')) {
                      const isJitsi = part.includes('meet.jit.si') || part.includes('ffmuc.net');
                      if (isJitsi) {
                        return (
                          <div key={i} className="mt-3 mb-1 p-4 bg-[#0A1A3A]/80 border border-white/10 rounded-xl flex flex-col items-center gap-3 backdrop-blur-sm shadow-lg border-l-4 border-l-[#D4AF37]">
                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-full flex items-center justify-center">
                              <Video className="w-5 h-5 text-[#D4AF37]" />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-white text-xs mb-1 uppercase tracking-wider">Video Meeting Invitation</p>
                              <p className="text-white/60 text-[10px]">Click the button below to join the secure session</p>
                            </div>
                            <a
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center bg-[#D4AF37] text-[#0A1A3A] py-2.5 px-6 rounded-lg font-bold text-xs hover:bg-[#fce588] transition-all gold-glow shadow-md transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Join Now
                            </a>
                          </div>
                        );
                      }
                      return (
                        <a
                          key={i}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#D4AF37] font-medium hover:underline break-all"
                        >
                          {part}
                        </a>
                      );
                    }
                    
                    // Personalize invitation text for recipients
                    let displayPart = part;
                    const isJitsiMessage = msg.text.includes('meet.jit.si') || msg.text.includes('ffmuc.net');
                    if (!isMe && isJitsiMessage) {
                        displayPart = displayPart.replace("I've invited you", "You've been invited");
                    }
                    
                    return <span key={i}>{displayPart}</span>;
                  })}
                </div>
                <div
                  className={`mt-2 flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <p
                    className={`text-[10px] font-medium ${isMe ? 'text-[#0A1A3A]/60' : 'text-theme-text-muted'}`}>
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {isMe && (
                    <span className="ml-1 flex items-center">
                      {msg.status === 'read' ? (
                        <span className="flex items-center gap-1 bg-[#0A1A3A]/5 px-1.5 py-0.5 rounded-full">
                          <CheckCheck className="w-[12px] h-[12px] text-[#0A1A3A]/80" />
                          <span className="text-[9px] font-bold text-[#0A1A3A]/70 uppercase tracking-widest pt-[0.5px]">READ</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5">
                          <Check className="w-[12px] h-[12px] text-[#0A1A3A]/40" />
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>);

        })}
        {isLoadingMessages && onLoadMore && (
          <div className="flex justify-center py-4 w-full">
            <span className="text-sm text-[#D4AF37]/70">Loading older messages...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      {isFriend && !isBlocked ? (
        <div className="p-4 border-t border-theme-border bg-theme-card">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-theme-input border border-theme-border rounded-full px-4 py-2.5 text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" />

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${newMessage.trim()
                ? 'bg-[#D4AF37] text-[#0A1A3A] hover:bg-[#fce588] cursor-pointer'
                : 'bg-[#D4AF37]/20 text-[#D4AF37]/50 cursor-not-allowed'
                }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-6 border-t border-theme-border bg-theme-card backdrop-blur-md flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-12 h-12 bg-theme-bg-subtle rounded-full flex items-center justify-center mb-3">
            {isBlocked ? <BellOff className="w-6 h-6 text-red-500" /> : <UserMinus className="w-6 h-6 text-theme-text-secondary" />}
          </div>
          <p className="text-theme-text font-medium mb-1 truncate max-w-full">
            {isBlocked ? `You blocked ${partner.name}` : `You unfriended ${partner.name}`}
          </p>
          <p className="text-theme-text-muted text-xs mb-4">
            {isBlocked ? "You can't message each other while blocked." : "You can't message this user because you are not friends."}
          </p>
          <button
            onClick={() => router.push('/friends')}
            className="text-[#D4AF37] text-xs font-bold hover:underline py-2 px-4 rounded-lg bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 transition-all"
          >
            {isBlocked ? 'Manage Blocks →' : 'View Friendship Status →'}
          </button>
        </div>
      )}
      <DeleteChatModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={(forBoth) => onDeleteChat?.(forBoth)}
        partnerName={partner.name}
      />
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={async (data) => {
          if (onReport) await onReport(data);
        }}
        partnerName={partner.name}
      />
    </div>);
}