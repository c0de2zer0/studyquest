'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type PaddingSize = 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'gold' | 'none';
  hover?: boolean;
  padding?: PaddingSize;
  onClick?: () => void;
}

const glowStyles: Record<string, string> = {
  cyan: 'shadow-[0_0_30px_-5px_rgba(0,240,255,0.15)] border-cyan-500/20',
  purple: 'shadow-[0_0_30px_-5px_rgba(139,92,246,0.15)] border-purple-500/20',
  gold: 'shadow-[0_0_30px_-5px_rgba(255,215,0,0.15)] border-yellow-500/20',
  none: '',
};

const paddingStyles: Record<PaddingSize, string> = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function Card({
  children,
  className,
  glow = 'none',
  hover = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl border shadow-sm backdrop-blur-xl',
        'bg-[var(--bg-card)] border-[var(--border-color)]',
        hover && 'cursor-pointer hover:shadow-md hover:border-[var(--border-hover)]',
        glowStyles[glow],
        paddingStyles[padding],
        className,
      )}
      style={{ boxShadow: hover ? undefined : 'var(--card-shadow, 0 1px 3px rgba(0,0,0,0.08))' }}
    >
      {children}
    </motion.div>
  );
}
