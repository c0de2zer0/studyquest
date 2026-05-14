'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords, Gift, Users, Clock, ChevronDown, LogIn, LogOut,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import type { Tournament } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// ─── Animation Variants ────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 200, damping: 22 },
  },
};

// ─── Status Helpers ────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'default' | 'purple'; dot: boolean }> = {
  active: { label: 'Aktif', variant: 'success', dot: true },
  tomorrow: { label: 'Yar\u0131n', variant: 'info', dot: true },
  open: { label: 'A\u00e7\u0131k', variant: 'warning', dot: true },
  soon: { label: 'Yak\u0131nda', variant: 'default', dot: false },
  upcoming: { label: 'Gelecek', variant: 'purple', dot: false },
};

function getRankEmoji(rank: number): string {
  if (rank === 1) return '\u{1F947}';
  if (rank === 2) return '\u{1F948}';
  if (rank === 3) return '\u{1F949}';
  return `#${rank}`;
}

// ─── Tournament Card ──────────────────────────────────────────────────────

function TournamentCard({
  tournament,
  isExpanded,
  onToggleExpand,
  onJoin,
}: {
  tournament: Tournament;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onJoin: () => void;
}) {
  const config = statusConfig[tournament.status] ?? statusConfig.upcoming;

  return (
    <motion.div variants={cardItem} layout>
      <Card
        glow={tournament.joined ? 'cyan' : 'none'}
        hover
        padding="lg"
        className="group relative overflow-hidden"
      >
        {/* Subtle gradient accent at top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-60"
          style={{ background: `linear-gradient(90deg, ${tournament.color}, transparent)` }}
        />

        {/* Emoji + Status row */}
        <div className="flex items-start justify-between mb-4">
          <motion.span
            className="text-4xl leading-none"
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
          >
            {tournament.emoji}
          </motion.span>
          <Badge variant={config.variant} dot={config.dot} size="sm">
            {config.label}
          </Badge>
        </div>

        {/* Name + Rule */}
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{tournament.name}</h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{tournament.rule}</p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" style={{ color: tournament.color }} />
            {tournament.prize}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {tournament.participants}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {tournament.timeLeft}
          </span>
        </div>

        {/* Join Button + Rank */}
        <div className="flex items-center gap-3">
          <Button
            variant={tournament.joined ? 'secondary' : 'primary'}
            size="sm"
            icon={tournament.joined ? LogOut : LogIn}
            onClick={onJoin}
            className="flex-1"
          >
            {tournament.joined ? 'Ayr\u0131l' : 'Kat\u0131l'}
          </Button>

          {tournament.joined && tournament.myRank != null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{
                backgroundColor: 'rgba(0, 240, 255, 0.08)',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                color: 'var(--color-cyan-500)',
              }}
            >
              #{tournament.myRank}
            </motion.div>
          )}
        </div>

        {/* Expand toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleExpand}
          className={cn(
            'flex items-center justify-center w-full mt-3 pt-3 border-t text-xs transition-colors gap-1',
            'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
          )}
        >
          <span>{isExpanded ? 'Daha Az' : 'Detaylar'}</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
        </motion.button>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">\u00d6d\u00fcl</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5" style={{ color: tournament.color }} />
                      {tournament.prize}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Kat\u0131l\u0131mc\u0131</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {tournament.participants} ki\u015fi
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Kalan S\u00fcre</p>
                    <p className="text-sm text-[var(--text-primary)] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {tournament.timeLeft}
                    </p>
                  </div>
                  {tournament.joined && tournament.myRank != null ? (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: 'rgba(0, 200, 214, 0.06)',
                        border: '1px solid rgba(0, 200, 214, 0.2)',
                      }}
                    >
                      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(0, 200, 214, 0.6)' }}>S\u0131ralaman</p>
                      <p className="text-sm font-bold" style={{ color: 'var(--color-cyan-500)' }}>{getRankEmoji(tournament.myRank)}</p>
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Kural</p>
                      <p className="text-xs text-[var(--text-secondary)]">{tournament.rule}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────

export default function TournamentPage() {
  const tournaments = useStore((s) => s.tournaments);
  const joinTournament = useStore((s) => s.joinTournament);
  const expandedTournaments = useStore((s) => s.expandedTournaments);
  const toggleExpandTournament = useStore((s) => s.toggleExpandTournament);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={cardItem}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(139, 92, 246, 0.05))',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          >
            <Swords className="w-6 h-6" style={{ color: 'var(--color-cyan-500)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Turnuvalar</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {tournaments.filter((t) => t.joined).length} aktif kat\u0131l\u0131m\u0131n var
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-3 py-2 rounded-xl"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <p className="text-emerald-600 text-xs font-semibold">
              {tournaments.filter((t) => t.status === 'active').length} Aktif
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-3 py-2 rounded-xl"
            style={{
              backgroundColor: 'rgba(0, 200, 214, 0.08)',
              border: '1px solid rgba(0, 200, 214, 0.2)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--color-cyan-500)' }}>
              {tournaments.filter((t) => t.status === 'open').length} A\u00e7\u0131k
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Tournament Grid */}
      <motion.div variants={cardItem} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            tournament={tournament}
            isExpanded={expandedTournaments.includes(tournament.id)}
            onToggleExpand={() => toggleExpandTournament(tournament.id)}
            onJoin={() => joinTournament(tournament.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
