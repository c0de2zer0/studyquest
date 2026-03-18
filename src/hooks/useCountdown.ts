'use client';
import { useState, useEffect } from 'react';

export function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);

  useEffect(() => {
    setRemaining(targetSeconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetSeconds]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return {
    remaining,
    days,
    hours,
    minutes,
    seconds,
    formatted: `${days}G ${hours}S ${minutes}DK`,
    formattedShort: `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`,
  };
}
