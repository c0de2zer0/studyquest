'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ProgressColor = 'cyan' | 'purple' | 'gold' | 'emerald';
type ProgressSize = 'sm' | 'md';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressColor;
  size?: ProgressSize;
  showLabel?: boolean;
  className?: string;
}

const barColorStyles: Record<ProgressColor, string> = {
  cyan: 'bg-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]',
  purple: 'bg-[#8b5cf6] shadow-[0_0_12px_rgba(139,92,246,0.3)]',
  gold: 'bg-[#ffd700] shadow-[0_0_12px_rgba(255,215,0,0.3)]',
  emerald: 'bg-[#10b981] shadow-[0_0_12px_rgba(16,185,129,0.3)]',
};

const barHeightStyles: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export default function ProgressBar({
  value,
  max = 100,
  color = 'cyan',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;
  const roundedPercentage = Math.round(percentage);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex-1 rounded-full bg-[var(--bg-hover)] overflow-hidden',
            barHeightStyles[size],
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${roundedPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              barColorStyles[color],
            )}
          />
        </div>

        {showLabel && (
          <span className="text-xs text-[var(--text-tertiary)] font-medium whitespace-nowrap">
            {clampedValue}/{max}
          </span>
        )}
      </div>
    </div>
  );
}
