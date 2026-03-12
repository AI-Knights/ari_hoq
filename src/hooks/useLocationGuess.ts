import { useState, useEffect } from 'react';
import { TIMEZONES } from '../constants/languages-timezones';

export function useLocationGuess() {
    const [recommendedTimezone, setRecommendedTimezone] = useState<string>('');
    const [isGuessing, setIsGuessing] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;

        const guessDetails = async () => {
            try {
                // Determine user's current UTC offset to find the best match in the static TIMEZONES array
                const offsetMinutes = -new Date().getTimezoneOffset();
                const sign = offsetMinutes >= 0 ? '+' : '-';
                const hours = Math.floor(Math.abs(offsetMinutes) / 60).toString().padStart(2, '0');
                const minutes = (Math.abs(offsetMinutes) % 60).toString().padStart(2, '0');
                const offsetString = `(GMT${sign}${hours}:${minutes})`;

                // Find the first timezone in our list that includes this offset
                const matchedTz = TIMEZONES.find(tz => tz.includes(offsetString));
                if (matchedTz && mounted) {
                    setRecommendedTimezone(matchedTz);
                }
            } catch (err) {
                console.warn("Error guessing timezone", err);
            } finally {
                if (mounted) {
                    setIsGuessing(false);
                }
            }
        };

        guessDetails();

        return () => {
            mounted = false;
        };
    }, []);

    return { recommendedTimezone, isGuessing };
}
