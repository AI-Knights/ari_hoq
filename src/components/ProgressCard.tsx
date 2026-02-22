import React from 'react';
import { Card } from './ui/Card';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
interface ProgressCardProps {
  totalSurahs: number;
  completedSurahs: number;
  currentSurah: string;
  streakDays: number;
}
export function ProgressCard({
  totalSurahs,
  completedSurahs,
  currentSurah,
  streakDays
}: ProgressCardProps) {
  const percentage = Math.round(completedSurahs / totalSurahs * 100);
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy className="w-24 h-24 text-[#D4AF37]" />
      </div>

      <h3 className="text-lg font-bold text-theme-text mb-4 font-serif">
        Memorization Progress
      </h3>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-theme-text-secondary">Total Progress</span>
          <span className="text-[#D4AF37] font-bold">{percentage}%</span>
        </div>
        <div className="w-full bg-theme-subtle rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{
              width: 0
            }}
            animate={{
              width: `${percentage}%`
            }}
            transition={{
              duration: 1,
              ease: 'easeOut'
            }}
            className="bg-[#D4AF37] h-2.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />

        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-theme-subtle rounded-lg p-3">
          <p className="text-xs text-theme-text-secondary mb-1">Current Goal</p>
          <p className="text-theme-text font-medium truncate">{currentSurah}</p>
        </div>
        <div className="bg-theme-subtle rounded-lg p-3">
          <p className="text-xs text-theme-text-secondary mb-1">Streak</p>
          <p className="text-[#D4AF37] font-medium">{streakDays} Days 🔥</p>
        </div>
      </div>
    </Card>);

}