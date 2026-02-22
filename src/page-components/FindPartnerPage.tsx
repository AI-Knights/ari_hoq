'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { Textarea } from '../components/ui/Textarea';
import { MatchingAnimation } from '../components/MatchingAnimation';
import { PartnerCard } from '../components/PartnerCard';
import { Search, Globe2, Clock, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { LANGUAGES, TIMEZONES } from '../constants/languages-timezones';
import { api } from '../lib/api';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';

export function FindPartnerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [goals, setGoals] = useState('');
  const [isIcebreakerModalOpen, setIsIcebreakerModalOpen] = useState(false);
  const [icebreakerText, setIcebreakerText] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleMatchComplete = useCallback(async () => {
    setIsMatching(false);

    try {
      const data = await api.match.find({
        level: selectedLevel,
        language: selectedLanguage,
        timezone: selectedTimezone,
        goals,
      });

      if (data.match) {
        setMatchData(data.match);
        setMatchFound(true);
      } else {
        setError(data.message || 'No compatible partners found right now. Try again later!');
      }
    } catch (err: any) {
      setError(err.message || 'Matching failed. Please try again.');
    }
  }, [selectedLevel, selectedLanguage, selectedTimezone, goals]);

  const handleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (user && (!user.level || !user.primary_language || !user.timezone || !user.location || !user.bio)) {
      setError("Please complete your profile (Level, Language, Timezone, Location, Bio) before looking for matches.");
      return;
    }

    setIsMatching(true);
  };

  const handleAcceptClick = () => {
    setIcebreakerText(goals || "Salam! I'm looking for a regular review partner...");
    setIsIcebreakerModalOpen(true);
  };

  const handleSendIcebreaker = async () => {
    if (!matchData || !icebreakerText.trim()) return;
    setIsSendingRequest(true);
    setError(null);
    try {
      await api.friends.sendRequest({ user_id: matchData.id, message: icebreakerText.trim() });
      setIsIcebreakerModalOpen(false);
      setMatchFound(false);
      setMatchData(null);
      // Optional: show a success toast here
    } catch (err: any) {
      console.error('Failed to send partner request', err);
      setError(err.message || 'Failed to send request. Try again.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <DashboardLayout>
      <MatchingAnimation isMatching={isMatching} onComplete={handleMatchComplete} />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-theme-text mb-4">
            Find Your Memorization Partner
          </h1>
          <p className="text-theme-text-secondary max-w-2xl mx-auto">
            Our algorithm connects you with compatible partners based on your goals, schedule, and learning style.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!matchFound ? (
          <Card className="p-8 md:p-10 overflow-visible relative z-10">
            <form className="space-y-8" onSubmit={handleMatch}>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-theme-text flex items-center">
                    <BookOpen className="w-5 h-5 text-[#D4AF37] mr-2" />
                    Learning Profile
                  </h3>

                  <Select
                    label="Current Level"
                    value={selectedLevel}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedLevel(e.target.value)}
                    options={[
                      { value: 'beginner', label: 'Beginner (Juz 30)' },
                      { value: 'intermediate', label: 'Intermediate (5-10 Juz)' },
                      { value: 'advanced', label: 'Advanced (15+ Juz)' },
                      { value: 'hafiz', label: 'Hafiz (Revision)' },
                    ]}
                  />

                  <SearchableSelect
                    label="Preferred Language"
                    placeholder="Select Language"
                    options={LANGUAGES}
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                  />
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-theme-text flex items-center">
                    <Clock className="w-5 h-5 text-[#D4AF37] mr-2" />
                    Availability & Location
                  </h3>

                  <SearchableSelect
                    label="Time Zone"
                    placeholder="Select Time Zone"
                    options={TIMEZONES}
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-theme-text-secondary">
                      Gender Preference
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="gender" className="text-[#D4AF37] focus:ring-[#D4AF37]" defaultChecked />
                        <span className="text-theme-text-secondary">Same Gender Only</span>
                      </label>
                    </div>
                    <p className="text-xs text-theme-muted">We strictly enforce same-gender matching for privacy.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-theme-text">Study Goals</h3>
                <Textarea
                  placeholder="e.g. I want to memorize Surah Al-Kahf in 2 months. I'm available on weekends..."
                  rows={4}
                  value={goals}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGoals(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto min-w-[200px]"
                  rightIcon={<Globe2 className="w-5 h-5" />}
                >
                  Start Matching
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="space-y-8">
            <PartnerCard
              match={{
                id: String(matchData.id),
                name: matchData.username || matchData.name,
                avatar: matchData.avatar || undefined,
                compatibility: matchData.compatibility || 90,
                level: matchData.level || 'Unknown',
                languages: matchData.primary_language ? [matchData.primary_language] : ['Arabic'],
                goals: matchData.bio || 'Looking for a memorization partner.',
                timezone: matchData.timezone || 'Not specified',
              }}
              onAccept={handleAcceptClick}
              onDecline={() => {
                setMatchFound(false);
                setMatchData(null);
                setIsMatching(true);
              }}
              onProfile={() => router.push(`/u/${matchData.id}`)}
            />
            <div className="text-center">
              <button
                onClick={() => { setMatchFound(false); setMatchData(null); }}
                className="text-theme-text-secondary hover:text-theme-text text-sm underline"
              >
                Change Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isIcebreakerModalOpen}
        onClose={() => setIsIcebreakerModalOpen(false)}
        title={`Connect with ${matchData?.username || matchData?.name || 'Partner'}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-theme-text-secondary">
            Introduce yourself! We've pre-filled this with your study goals, but feel free to customize it.
          </p>
          <div>
            <textarea
              className="w-full bg-theme-input text-theme-text border border-theme-input-border rounded-lg p-3 text-sm focus:outline-none focus:border-[#D4AF37] custom-scrollbar"
              rows={4}
              value={icebreakerText}
              maxLength={150}
              onChange={(e) => setIcebreakerText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end mt-1 text-xs text-theme-text-secondary">
              {icebreakerText.length} / 150
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setIsIcebreakerModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSendIcebreaker}
              isLoading={isSendingRequest}
              disabled={!icebreakerText.trim()}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}