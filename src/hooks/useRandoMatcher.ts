'use client';
import { useEffect } from 'react';
import { useStore } from '@/store';

const MOCK_OPPONENTS = [
  { name: 'NightWolf', emoji: '🐺', level: 16 },
  { name: 'StarGazer', emoji: '⭐', level: 11 },
  { name: 'IronMind', emoji: '🧠', level: 19 },
  { name: 'CyberSage', emoji: '🧙', level: 15 },
  { name: 'MoonChild', emoji: '🌙', level: 13 },
];

export function useRandoMatcher() {
  const { randoState, setRandoState, setRandoOpponent, tickRando } = useStore();

  useEffect(() => {
    if (randoState !== 'searching') return;
    const timeout = setTimeout(() => {
      const opponent = MOCK_OPPONENTS[Math.floor(Math.random() * MOCK_OPPONENTS.length)];
      setRandoOpponent(opponent);
      setRandoState('matched');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [randoState, setRandoOpponent, setRandoState]);

  useEffect(() => {
    if (randoState !== 'matched') return;
    const timeout = setTimeout(() => {
      setRandoState('active');
    }, 1500);
    return () => clearTimeout(timeout);
  }, [randoState, setRandoState]);

  useEffect(() => {
    if (randoState !== 'active') return;
    const interval = setInterval(tickRando, 1000);
    return () => clearInterval(interval);
  }, [randoState, tickRando]);
}
