'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { api } from '../lib/api';

export function AvailabilityCalendar() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response: any = await api.availability.list();
        const slots: any[] = Array.isArray(response) ? response : response.results || [];
        setSelected(slots.map(s => `${s.day_of_week}-${s.time_slot}`));
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, []);
  const toggleSlot = async (day: string, time: string) => {
    const id = `${day}-${time}`;
    // Optimistic UI update
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }

    try {
      const updatedSlots: any[] = await api.availability.toggle(day, time);
      setSelected(updatedSlots.map(s => `${s.day_of_week}-${s.time_slot}`));
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      // rollback could be added here
    }
  };
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-serif">
        Weekly Availability
      </h3>
      <div className="w-full min-w-[250px]">
        <div
          className="grid gap-1 sm:gap-2 mb-2"
          style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}
        >
          <div className="text-[10px] sm:text-xs text-gray-500 pr-1 sm:pr-2 min-w-[55px] sm:min-w-[70px]"></div>
          {days.map((day) =>
            <div
              key={day}
              className="text-[10px] sm:text-xs text-center text-gray-400 font-medium">
              {day}
            </div>
          )}
        </div>

        {times.map((time) =>
          <div
            key={time}
            className="grid gap-1 sm:gap-2 mb-1 sm:mb-2"
            style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}
          >
            <div className="text-[10px] sm:text-xs text-gray-400 flex items-center pr-1 sm:pr-2 min-w-[55px] sm:min-w-[70px]">
              {time}
            </div>
            {days.map((day) => {
              const id = `${day}-${time}`;
              const isSelected = selected.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleSlot(day, time)}
                  className={`
                      h-8 rounded-md transition-all duration-200 border
                      ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]' : 'bg-white/5 border-white/10 hover:border-white/30'}
                    `} />);


            })}
          </div>
        )}
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 mt-4 text-center">
        Click slots to toggle availability. Times are shown in your local
        timezone.
      </p>
    </Card>);

}