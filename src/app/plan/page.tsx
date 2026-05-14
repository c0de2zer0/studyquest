'use client';

import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, List,
  CheckCircle2, Clock, BookOpen,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { mockWeeklyCalendar } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';

// ─── Constants ──────────────────────────────────────────────────────────────

const DAY_NAMES = ['Pzt', 'Sal', '\u00c7ar', 'Per', 'Cum', 'Cmt', 'Paz'];
const DAY_NAMES_FULL = [
  'Pazartesi', 'Sal\u0131', '\u00c7ar\u015famba', 'Per\u015fembe',
  'Cuma', 'Cumartesi', 'Pazar',
];
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getWeekDays(offset: number): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  startOfWeek.setDate(today.getDate() + diff + offset * 7);
  startOfWeek.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Session = {
  id: string; subject: string; color: string; emoji: string;
  start: number; end: number; task: string; completed: boolean;
};

type CalendarData = Record<string, Session[]>;

// ─── Plan Page ──────────────────────────────────────────────────────────────

export default function PlanPage() {
  const planWeekOffset = useStore((s) => s.planWeekOffset);
  const planView = useStore((s) => s.planView);
  const setPlanWeekOffset = useStore((s) => s.setPlanWeekOffset);
  const setPlanView = useStore((s) => s.setPlanView);

  const weeklyCalendar = mockWeeklyCalendar as CalendarData;
  const weekDays = useMemo(() => getWeekDays(planWeekOffset), [planWeekOffset]);

  const prevWeek = useCallback(() => setPlanWeekOffset(planWeekOffset - 1), [planWeekOffset, setPlanWeekOffset]);
  const nextWeek = useCallback(() => setPlanWeekOffset(planWeekOffset + 1), [planWeekOffset, setPlanWeekOffset]);

  const viewTabs = [
    { id: 'week', label: 'Hafta', icon: LayoutGrid },
    { id: 'day', label: 'G\u00fcn', icon: CalendarDays },
    { id: 'list', label: 'Liste', icon: List },
  ];

  // ── Week View ──────────────────────────────────────────────────────────
  const renderWeekView = () => (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
      <div className="grid grid-cols-7 gap-3 min-w-[600px] sm:min-w-0">
      {weekDays.map((date, idx) => {
        const dayKey = DAY_KEYS[idx];
        const sessions: Session[] = weeklyCalendar[dayKey] ?? [];
        const today = isToday(date);

        return (
          <motion.div
            key={dayKey}
            variants={itemVariants}
            className={cn(
              'rounded-2xl border overflow-hidden transition-all duration-300 shadow-sm',
              'bg-[var(--bg-card)] border-[var(--border-color)]',
              today && 'border-[#00f0ff]/50 shadow-[0_0_20px_-8px_rgba(0,240,255,0.25)]',
            )}
          >
            <div className={cn(
              'text-center py-3 border-b border-[var(--border-subtle)]',
              today && 'bg-gradient-to-r from-[#00f0ff]/5 to-[#8b5cf6]/5',
            )}>
              <p className={cn(
                'text-xs font-medium uppercase tracking-wider',
                today ? 'text-[#00f0ff]' : 'text-[var(--text-muted)]',
              )}>
                {DAY_NAMES[idx]}
              </p>
              <p className={cn(
                'text-2xl font-bold mt-0.5',
                today ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
              )}>
                {date.getDate()}
              </p>
            </div>

            <div className="p-2 space-y-1.5 min-h-[120px]">
              {sessions.length === 0 ? (
                <div className="flex items-center justify-center h-20">
                  <p className="text-xs text-[var(--text-muted)]">Seans yok</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    whileHover={{ x: 2 }}
                    className={cn(
                      'p-2 rounded-xl border text-xs transition-all duration-200',
                      session.completed
                        ? 'opacity-60 border-[var(--border-subtle)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]',
                    )}
                    style={{
                      backgroundColor: `${session.color}10`,
                      borderLeftColor: session.color,
                      borderLeftWidth: 3,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span>{session.emoji}</span>
                      <span className={cn(
                        'font-medium truncate flex-1',
                        session.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-secondary)]',
                      )}>
                        {session.subject}
                      </span>
                      {session.completed && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{formatHour(session.start)} - {formatHour(session.end)}</span>
                    </div>
                    <p className="text-[var(--text-muted)] truncate mt-0.5">{session.task}</p>
                  </motion.div>
                ))
              )}

              {today && sessions.length > 0 && (
                <div className="flex items-center gap-1.5 px-1 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse" />
                  <span className="text-[10px] text-[#00f0ff]/60">Bug\u00fcn</span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
    </div>
  );

  // ── Day View ───────────────────────────────────────────────────────────
  const renderDayView = () => {
    const today = weekDays.find((d) => isToday(d)) ?? weekDays[0];
    const todayIdx = weekDays.indexOf(today);
    const dayKey = DAY_KEYS[todayIdx >= 0 ? todayIdx : 0] as string;
    const sessions: Session[] = weeklyCalendar[dayKey] ?? [];

    return (
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {DAY_NAMES_FULL[todayIdx >= 0 ? todayIdx : 0]}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Badge variant="info">{sessions.length} seans</Badge>
          </div>

          <div className="space-y-3">
            {sessions.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarDays className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Bug\u00fcn i\u00e7in planlanm\u0131\u015f seans yok
                </p>
              </div>
            ) : (
              sessions.map((session: Session, i: number) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all',
                    session.completed
                      ? 'bg-[var(--bg-hover)] border-[var(--border-subtle)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:bg-[var(--bg-hover)]',
                  )}
                >
                  <div className="text-center min-w-[60px]">
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatHour(session.start)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatHour(session.end)}
                    </p>
                  </div>
                  <div className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: session.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{session.emoji}</span>
                      <p className={cn(
                        'font-medium',
                        session.completed ? 'text-[var(--text-muted)] line-through' : '',
                      )}
                      style={{ color: session.completed ? undefined : 'var(--text-primary)' }}>
                        {session.subject}
                      </p>
                      {session.completed && <Badge variant="success" size="sm">Tamamland\u0131</Badge>}
                    </div>
                    <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      {session.task}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {session.end - session.start}sa
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  // ── List View ──────────────────────────────────────────────────────────
  const renderListView = () => {
    const allSessions = DAY_KEYS.flatMap((key, idx) =>
      (weeklyCalendar[key] ?? []).map((s: Session) => ({
        ...s,
        dayName: DAY_NAMES[idx],
        date: weekDays[idx],
      })),
    ).sort((a, b) => {
      const dayDiff = weekDays.indexOf(a.date) - weekDays.indexOf(b.date);
      if (dayDiff !== 0) return dayDiff;
      return a.start - b.start;
    });

    const completedCount = allSessions.filter((s) => s.completed).length;
    const totalCount = allSessions.length;

    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              T\u00fcm Seanslar
            </h3>
            <Badge variant="info">
              {completedCount}/{totalCount} tamamland\u0131
            </Badge>
          </div>
        </Card>

        {allSessions.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <List className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Hen\u00fcz seans eklenmemi\u015f
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {allSessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card padding="sm">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0',
                      session.completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-[var(--bg-hover)] text-[var(--text-muted)]',
                    )}>
                      {session.completed
                        ? <CheckCircle2 className="w-4 h-4" />
                        : <Clock className="w-4 h-4" />
                      }
                    </div>
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: session.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span>{session.emoji}</span>
                        <p className={cn(
                          'text-sm font-medium',
                          session.completed && 'text-[var(--text-muted)] line-through',
                        )}
                        style={{ color: session.completed ? undefined : 'var(--text-primary)' }}>
                          {session.subject}
                        </p>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {session.dayName}
                        </span>
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {session.task}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {formatHour(session.start)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {formatHour(session.end)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <CalendarDays className="w-7 h-7 text-[#a78bfa]" />
            \u00c7al\u0131\u015fma Plan\u0131
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Haftal\u0131k program\u0131n\u0131 takip et
          </p>
        </div>
        <Tabs
          tabs={viewTabs}
          activeTab={planView}
          onChange={(id) => setPlanView(id as 'week' | 'day' | 'list')}
        />
      </motion.div>

      {/* Week Navigation */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={prevWeek}>
              Ge\u00e7en Hafta
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {weekDays[0].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                {' - '}
                {weekDays[6].toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {planWeekOffset === 0 ? 'Bu Hafta' : planWeekOffset > 0 ? `${planWeekOffset} hafta sonra` : `${Math.abs(planWeekOffset)} hafta \u00f6nce`}
              </p>
            </div>
            <Button variant="ghost" size="sm" icon={ChevronRight} onClick={nextWeek}>
              Sonraki
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={planView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {planView === 'week' && renderWeekView()}
          {planView === 'day' && renderDayView()}
          {planView === 'list' && renderListView()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
