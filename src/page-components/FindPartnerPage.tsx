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
import { useLocationGuess } from '../hooks/useLocationGuess';

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
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Hook for guessing user's timezone based on Intl API
  const { recommendedTimezone } = useLocationGuess();

  // Try to pre-fill the timezone dropdown if the user has one saved
  useEffect(() => {
    if (user?.timezone && !selectedTimezone) {
      setSelectedTimezone(user.timezone);
    }
  }, [user, selectedTimezone]);

  const handleMatchComplete = useCallback(async () => {
    setIsMatching(false);

    try {
      const payload = isAdvancedOpen ? {
        is_advanced: true,
        level: selectedLevel,
        language: selectedLanguage,
        timezone: selectedTimezone,
        goals,
      } : {
        is_advanced: false
      };

      const data = await api.match.find(payload);

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

    if (user) {
      const missingFields = [];
      if (!user.level) missingFields.push("Level");
      if (!user.primary_language) missingFields.push("Primary Language");
      if (!user.timezone) missingFields.push("Timezone");
      if (!user.location) missingFields.push("Location");
      if (!user.bio) missingFields.push("Bio");

      if (missingFields.length > 0) {
        setError(`Please complete your profile: ${missingFields.join(", ")} before looking for matches.`);
        return;
      }
    }

    setIsMatching(true);
  };

  const handleAcceptClick = () => {
    setIcebreakerText(goals || "Salam! I'm looking for a regular review partner...");
    setIsIcebreakerModalOpen(true);
  };

  const handleDecline = async () => {
    if (!matchData) return;
    
    try {
      // Record the skip so this person won't appear again
      await api.match.skip(matchData.id);
    } catch (err) {
      console.error('Failed to record skip:', err);
    }
    
    // Continue with finding another match
    setMatchFound(false);
    setMatchData(null);
    setIsMatching(true);
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
              {!isAdvancedOpen ? (
                <div className="space-y-6 text-center py-8">
                  <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-10 h-10 text-[#D4AF37]" />
                  </div>
                  <h3 className="text-2xl font-bold text-theme-text font-serif">Default Search</h3>
                  <p className="text-theme-text-secondary max-w-md mx-auto">
                    We'll find the best memorization partner for you based on the preferences saved in your profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAdvancedOpen(true)}
                    className="text-[#D4AF37] hover:text-[#D4AF37]/80 text-sm font-medium transition-colors mt-4 block mx-auto underline"
                  >
                    Use Advanced Options Instead
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-theme-border">
                    <h3 className="text-lg font-bold text-theme-text font-serif">Advanced Options</h3>
                    <button
                      type="button"
                      onClick={() => setIsAdvancedOpen(false)}
                      className="text-theme-text-secondary hover:text-theme-text text-sm transition-colors underline"
                    >
                      Use Profile Defaults
                    </button>
                  </div>

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
                      { value: 'beginner', label: 'Beginner (0-5 Parts)' },
                      { value: 'intermediate', label: 'Intermediate (6-14 Parts)' },
                      { value: 'advanced', label: 'Advanced (15-29 Parts)' },
                      { value: 'hafiz', label: 'Hafiz (Completed All 30 Parts)' },
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
                    recommendedValue={recommendedTimezone}
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
              </>
              )}

              <div className="pt-4 flex flex-col items-center justify-center gap-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto min-w-[200px]"
                  rightIcon={<Globe2 className="w-5 h-5" />}
                >
                  Start Matching
                </Button>
                
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await api.match.clearDeclined();
                      setError(`Successfully cleared ${res.cleared_count} skipped partner(s). They will now appear in your future matches.`);
                      setMatchFound(false); 
                      setMatchData(null);
                    } catch (err: any) {
                      setError(err.message || 'Failed to clear skipped partners.');
                    }
                  }}
                  className="text-amber-500/80 hover:text-amber-500 text-xs transition-colors"
                  title="If you skipped anyone by mistake, click this to reset your skipped history."
                >
                  Clear Skipped Partners
                </button>
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
              onDecline={handleDecline}
              onProfile={() => router.push(`/u/${matchData.id}`)}
            />
              <div className="text-center flex flex-col items-center gap-4">
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