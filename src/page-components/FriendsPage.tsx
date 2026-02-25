'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FriendCard } from '../components/FriendCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Avatar } from '../components/ui/Avatar';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FriendUser {
  id: string;
  name: string;
  level: string;
  language: string[];
  status: 'online' | 'offline' | 'busy';
  avatar?: string;
  friendshipId?: number;
  message?: string;
}

export function FriendsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<(FriendUser & { friendshipId: number; message?: string })[]>([]);
  const [sentRequests, setSentRequests] = useState<(FriendUser & { friendshipId: number; message?: string })[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<FriendUser[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'blocked'>('friends');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddUser, setSelectedAddUser] = useState<any>(null);
  const [icebreaker, setIcebreaker] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const loadFriends = useCallback(async () => {
    try {
      const [data, blockedData] = await Promise.all([
        api.friends.list(),
        api.friends.listBlocked()
      ]);
      const friendships = Array.isArray(data) ? data : data.results ?? [];
      const blockedList = Array.isArray(blockedData) ? blockedData : blockedData.results ?? [];

      const myId = user?.id;
      const acceptedFriends: FriendUser[] = [];
      const pendingRequests: any[] = [];
      const outgoingRequests: any[] = [];

      for (const f of friendships) {
        const partner = String(f.user1?.id) === String(myId) ? f.user2 : f.user1;
        const friendObj: FriendUser = {
          id: String(partner.id),
          name: partner.name || partner.username || 'Unknown User',
          level: partner.level || 'Unknown',
          language: partner.primary_language ? [partner.primary_language] : [],
          status: partner.status || 'offline',
          avatar: partner.avatar || undefined,
          friendshipId: f.id,
        };

        if (f.status === 'accepted') {
          acceptedFriends.push(friendObj);
        } else if (f.status === 'pending') {
          if (String(f.user2?.id) === String(myId)) {
            pendingRequests.push({ ...friendObj, friendshipId: f.id, message: f.message });
          } else if (String(f.user1?.id) === String(myId)) {
            outgoingRequests.push({ ...friendObj, friendshipId: f.id, message: f.message });
          }
        }
      }

      setFriends(acceptedFriends);
      setRequests(pendingRequests);
      setSentRequests(outgoingRequests);
      setBlockedUsers(blockedList.map((u: any) => ({
        id: String(u.id),
        name: u.name || u.username || 'Unknown User',
        level: u.level || 'Unknown',
        language: u.primary_language ? [u.primary_language] : [],
        status: u.status || 'offline',
        avatar: u.avatar || undefined,
      })));
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const data = await api.users.search(q);
      const results = Array.isArray(data) ? data : data.results ?? [];
      setSearchResults(results.filter((u: any) => String(u.id) !== String(user?.id)));
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }, [user?.id]);

  const handleAddFriend = async () => {
    if (!selectedAddUser || !icebreaker.trim()) {
      setAddError('An introductory message is required.');
      return;
    }
    setIsAdding(true);
    setAddError('');
    try {
      await api.friends.sendRequest({ user_id: selectedAddUser.id, message: icebreaker.trim() });
      setIsAddModalOpen(false);
      setSelectedAddUser(null);
      setIcebreaker('');
      setSearchResults([]);
    } catch (err: any) {
      setAddError(err.message || 'Failed to send request.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAccept = async (friendshipId: number) => {
    try {
      await api.friends.accept(friendshipId);
      await loadFriends();
    } catch (err) {
      console.error('Accept failed', err);
    }
  };

  const handleDecline = async (friendshipId: number) => {
    try {
      await api.friends.decline(friendshipId);
      await loadFriends();
    } catch (err) {
      console.error('Decline failed', err);
    }
  };

  const handleCancel = async (friendshipId: number) => {
    try {
      await api.friends.cancel(friendshipId);
      await loadFriends();
    } catch (err) {
      console.error('Cancel failed', err);
    }
  };

  const handleUnfriend = async (userId: string) => {
    try {
      await api.friends.unfriend(userId);
      await loadFriends();
    } catch (err) {
      console.error('Unfriend failed', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-theme-text mb-2">My Community</h1>
          <p className="text-theme-text-secondary">Manage your friends and study partners.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-theme-card border border-theme-border rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'friends' ? 'bg-[#D4AF37] text-[#0A1A3A]' : 'text-theme-text-secondary hover:text-theme-text'}`}
            >
              Friends
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'bg-[#D4AF37] text-[#0A1A3A]' : 'text-theme-text-secondary hover:text-theme-text'}`}
            >
              Requests
              {requests.length > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'requests' ? 'bg-[#0A1A3A] text-[#D4AF37]' : 'bg-theme-bg-hover text-theme-text'}`}>
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'blocked' ? 'bg-[#D4AF37] text-[#0A1A3A]' : 'text-theme-text-secondary hover:text-theme-text'}`}
            >
              Blocked
            </button>
          </div>
          <Button leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Add Friend
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-theme-text-secondary">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
        </div>
      ) : (
        <>
          {activeTab === 'requests' ? (
            <div className="space-y-12">
              {/* Friend Requests */}
              <div>
                <h2 className="text-lg font-bold text-theme-text mb-4 flex items-center">
                  Pending Incoming Requests
                  {requests.length > 0 && (
                    <span className="ml-2 bg-[#D4AF37] text-[#0A1A3A] text-xs px-2 py-0.5 rounded-full">
                      {requests.length}
                    </span>
                  )}
                </h2>
                {requests.length === 0 ? (
                  <p className="text-theme-text-secondary">No incoming requests.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((req) => (
                      <FriendCard
                        key={req.id}
                        user={req}
                        variant="request"
                        onAction={(action) => {
                          if (action === 'accept' && req.friendshipId) handleAccept(req.friendshipId);
                          if (action === 'decline' && req.friendshipId) handleDecline(req.friendshipId);
                          if (action === 'profile') router.push(`/u/${req.id}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h2 className="text-lg font-bold text-theme-text mb-4 flex items-center">
                  Sent Requests
                  {sentRequests.length > 0 && (
                    <span className="ml-2 bg-[#D4AF37] text-[#0A1A3A] text-xs px-2 py-0.5 rounded-full">
                      {sentRequests.length}
                    </span>
                  )}
                </h2>
                {sentRequests.length === 0 ? (
                  <p className="text-theme-text-secondary">No sent requests pending.</p>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sentRequests.map((req) => (
                      <FriendCard
                        key={req.id}
                        user={req}
                        variant="sentRequest"
                        onAction={(action) => {
                          if (action === 'cancel' && req.friendshipId) handleCancel(req.friendshipId);
                          if (action === 'profile') router.push(`/u/${req.id}`);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'friends' ? (
            /* Friends List */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-theme-text">All Friends ({friends.length})</h2>
                <div className="w-64">
                  <Input
                    placeholder="Search friends..."
                    leftIcon={<Search className="w-4 h-4" />}
                    className="bg-theme-input"
                  />
                </div>
              </div>

              {friends.length === 0 ? (
                <div className="text-center py-12 text-theme-text-secondary">
                  <p>No friends yet. Use the Add Friend button to connect with seekers!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.id}
                      user={friend}
                      variant="friend"
                      onAction={(action, userId) => {
                        if (action === 'chat') router.push(`/chat?userId=${userId}`);
                        if (action === 'unfriend') handleUnfriend(userId);
                        if (action === 'profile') router.push(`/u/${userId}`);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Blocked Users List */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-theme-text">Blocked Users ({blockedUsers.length})</h2>
              </div>

              {blockedUsers.length === 0 ? (
                <div className="text-center py-12 text-theme-text-secondary">
                  <p>You haven't blocked anyone.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blockedUsers.map((blockedUser) => (
                    <div key={blockedUser.id} className="bg-theme-card border border-theme-border rounded-xl p-5 flex flex-col justify-between h-[180px]">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={blockedUser.avatar}
                            fallback={blockedUser.name.charAt(0)}
                            status="offline"
                          />
                          <div>
                            <h3 className="font-bold text-theme-text text-base line-clamp-1">{blockedUser.name}</h3>
                            <p className="text-xs text-theme-text-secondary line-clamp-1">{blockedUser.level}</p>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        className="w-full mt-4 bg-white/5 hover:bg-white/10"
                        onClick={async () => {
                          try {
                            await api.friends.unblock(blockedUser.id);
                            await loadFriends();
                          } catch (err) {
                            console.error('Failed to unblock', err);
                          }
                        }}
                      >
                        Unblock User
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
          }
        </>
      )}

      {/* Add Friend Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSearchResults([]);
          setAddError('');
          setSelectedAddUser(null);
          setIcebreaker('');
        }}
        title={selectedAddUser ? `Connect with ${selectedAddUser.username}` : "Find a Friend"}
      >
        <div className="space-y-6">
          {selectedAddUser ? (
            <div className="space-y-4">
              <p className="text-sm text-theme-text-secondary">
                Send a brief introductory message explaining your goals to increase your chances of connecting!
              </p>
              <div>
                <textarea
                  className="w-full bg-theme-input text-theme-text border border-theme-input-border rounded-lg p-3 text-sm focus:outline-none focus:border-[#D4AF37] custom-scrollbar"
                  rows={4}
                  placeholder="Salam! I'm currently memorizing Juz 30 and looking for a regular review partner..."
                  value={icebreaker}
                  maxLength={150}
                  onChange={(e) => setIcebreaker(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end mt-1 text-xs text-theme-text-secondary">
                  {icebreaker.length} / 150
                </div>
              </div>

              {addError && <p className="text-red-500 text-sm">{addError}</p>}

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => setSelectedAddUser(null)}>
                  Back
                </Button>
                <Button
                  onClick={handleAddFriend}
                  isLoading={isAdding}
                  disabled={!icebreaker.trim()}
                >
                  Send Request
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                placeholder="Search by username or email..."
                leftIcon={<Search className="w-4 h-4" />}
                autoFocus
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
              />

              {addError && <p className="text-red-500 text-sm">{addError}</p>}

              {isSearching && (
                <div className="flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" /></div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-theme-text-secondary">Results</p>
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-lg border border-theme-border">
                      <div>
                        <p className="font-medium text-theme-text">{result.username}</p>
                        <p className="text-sm text-theme-text-secondary">{result.level || 'Unknown level'}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedAddUser(result)}
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
                <p className="text-sm text-theme-text-secondary text-center">No users found. Try a different name.</p>
              )}
            </>
          )}
        </div>
      </Modal>
    </DashboardLayout >
  );
}