'use client';

import React, { useState } from 'react';
import { Card } from './ui/Card';
export function AvailabilityCalendar() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];
  // Mock state for selected slots
  const [selected, setSelected] = useState<string[]>([
  'Mon-Morning',
  'Wed-Evening',
  'Fri-Morning']
  );
  const toggleSlot = (day: string, time: string) => {
    const id = `${day}-${time}`;
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-white mb-4 font-serif">
        Weekly Availability
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-8 gap-2 mb-2">
            <div className="text-xs text-gray-500"></div>
            {days.map((day) =>
            <div
              key={day}
              className="text-xs text-center text-gray-400 font-medium">

                {day}
              </div>
            )}
          </div>

          {times.map((time) =>
          <div key={time} className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs text-gray-400 flex items-center">
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
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        Click slots to toggle availability. Times are shown in your local
        timezone.
      </p>
    </Card>);

}