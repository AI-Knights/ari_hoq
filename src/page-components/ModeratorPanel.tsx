'use client';

import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Flag, MessageSquare, CheckCircle } from 'lucide-react';
export function ModeratorPanel() {
  const flaggedContent = [
  {
    id: 1,
    type: 'message',
    content: 'Spam message content...',
    user: 'User123',
    time: '10m ago',
    severity: 'low'
  },
  {
    id: 2,
    type: 'profile',
    content: 'Inappropriate bio text',
    user: 'User456',
    time: '1h ago',
    severity: 'high'
  }];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          Moderator Panel
        </h1>
        <p className="text-gray-400">
          Review flagged content and ensure community safety.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Queue */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Flag className="w-5 h-5 text-red-400 mr-2" />
            Review Queue
          </h2>

          {flaggedContent.map((item) =>
          <Card key={item.id} className="p-6 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="danger" className="uppercase text-[10px]">
                      {item.severity}
                    </Badge>
                    <span className="text-sm text-gray-400">{item.type}</span>
                  </div>
                  <h3 className="font-bold text-white">
                    Reported: {item.user}
                  </h3>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>

              <div className="bg-white/5 p-4 rounded-lg mb-4 text-sm text-gray-200">
                "{item.content}"
              </div>

              <div className="flex gap-3">
                <Button size="sm" variant="danger" className="flex-1">
                  Remove Content
                </Button>
                <Button size="sm" variant="secondary" className="flex-1">
                  Warn User
                </Button>
                <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-green-400 hover:text-green-300">

                  Ignore
                </Button>
              </div>
            </Card>
          )}

          {flaggedContent.length === 0 &&
          <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">All Clear!</h3>
              <p className="text-gray-400">
                No flagged content to review at the moment.
              </p>
            </Card>
          }
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-white mb-4">Your Activity</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reviewed today</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Actions taken</span>
                <span className="text-white font-medium">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Response time</span>
                <span className="text-white font-medium">~2h</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-[#D4AF37]/10 border-[#D4AF37]/30">
            <h3 className="font-bold text-[#D4AF37] mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Mod Chat
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Coordinate with other moderators.
            </p>
            <Button size="sm" variant="secondary" className="w-full">
              Open Channel
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

}