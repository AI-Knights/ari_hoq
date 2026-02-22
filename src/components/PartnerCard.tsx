import React from 'react';
import { Check, X, Calendar, BookOpen, Globe2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
interface PartnerCardProps {
  match: {
    id: string;
    name: string;
    avatar?: string;
    compatibility: number;
    level: string;
    languages: string[];
    goals: string;
    timezone: string;
  };
  onAccept: () => void;
  onDecline: () => void;
  onProfile?: () => void;
}
export function PartnerCard({ match, onAccept, onDecline, onProfile }: PartnerCardProps) {
  return (
    <Card className="max-w-2xl w-full mx-auto overflow-hidden border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
      <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent p-6 border-b border-theme-border">
        <div className="flex justify-between items-start">
          <div
            className={`flex items-center gap-4 ${onProfile ? 'cursor-pointer hover:bg-theme-bg-hover p-2 -ml-2 rounded-xl transition-colors' : ''}`}
            onClick={onProfile}
            title={onProfile ? "View Full Profile" : undefined}
          >
            <Avatar
              src={match.avatar}
              fallback={match.name.charAt(0)}
              size="xl" />

            <div>
              <h2 className="text-2xl font-serif font-bold text-theme-text">
                {match.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success">
                  {match.compatibility}% Compatible
                </Badge>
                <span className="text-theme-text-secondary text-sm flex items-center">
                  <Globe2 className="w-3 h-3 mr-1" />
                  {match.timezone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary uppercase tracking-wider mb-2">
              Learning Profile
            </h4>
            <div className="space-y-3">
              <div className="flex items-center text-theme-text">
                <BookOpen className="w-4 h-4 text-[#D4AF37] mr-3" />
                <span>Level: {match.level}</span>
              </div>
              <div className="flex items-start text-theme-text">
                <Globe2 className="w-4 h-4 text-[#D4AF37] mr-3 mt-1" />
                <div className="flex flex-wrap gap-1">
                  {match.languages.map((lang) =>
                    <span
                      key={lang}
                      className="text-sm bg-theme-subtle px-2 py-0.5 rounded">

                      {lang}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-theme-text-secondary uppercase tracking-wider mb-2">
              Study Goals
            </h4>
            <p className="text-theme-text-secondary text-sm leading-relaxed italic">
              "{match.goals}"
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-theme-border flex gap-4">
          <Button
            variant="primary"
            className="flex-1 py-4 text-lg"
            onClick={onAccept}
            leftIcon={<Check className="w-5 h-5" />}>

            Send Request
          </Button>
          <Button
            variant="ghost"
            className="flex-1 py-4 text-lg"
            onClick={onDecline}
            leftIcon={<X className="w-5 h-5" />}>

            Find Another
          </Button>
        </div>
      </div>
    </Card>);

}