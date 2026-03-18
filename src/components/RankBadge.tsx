'use client';
import React from 'react';
import { RANK_TIER_COLORS, RANK_TIER_EMOJIS } from '@/lib/constants';

interface RankBadgeProps {
  tier: string;
  division: number; // 1–4 = I–IV; 0 = Usta (no division)
  lp: number;
  size: 'sm' | 'md' | 'lg';
}

const DIVISION_ROMAN: Record<number, string> = { 0: '', 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

const SIZE_STYLES = {
  sm: { fontSize: 9, badgeWidth: 80, showBar: false },
  md: { fontSize: 13, badgeWidth: 140, showBar: true },
  lg: { fontSize: 16, badgeWidth: 180, showBar: true },
} as const;

export function RankBadge({ tier, division, lp, size }: RankBadgeProps) {
  const color = RANK_TIER_COLORS[tier] ?? '#64748B';
  const emoji = RANK_TIER_EMOJIS[tier] ?? '⭐';
  const roman = DIVISION_ROMAN[division] ?? '';
  const { fontSize, badgeWidth, showBar } = SIZE_STYLES[size];
  const isUsta = tier === 'Usta';
  const lpPct = Math.min(lp / 100, 1) * 100;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: badgeWidth }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: fontSize + 4 }}>{emoji}</span>
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize,
          fontWeight: 700,
          color,
          letterSpacing: '0.05em',
        }}>
          {tier}
        </span>
        {roman && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: fontSize - 1,
            color: 'var(--muted)',
            marginLeft: 2,
          }}>
            {roman}
          </span>
        )}
      </div>
      {showBar && !isUsta && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="progress-track" style={{ flex: 1, height: 4 }}>
            <div
              className="progress-fill"
              style={{ width: `${lpPct}%`, background: color }}
            />
          </div>
          {size === 'lg' && (
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: 'var(--muted)',
              whiteSpace: 'nowrap',
            }}>
              {lp} LP
            </span>
          )}
        </div>
      )}
      {showBar && isUsta && (
        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          color,
        }}>
          {lp} LP ∞
        </span>
      )}
    </div>
  );
}
