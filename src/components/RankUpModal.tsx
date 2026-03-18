'use client';
import React, { useEffect } from 'react';
import { useStore } from '@/store';
import { RankBadge } from './RankBadge';

const CONFETTI_DOTS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i / 12) * 100}%`,
  background: ['#7B5CF5', '#22D3EE', '#FFD700', '#EC4899', '#10B981'][i % 5],
  animationDelay: `${(i * 0.05).toFixed(2)}s`,
}));

export function RankUpModal() {
  const rankUpInfo = useStore(state => state.user.rankUpInfo);
  const dismissRankUp = useStore(state => state.dismissRankUp);

  useEffect(() => {
    const timer = setTimeout(() => dismissRankUp(), 4000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!rankUpInfo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.85)',
      }}
      onClick={dismissRankUp}
    >
      {/* Confetti */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {CONFETTI_DOTS.map((dot, i) => (
          <div
            key={i}
            className="confetti-dot"
            style={{
              position: 'absolute',
              top: 0,
              left: dot.left,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dot.background,
              animationDelay: dot.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          background: 'var(--s2)',
          border: '1px solid rgba(123, 92, 245, 0.4)',
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          minWidth: 280,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 8, fontSize: 40 }}>🎉</div>
        <h2
          className="gradient-text"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          RANK UP!
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <RankBadge
            tier={rankUpInfo.newTier}
            division={rankUpInfo.newDivision}
            lp={0}
            size="lg"
          />
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
          Tebrikler! Yeni rank&apos;ına terfi ettin.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 8 }}>
          (4 saniye içinde kapanır)
        </p>
      </div>
    </div>
  );
}
