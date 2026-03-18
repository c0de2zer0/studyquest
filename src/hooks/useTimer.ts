'use client';
import { useEffect } from 'react';
import { useStore } from '@/store';

export function useTimer() {
  const { isRunning, tickTimer } = useStore();

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tickTimer]);
}
