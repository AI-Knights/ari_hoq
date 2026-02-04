'use client';

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ChatInterface } from '../components/ChatInterface';
import { Avatar } from '../components/ui/Avatar';
import { Search } from 'lucide-react';
export function ChatPage() {
  const conversations = [
  {
    id: '1',
    name: 'Omar Farooq',
    lastMessage: "That sounds great! Let's schedule...",
    time: '2m ago',
    unread: 2,
    status: 'online' as const,
    active: true
  },
  {
    id: '2',
    name: 'Sarah Ahmed',
    lastMessage: 'Did you finish the revision?',
    time: '1h ago',
    unread: 0,
    status: 'offline' as const,
    active: false
  }];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-140px)] grid lg:grid-cols-4 gap-6">
        {/* Sidebar List */}
        <div className="hidden lg:flex flex-col bg-[#11224a]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xl font-serif font-bold text-white mb-4">
              Messages
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-[#0A1A3A]/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]" />

            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map((chat) =>
            <button
              key={chat.id}
              className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 ${chat.active ? 'bg-white/5 border-l-2 border-l-[#D4AF37]' : ''}`}>

                <Avatar
                src={undefined}
                fallback={chat.name.charAt(0)}
                status={chat.status} />

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <span
                    className={`font-medium truncate ${chat.active ? 'text-white' : 'text-gray-300'}`}>

                      {chat.name}
                    </span>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 &&
              <span className="w-5 h-5 bg-[#D4AF37] text-[#0A1A3A] text-xs font-bold rounded-full flex items-center justify-center">
                    {chat.unread}
                  </span>
              }
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <ChatInterface
            partner={{
              id: '1',
              name: 'Omar Farooq',
              status: 'online'
            }} />

        </div>
      </div>
    </DashboardLayout>);

}