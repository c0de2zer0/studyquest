'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  danger: 'bg-red-50 text-red-700 border border-red-200',
  info: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-tertiary)]',
  success: 'bg-emerald-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
  purple: 'bg-purple-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            dotStyles[variant],
          )}
        />
      )}
      {children}
    </span>
  );
}
