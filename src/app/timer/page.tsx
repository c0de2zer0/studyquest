'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, SkipForward, Volume2, Sparkles,
  Clock, Timer as TimerIcon, Brain, Trophy, Coins,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { SUBJECTS, TIMER_MODES } from '@/lib/constants';
import { formatTime, cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

// ─── Constants ──────────────────────────────────────────────────────────────

const CIRCLE_SIZE = 280;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 24 } },
};

// ─── Timer Page ─────────────────────────────────────────────────────────────

export default function TimerPage() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timerMode = useStore((s) => s.timerMode);
  const timerPhase = useStore((s) => s.timerPhase);
  const isRunning = useStore((s) => s.isRunning);
  const elapsed = useStore((s) => s.elapsed);
  const activeSubject = useStore((s) => s.activeSubject);
  const customWork = useStore((s) => s.customWork);
  const customBreak = useStore((s) => s.customBreak);
  const pomDone = useStore((s) => s.pomDone);
  const showSessionComplete = useStore((s) => s.showSessionComplete);
  const sessionXpEarned = useStore((s) => s.sessionXpEarned);
  const sessionCoinsEarned = useStore((s) => s.sessionCoinsEarned);
  const ambientSound = useStore((s) => s.ambientSound);

  const startTimer = useStore((s) => s.startTimer);
  const pauseTimer = useStore((s) => s.pauseTimer);
  const stopTimer = useStore((s) => s.stopTimer);
  const skipPhase = useStore((s) => s.skipPhase);
  const setTimerMode = useStore((s) => s.setTimerMode);
  const setActiveSubject = useStore((s) => s.setActiveSubject);
  const setCustomWork = useStore((s) => s.setCustomWork);
  const setCustomBreak = useStore((s) => s.setCustomBreak);
  const tickTimer = useStore((s) => s.tickTimer);
  const setAmbientSound = useStore((s) => s.setAmbientSound);
  const dismissSessionComplete = useStore((s) => s.dismissSessionComplete);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => tickTimer(), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tickTimer]);

  // Compute duration from current mode/phase
  const duration = useMemo(() => {
    if (timerMode === 'free') return Infinity;
    if (timerMode === 'custom') {
      return timerPhase === 'work' ? customWork * 60 : customBreak * 60;
    }
    const m = TIMER_MODES[timerMode];
    return timerPhase === 'work' ? m.workDuration : m.breakDuration;
  }, [timerMode, timerPhase, customWork, customBreak]);

  const remaining = Math.max(0, duration - elapsed);
  const progress = duration > 0 && duration !== Infinity ? elapsed / duration : 0;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isWork = timerPhase === 'work';
  const currentSubject = SUBJECTS.find((s) => s.name === activeSubject);
  const modeInfo = TIMER_MODES[timerMode];

  const handleModeChange = useCallback((newMode: string) => {
    setTimerMode(newMode as typeof timerMode);
  }, [setTimerMode]);

  const handlePlayPause = useCallback(() => {
    if (isRunning) pauseTimer();
    else startTimer();
  }, [isRunning, startTimer, pauseTimer]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <TimerIcon className="w-7 h-7 text-cyan-400" />
            Zamanlay\u0131c\u0131
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Odaklan, \u00e7al\u0131\u015f, b\u00fcy\u00fc
          </p>
        </div>
        <Badge variant={isWork ? 'info' : 'warning'} dot size="md">
          {isWork ? '\u00c7al\u0131\u015fma' : 'Mola'}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Timer Controls */}
        <div className="lg:col-span-3 space-y-6">
          {/* Mode Selector */}
          <motion.div variants={itemVariants}>
            <Card>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(TIMER_MODES) as [string, typeof modeInfo][]).map(([key, val]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleModeChange(key)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      timerMode === key
                        ? 'shadow-sm'
                        : 'hover:bg-[var(--hover-bg)]',
                    )}
                    style={{
                      backgroundColor: timerMode === key ? 'var(--bg-hover)' : 'var(--bg-hover)',
                      color: timerMode === key ? 'var(--text-primary)' : 'var(--text-muted)',
                      borderColor: timerMode === key ? 'var(--border-color)' : 'var(--border-color)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                  >
                    {val.label}
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Circular Timer */}
          <motion.div variants={itemVariants} className="flex flex-col items-center">
            <Card className="w-full flex flex-col items-center py-8" glow="cyan">
              {currentSubject && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <span className="text-lg">{currentSubject.emoji}</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {currentSubject.name}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: currentSubject.color }}
                  />
                </motion.div>
              )}

              <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
                <div
                  className={cn(
                    'absolute inset-0 rounded-full transition-opacity duration-500',
                    isRunning ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{
                    background: `radial-gradient(circle, rgba(0,240,255,0.04) 0%, transparent 70%)`,
                  }}
                />

                <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="transform -rotate-90">
                  <circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth={STROKE_WIDTH}
                  />
                  <motion.circle
                    cx={CIRCLE_SIZE / 2}
                    cy={CIRCLE_SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={isWork ? '#00f0ff' : '#8b5cf6'}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      filter: isWork
                        ? 'drop-shadow(0 0 8px rgba(0,240,255,0.3))'
                        : 'drop-shadow(0 0 8px rgba(139,92,246,0.3))',
                    }}
                    animate={{
                      strokeDashoffset,
                      transition: { duration: 0.5, ease: 'easeInOut' },
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={isRunning ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{ repeat: isRunning ? Infinity : 0, duration: 2, ease: 'easeInOut' }}
                    className="text-center"
                  >
                    <motion.span
                      key={`${remaining}-${timerPhase}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'text-6xl font-bold tracking-wider tabular-nums',
                        isWork ? '' : 'text-purple-500',
                      )}
                      style={{ color: isWork ? 'var(--text-primary)' : undefined }}
                    >
                      {formatTime(remaining)}
                    </motion.span>
                    <div
                      className="text-xs mt-2 font-medium uppercase tracking-widest"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {modeInfo?.label.split(' ')[0] ?? ''} {isWork ? '\u2022 WORK' : '\u2022 BREAK'}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Pomodoro Progress */}
              {timerMode === 'pomodoro' && (
                <div className="flex items-center gap-2 mt-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all duration-300',
                        i < pomDone
                          ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                          : '',
                      )}
                      style={{
                        backgroundColor: i < pomDone ? undefined : 'var(--border-color)',
                      }}
                    />
                  ))}
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                    {pomDone}/4 pomodoro
                  </span>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  variant="secondary" size="md" icon={Square}
                  onClick={skipPhase} disabled={!isRunning && elapsed === 0}
                >
                  Bitir
                </Button>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={handlePlayPause}
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border shadow-sm',
                      isRunning
                        ? 'from-yellow-50 to-orange-50 border-yellow-300'
                        : 'from-cyan-50 to-purple-50 border-cyan-300',
                    )}
                    style={{
                      background: isRunning
                        ? 'linear-gradient(135deg, rgba(255,255,0,0.08), rgba(255,165,0,0.08))'
                        : 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(139,92,246,0.08))',
                    }}
                  >
                    {isRunning ? (
                      <Pause className="w-7 h-7 text-yellow-500" />
                    ) : (
                      <Play className="w-7 h-7 text-cyan-500 ml-0.5" />
                    )}
                  </button>
                </motion.div>

                <Button
                  variant="secondary" size="md" icon={SkipForward}
                  onClick={stopTimer}
                  disabled={!isRunning && elapsed === 0}
                >
                  Stop
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Custom Mode Inputs */}
          {timerMode === 'custom' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                  S\u00fcre Ayarlar\u0131
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="\u00c7al\u0131\u015fma (dk)" type="number" min={1} max={999}
                    value={customWork}
                    onChange={(e) => setCustomWork(Number(e.target.value))}
                    icon={Clock}
                  />
                  <Input
                    label="Mola (dk)" type="number" min={1} max={999}
                    value={customBreak}
                    onChange={(e) => setCustomBreak(Number(e.target.value))}
                    icon={Brain}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right: Subject & Ambient */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Selector */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Ders Se\u00e7imi
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((subj) => (
                  <motion.button
                    key={subj.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveSubject(subj.name)}
                    className={cn(
                      'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm',
                      activeSubject === subj.name ? 'border' : 'border',
                    )}
                    style={{
                      backgroundColor: activeSubject === subj.name ? `${subj.color}10` : 'var(--bg-hover)',
                      borderColor: activeSubject === subj.name ? `${subj.color}30` : 'var(--border-color)',
                      color: activeSubject === subj.name ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <span>{subj.emoji}</span>
                    <span>{subj.name}</span>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Ambient Sound */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Volume2 className="w-4 h-4 text-purple-400" />
                Ortam Sesi
              </h3>
              <Select
                options={[
                  { value: '', label: 'Ses yok' },
                  ...['rain', 'cafe', 'ocean', 'forest', 'lofi', 'white'].map((id) => ({
                    value: id,
                    label: id,
                  })),
                ]}
                value={ambientSound ?? ''}
                onChange={(v) => setAmbientSound(v || null)}
                placeholder="Ses se\u00e7..."
              />
            </Card>
          </motion.div>

          {/* Session Stats */}
          <motion.div variants={itemVariants}>
            <Card>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Trophy className="w-4 h-4" style={{ color: '#ffd700' }} />
                Oturum Bilgisi
              </h3>
              <div className="space-y-3">
                <div
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Mod</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {modeInfo?.label}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ders</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {currentSubject?.emoji} {currentSubject?.name}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ge\u00e7en S\u00fcre</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatTime(elapsed)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kazan\u0131lan XP</span>
                  <span className="text-sm font-medium text-cyan-500">
                    +{Math.round((elapsed / 60) * 3)} XP
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Session Complete Modal */}
      <Modal isOpen={showSessionComplete} onClose={dismissSessionComplete} size="md">
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-50 to-purple-50 border border-cyan-200 mx-auto flex items-center justify-center"
          >
            <Trophy className="w-10 h-10" style={{ color: '#ffd700' }} />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Seans Tamamland\u0131!
            </h2>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              Harika i\u015f \u00e7\u0131kard\u0131n
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <Coins className="w-5 h-5 mx-auto mb-1" style={{ color: '#ffd700' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffd700' }}>
                +{sessionCoinsEarned}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Coin</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-500">+{sessionXpEarned}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>XP</p>
            </div>
          </div>

          <div
            className="p-3 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-hover)',
              borderColor: 'var(--border-color)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              S\u00fcre: {formatTime(elapsed > 0 ? elapsed : duration)} &middot;{' '}
              Ders: {currentSubject?.emoji} {currentSubject?.name}
            </p>
          </div>

          <Button variant="primary" onClick={dismissSessionComplete}>
            Devam Et
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
