'use client';

import { motion } from 'framer-motion';
import {
  Crown, TrendingUp, TrendingDown, Minus, Medal,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { LeaderboardEntry } from '@/lib/mock-data';
import { cn, formatHours } from '@/lib/utils';
import ProgressBar from '@/components/ui/ProgressBar';

// ─── Animation Variants ────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const podiumContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const podiumItem = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
};

const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 180, damping: 22 },
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const podiumColors = {
  1: { bg: 'from-yellow-100 to-amber-50', border: 'border-yellow-300', text: 'text-amber-600', blockH: 'h-32' },
  2: { bg: 'from-gray-100 to-gray-50', border: 'border-gray-200', text: 'text-gray-500', blockH: 'h-24' },
  3: { bg: 'from-orange-100 to-amber-50', border: 'border-orange-200', text: 'text-orange-600', blockH: 'h-20' },
};

function getTrendIcon(trend: number) {
  if (trend > 0) return { icon: TrendingUp, color: 'text-emerald-600' };
  if (trend < 0) return { icon: TrendingDown, color: 'text-red-500' };
  return { icon: Minus, color: 'text-[var(--text-muted)]' };
}

function getRankBadge(rank: number): string {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return `${rank}`;
}

// ─── Podium Card ──────────────────────────────────────────────────────────

function PodiumCard({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}) {
  const colors = podiumColors[position];
  const isFirst = position === 1;

  return (
    <motion.div
      variants={podiumItem}
      className={cn(
        'flex flex-col items-center gap-3',
        isFirst ? 'order-2' : position === 2 ? 'order-1' : 'order-3',
      )}
    >
      {/* Crown for 1st */}
      {isFirst && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="relative"
        >
          <Crown className="w-7 h-7 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]" />
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(234,179,8,0)', '0 0 16px rgba(234,179,8,0.3)', '0 0 0px rgba(234,179,8,0)'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="absolute inset-0 w-7 h-7 rounded-full"
          />
        </motion.div>
      )}

      {/* Emoji */}
      <motion.div
        whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
        className={cn(
          'flex items-center justify-center rounded-full border-2 shadow-sm',
          isFirst ? 'w-16 h-16 text-3xl' : 'w-13 h-13 text-2xl',
          colors.border,
        )}
        style={{ backgroundColor: 'var(--bg-surface)' }}
      >
        {entry.emoji}
      </motion.div>

      {/* Name + Score */}
      <div className="text-center">
        <p className={cn(
          'font-bold truncate max-w-[120px]',
          isFirst ? 'text-base' : 'text-sm',
          'text-[var(--text-primary)]',
        )}>
          {entry.name}
        </p>
        <p className={cn('font-bold', colors.text, isFirst ? 'text-lg' : 'text-sm')}>
          {entry.score.toLocaleString()}
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">Seviye {entry.level}</p>
      </div>

      {/* Podium block */}
      <div className={cn(
        'w-full rounded-lg bg-gradient-to-t',
        colors.bg,
        colors.border,
        'border shadow-sm',
        colors.blockH,
        'flex items-end justify-center pb-2',
      )}>
        <span className={cn('font-bold text-lg', colors.text)}>
          {getRankBadge(position)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Ranked Row ───────────────────────────────────────────────────────────

function RankedRow({ entry }: { entry: LeaderboardEntry }) {
  const TrendIcon = getTrendIcon(entry.trend);
  const isMe = entry.isMe;
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      variants={listItem}
      layout
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors',
        isMe
          ? 'bg-purple-50 border border-purple-200'
          : entry.rank % 2 === 0
            ? 'bg-[var(--bg-hover)] border border-transparent'
            : 'border border-transparent',
      )}
    >
      {/* Rank badge */}
      <div className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm shrink-0',
        isTop3
          ? 'bg-gradient-to-br from-yellow-100 to-amber-50 border border-yellow-200'
          : 'bg-[var(--bg-hover)] border border-[var(--border-subtle)] text-[var(--text-muted)]',
        isMe && !isTop3 && 'bg-purple-100 border-purple-200 text-purple-700',
      )}>
        {isTop3 ? (
          <span className="text-base">{getRankBadge(entry.rank)}</span>
        ) : (
          <span className={cn(isMe && 'text-purple-700')}>
            {getRankBadge(entry.rank)}
          </span>
        )}
      </div>

      {/* Emoji */}
      <span className="text-xl shrink-0">{entry.emoji}</span>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isMe ? 'text-purple-700' : 'text-[var(--text-primary)]',
        )}>
          {entry.name}
          {isMe && (
            <span className="ml-2 text-[10px] text-purple-400 font-normal">(sen)</span>
          )}
        </p>
        <p className="text-[11px] text-[var(--text-muted)]">Seviye {entry.level}</p>
      </div>

      {/* XP + Progress Bar */}
      <div className="hidden sm:flex items-center gap-3 min-w-0 w-44">
        <div className="flex-1">
          <ProgressBar
            value={entry.xp}
            max={entry.maxXp ?? entry.score}
            color={isMe ? 'purple' : entry.rank <= 3 ? 'gold' : 'cyan'}
            size="sm"
          />
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-medium whitespace-nowrap w-16 text-right">
          {entry.xp.toLocaleString()} XP
        </span>
      </div>

      {/* Mobile XP */}
      <span className="sm:hidden text-xs text-[var(--text-muted)] font-medium">
        {entry.xp.toLocaleString()} XP
      </span>

      {/* Hours */}
      <div className="hidden lg:block text-xs text-[var(--text-muted)] w-16 text-right">
        {formatHours(entry.totalHours)}
      </div>

      {/* Trend icon */}
      <motion.div
        key={entry.trend}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="shrink-0"
      >
        <TrendIcon.icon className={cn('w-4 h-4', TrendIcon.color)} />
      </motion.div>
    </motion.div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const leaderboard = useStore((s) => s.leaderboard);
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={listItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12), rgba(217, 119, 6, 0.05))',
              border: '1px solid rgba(234, 179, 8, 0.2)',
            }}
          >
            <Medal className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Liderlik Tablosu</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">En \u00e7ok XP kazanan \u00f6\u011frenciler</p>
          </div>
        </div>

        {/* Total count */}
        <div
          className="px-4 py-2 rounded-xl"
          style={{
            backgroundColor: 'var(--bg-hover)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)] font-semibold">{leaderboard.length}</span> \u00f6\u011frenci
          </p>
        </div>
      </motion.div>

      {/* Podium */}
      <motion.div
        variants={podiumContainer}
        initial="hidden"
        animate="show"
        className="flex items-end justify-center gap-4 px-4"
        style={{ minHeight: 200 }}
      >
        {/* 2nd place */}
        <PodiumCard entry={top3[1]} position={2} />

        {/* 1st place */}
        <PodiumCard entry={top3[0]} position={1} />

        {/* 3rd place */}
        <PodiumCard entry={top3[2]} position={3} />
      </motion.div>

      {/* Ranked List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-1"
      >
        {/* Column headers */}
        <motion.div
          variants={listItem}
          className="flex items-center gap-3 px-4 py-2 text-[10px] text-[var(--text-muted)] uppercase tracking-wider"
        >
          <div className="w-9" />
          <div className="w-8" />
          <div className="flex-1">\u0130sim</div>
          <div className="hidden sm:block w-44 text-right">XP</div>
          <div className="hidden lg:block w-16 text-right">S\u00fcre</div>
          <div className="w-4" />
        </motion.div>

        {rest.map((entry) => (
          <RankedRow key={entry.rank} entry={entry} />
        ))}
      </motion.div>

      {/* Bottom decorative gradient */}
      <div
        className="h-16 rounded-2xl"
        style={{
          background: 'linear-gradient(to top, rgba(0, 240, 255, 0.04), transparent)',
        }}
      />
    </motion.div>
  );
}
