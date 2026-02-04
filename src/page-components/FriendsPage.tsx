'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FriendCard } from '../components/FriendCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Search, UserPlus } from 'lucide-react';
export function FriendsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const friends = [
  {
    id: '1',
    name: 'Omar Farooq',
    level: 'Intermediate',
    language: ['English', 'Arabic'],
    status: 'online' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar'
  },
  {
    id: '2',
    name: 'Sarah Ahmed',
    level: 'Advanced',
    language: ['English', 'Urdu'],
    status: 'offline' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: '3',
    name: 'Bilal Khan',
    level: 'Beginner',
    language: ['English'],
    status: 'busy' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bilal'
  }];

  const requests = [
  {
    id: '4',
    name: 'Yusuf Ali',
    level: 'Hafiz',
    language: ['Arabic'],
    status: 'online' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf'
  }];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            My Community
          </h1>
          <p className="text-gray-400">
            Manage your friends and study partners.
          </p>
        </div>
        <Button
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}>

          Add Friend
        </Button>
      </div>

      {/* Friend Requests */}
      {requests.length > 0 &&
      <div className="mb-12">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center">
            Pending Requests
            <span className="ml-2 bg-[#D4AF37] text-[#0A1A3A] text-xs px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) =>
          <FriendCard key={req.id} user={req} variant="request" />
          )}
          </div>
        </div>
      }

      {/* Friends List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">
            All Friends ({friends.length})
          </h2>
          <div className="w-64">
            <Input
              placeholder="Search friends..."
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-[#11224a]" />

          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {friends.map((friend) =>
          <FriendCard key={friend.id} user={friend} variant="friend" />
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Find Friends">

        <div className="space-y-6">
          <Input
            placeholder="Search by name or email..."
            leftIcon={<Search className="w-4 h-4" />}
            autoFocus />


          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Suggested</p>
            <FriendCard
              user={{
                id: '5',
                name: 'Hassan Ali',
                level: 'Intermediate',
                language: ['English'],
                status: 'online'
              }}
              variant="suggestion" />

          </div>
        </div>
      </Modal>
    </DashboardLayout>);

}