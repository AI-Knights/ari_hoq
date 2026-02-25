import React, { useState } from 'react';
import {
  UserPlus,
  MessageCircle,
  MoreVertical,
  UserMinus,
  Check,
  X
} from 'lucide-react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useUserStatus } from '../hooks/useUserStatus';

interface FriendCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
    language: string[];
    status: 'online' | 'offline' | 'busy';
    message?: string;
  };
  variant?: 'friend' | 'suggestion' | 'request' | 'sentRequest';
  onAction?: (action: string, userId: string) => void;
}

export function FriendCard({
  user,
  variant = 'friend',
  onAction
}: FriendCardProps) {
  const { getStatus } = useUserStatus();
  const [confirmingUnfriend, setConfirmingUnfriend] = useState(false);

  // Use unified status logic - friends are allowed to see status
  const currentStatus = getStatus(user.id, user, true, false);

  return (
    <Card className="p-5 flex flex-col h-full relative">
      <div className="flex items-center mb-4 cursor-pointer" onClick={() => onAction?.('profile', user.id)}>
        <Avatar
          src={user.avatar}
          fallback={(user.name || (user as any).username || 'U').charAt(0).toUpperCase()}
          status={currentStatus}
          size="lg" />

        <div className="ml-4">
          <h3 className="font-bold text-theme-text text-lg hover:underline">{user.name || (user as any).username}</h3>
          <p className="text-sm text-[#D4AF37]">{user.level}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {user.language.map((lang) =>
            <Badge key={lang} variant="outline" className="text-xs">
              {lang}
            </Badge>
          )}
        </div>

        {(variant === 'request' || variant === 'sentRequest') && user.message && (
          <div className="bg-theme-bg-hover rounded-md p-3 border border-theme-border italic text-sm text-theme-text-secondary mt-2">
            {variant === 'sentRequest' && <span className="font-semibold not-italic">You sent: </span>}
            "{user.message}"
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-auto">
        {variant === 'friend' &&
          <>
            {confirmingUnfriend ? (
              /* Inline confirmation */
              <div className="flex items-center gap-2 w-full bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <span className="text-xs text-red-400 flex-1">Remove friend?</span>
                <button
                  title="Confirm unfriend"
                  onClick={() => { setConfirmingUnfriend(false); onAction?.('unfriend', user.id); }}
                  className="p-1 rounded hover:bg-red-500/20 text-red-400">
                  <Check className="w-4 h-4" />
                </button>
                <button
                  title="Cancel"
                  onClick={() => setConfirmingUnfriend(false)}
                  className="p-1 rounded hover:bg-white/10 text-theme-text-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1"
                  leftIcon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => onAction?.('chat', user.id)}>
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  onClick={() => onAction?.('profile', user.id)}>
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  title="Unfriend"
                  onClick={() => setConfirmingUnfriend(true)}>
                  <UserMinus className="w-4 h-4" />
                </Button>
              </>
            )}
          </>
        }

        {variant === 'suggestion' &&
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => onAction?.('add', user.id)}>
            Add Friend
          </Button>
        }

        {variant === 'request' &&
          <>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={() => onAction?.('accept', user.id)}>
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => onAction?.('decline', user.id)}>
              Decline
            </Button>
          </>
        }

        {variant === 'sentRequest' &&
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-theme-text-secondary hover:text-red-400 hover:bg-red-500/10"
            onClick={() => onAction?.('cancel', user.id)}>
            Cancel Request
          </Button>
        }
      </div>
    </Card>
  );
}