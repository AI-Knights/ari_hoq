'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Send,
  Video,
  MoreVertical,
  Phone,
  Paperclip,
  Smile } from
'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Avatar } from './ui/Avatar';
import { motion } from 'framer-motion';
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
    status: 'online' | 'offline';
  };
}
export function ChatInterface({ partner }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
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
  }]
  );
  const [newMessage, setNewMessage] = useState('');
  const [showZoomTimer, setShowZoomTimer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(scrollToBottom, [messages]);
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      senderId: 'me',
      timestamp: new Date(),
      status: 'sent'
    };
    setMessages([...messages, msg]);
    setNewMessage('');
    // Simulate reply
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
  };
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-[#11224a]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#11224a]/80">
        <div className="flex items-center gap-3">
          <Avatar
            src={partner.avatar}
            fallback={partner.name.charAt(0)}
            status={partner.status} />

          <div>
            <h3 className="font-bold text-white">{partner.name}</h3>
            <p className="text-xs text-gray-400">
              {partner.status === 'online' ?
              'Active now' :
              'Last seen recently'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showZoomTimer ?
          <div className="flex items-center gap-2 bg-[#D4AF37]/10 px-3 py-1.5 rounded-full border border-[#D4AF37]/30">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[#D4AF37] font-mono text-sm">38:42</span>
            </div> :

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Video className="w-4 h-4" />}
            onClick={() => setShowZoomTimer(true)}>

              Start Session
            </Button>
          }
          <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>

              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${isMe ? 'bg-[#D4AF37] text-[#0A1A3A] rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>

                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#0A1A3A]/60' : 'text-gray-400'}`}>

                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>);

        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#11224a]/80">
        <form onSubmit={handleSend} className="flex gap-2 items-center">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">

            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#0A1A3A]/50 border border-white/10 rounded-full px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]" />

          <button
            type="button"
            className="p-2 text-gray-400 hover:text-[#D4AF37] transition-colors">

            <Smile className="w-5 h-5" />
          </button>
          <Button
            type="submit"
            variant="primary"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={!newMessage.trim()}>

            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>);

}