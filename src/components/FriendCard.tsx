import React from 'react';
import {
  UserPlus,
  MessageCircle,
  MoreVertical,
  ShieldAlert,
  UserMinus } from
'lucide-react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
interface FriendCardProps {
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: string;
    language: string[];
    status: 'online' | 'offline' | 'busy';
  };
  variant?: 'friend' | 'suggestion' | 'request';
  onAction?: (action: string, userId: string) => void;
}
export function FriendCard({
  user,
  variant = 'friend',
  onAction
}: FriendCardProps) {
  return (
    <Card className="p-5 flex flex-col h-full relative group">
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-gray-400 hover:text-white">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center mb-4">
        <Avatar
          src={user.avatar}
          fallback={user.name.charAt(0)}
          status={user.status}
          size="lg" />

        <div className="ml-4">
          <h3 className="font-bold text-white text-lg">{user.name}</h3>
          <p className="text-sm text-[#D4AF37]">{user.level}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 mb-6">
        <div className="flex flex-wrap gap-2">
          {user.language.map((lang) =>
          <Badge key={lang} variant="outline" className="text-xs">
              {lang}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-auto">
        {variant === 'friend' &&
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
      </div>
    </Card>);

}