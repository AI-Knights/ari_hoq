'use client';

import React, { useState, memo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { Textarea } from '../components/ui/Textarea';
import { MatchingAnimation } from '../components/MatchingAnimation';
import { PartnerCard } from '../components/PartnerCard';
import { Search, Globe2, Clock, BookOpen } from 'lucide-react';
import { LANGUAGES, TIMEZONES } from '../constants/languages-timezones';

export function FindPartnerPage() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const handleMatch = () => {
    setIsMatching(true);
  };
  const handleMatchComplete = () => {
    setIsMatching(false);
    setMatchFound(true);
  };
  const mockMatch = {
    id: '1',
    name: 'Abdullah Rahman',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Abdullah',
    compatibility: 95,
    level: 'Intermediate',
    languages: ['English', 'Arabic'],
    goals:
      'Memorizing Surah Al-Baqarah, looking for daily revision partner after Fajr.',
    timezone: 'GMT+3 (Mecca)'
  };
  return (
    <DashboardLayout>
      <MatchingAnimation
        isMatching={isMatching}
        onComplete={handleMatchComplete} />


      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Find Your Memorization Partner
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our algorithm connects you with compatible partners based on your
            goals, schedule, and learning style.
          </p>
        </div>

        {!matchFound ?
          <Card className="p-8 md:p-10">
            <form
              className="space-y-8"
              onSubmit={(e) => {
                e.preventDefault();
                handleMatch();
              }}>

              {/* Preferences Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <BookOpen className="w-5 h-5 text-[#D4AF37] mr-2" />
                    Learning Profile
                  </h3>

                  <Select
                    label="Current Level"
                    options={[
                      {
                        value: 'beginner',
                        label: 'Beginner (Juz 30)'
                      },
                      {
                        value: 'intermediate',
                        label: 'Intermediate (5-10 Juz)'
                      },
                      {
                        value: 'advanced',
                        label: 'Advanced (15+ Juz)'
                      },
                      {
                        value: 'hafiz',
                        label: 'Hafiz (Revision)'
                      }]
                    } />


                  <SearchableSelect
                    label="Preferred Language"
                    placeholder="Select your preferred language"
                    options={LANGUAGES}
                    value={selectedLanguage}
                    onChange={setSelectedLanguage}
                  />

                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <Clock className="w-5 h-5 text-[#D4AF37] mr-2" />
                    Availability & Location
                  </h3>

                  <SearchableSelect
                    label="Time Zone"
                    placeholder="Select your timezone"
                    options={TIMEZONES}
                    value={selectedTimezone}
                    onChange={setSelectedTimezone}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Gender Preference
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          className="text-[#D4AF37] focus:ring-[#D4AF37]"
                          defaultChecked />

                        <span className="text-gray-300">Same Gender Only</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      We strictly enforce same-gender matching for privacy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Study Goals</h3>
                <Textarea
                  placeholder="e.g. I want to memorize Surah Al-Kahf in 2 months. I'm available on weekends..."
                  rows={4} />

              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto min-w-[200px]"
                  rightIcon={<Globe2 className="w-5 h-5" />}>

                  Start Matching
                </Button>
              </div>
            </form>
          </Card> :

          <div className="space-y-8">
            <PartnerCard
              match={mockMatch}
              onAccept={() => console.log('Accepted')}
              onDecline={() => setMatchFound(false)} />

            <div className="text-center">
              <button
                onClick={() => setMatchFound(false)}
                className="text-gray-400 hover:text-white text-sm underline">

                Change Preferences
              </button>
            </div>
          </div>
        }
      </div>
    </DashboardLayout>);

}