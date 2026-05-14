'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shuffle, Clock, BookOpen, User, Sparkles, Play, StopCircle, Star, X, Users,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { SUBJECTS } from '@/lib/constants';
import { cn, formatTime } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// ─── Constants ──────────────────────────────────────────────────────────────

const DURATIONS = [15, 30, 45, 60];
const FORMATS = [
  { id: 'silent', label: 'Sessiz', icon: '\u{1F507}' },
  { id: 'chat', label: 'Sohbet', icon: '\u{1F4AC}' },
  { id: 'voice', label: 'Sesli', icon: '\u{1F3A4}' },
];
const SEGMENT_ANGLE = 360 / SUBJECTS.length;

// ─── Helpers ────────────────────────────────────────────────────────────────

function conicWheelGradient(): string {
  return SUBJECTS.map((s, i) => {
    const start = i * SEGMENT_ANGLE;
    const end = (i + 1) * SEGMENT_ANGLE;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');
}

// ─── Pill ───────────────────────────────────────────────────────────────────

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 border shadow-sm',
        active
          ? 'bg-[var(--bg-hover)] border-[var(--border-color)] text-[var(--text-primary)]'
          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-color)]',
      )}
    >
      {children}
    </button>
  );
}

// ─── SearchingDots ──────────────────────────────────────────────────────────

function SearchingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-cyan-500"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── StarRating ─────────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(star)}
          className="relative"
        >
          <Star
            className={cn(
              'w-8 h-8 transition-all duration-200',
              star <= value
                ? 'text-amber-500 fill-amber-500'
                : 'text-[var(--text-muted)]',
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RandoPage() {
  const randoState = useStore((s) => s.randoState);
  const randoSubject = useStore((s) => s.randoSubject);
  const randoDuration = useStore((s) => s.randoDuration);
  const randoFormat = useStore((s) => s.randoFormat);
  const randoOpponent = useStore((s) => s.randoOpponent);
  const randoElapsed = useStore((s) => s.randoElapsed);
  const randoStars = useStore((s) => s.randoStars);
  const setRandoState = useStore((s) => s.setRandoState);
  const setRandoSubject = useStore((s) => s.setRandoSubject);
  const setRandoDuration = useStore((s) => s.setRandoDuration);
  const setRandoFormat = useStore((s) => s.setRandoFormat);
  const setRandoOpponent = useStore((s) => s.setRandoOpponent);
  const tickRando = useStore((s) => s.tickRando);
  const setRandoStars = useStore((s) => s.setRandoStars);
  const completeRando = useStore((s) => s.completeRando);
  const cancelRando = useStore((s) => s.cancelRando);

  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  useEffect(() => {
    if (randoState === 'active') {
      const interval = setInterval(() => {
        tickRando();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [randoState, tickRando]);

  const handleFindPartner = useCallback(() => {
    if (!randoSubject) return;
    setWheelSpinning(true);
    setWheelRotation((prev) => prev + 1440 + Math.random() * 720);
    setTimeout(() => {
      setWheelSpinning(false);
      setRandoState('searching');
    }, 2000);
    setTimeout(() => {
      const names = ['Zeynep', 'Can', 'Elif', 'Mert', 'Selin', 'Burak', 'Irem', 'Ali'];
      const emojis = ['\u{1F31F}', '\u26A1', '\u{1F525}', '\u{1F48E}', '\u{1F3AF}', '\u{1F680}', '\u{1F338}', '\u{1F319}'];
      setRandoOpponent({
        name: names[Math.floor(Math.random() * names.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        level: Math.floor(Math.random() * 20) + 10,
      });
      setRandoState('matched');
    }, 3500);
  }, [randoSubject, setRandoState, setRandoOpponent]);

  const selectedSubject = SUBJECTS.find((s) => s.id === randoSubject);
  const earnedXP = Math.round((randoElapsed / 60) * 5);
  const earnedCoins = ((randoElapsed / 3600) * 2).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(0, 240, 255, 0.05))',
            border: '1px solid var(--border-color)',
          }}
        >
          <Shuffle className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Rando
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Rastgele calisma partneri
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE ──────────────────────────────────────────────────────── */}
        {randoState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Subject Wheel */}
            <div className="flex justify-center">
              <div className="relative">
                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="w-56 h-56 rounded-full shadow-sm"
                  style={{
                    background: `conic-gradient(${conicWheelGradient()})`,
                  }}
                >
                  <div
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full border-2 flex items-center justify-center shadow-sm"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <Shuffle className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </motion.div>
                {SUBJECTS.map((subject, i) => {
                  const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
                  const rad = (angle * Math.PI) / 180;
                  const radius = 90;
                  return (
                    <div
                      key={subject.id}
                      className="absolute top-1/2 left-1/2 pointer-events-none"
                      style={{
                        transform: `translate(calc(-50% + ${Math.cos(rad) * radius}px), calc(-50% + ${Math.sin(rad) * radius}px))`,
                      }}
                    >
                      <span className="text-lg">{subject.emoji}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subject Selection */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-cyan-600" />
                <h2
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Ders
                </h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SUBJECTS.map((subject) => (
                  <motion.button
                    key={subject.id}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      setRandoSubject(randoSubject === subject.id ? '' : subject.id)
                    }
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-300 shadow-sm',
                      randoSubject === subject.id
                        ? 'border-[var(--border-color)] bg-[var(--bg-hover)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-color)]',
                    )}
                  >
                    <span className="text-lg">{subject.emoji}</span>
                    <span
                      className="text-[10px] font-medium truncate w-full text-center"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {subject.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Duration + Format */}
            <div className="grid grid-cols-2 gap-4">
              <Card padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Sure
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <Pill
                      key={d}
                      active={randoDuration === d * 60}
                      onClick={() => setRandoDuration(d * 60)}
                    >
                      {d} dk
                    </Pill>
                  ))}
                </div>
              </Card>
              <Card padding="md">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <h3
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Format
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {FORMATS.map((f) => (
                    <Pill
                      key={f.id}
                      active={randoFormat === f.id}
                      onClick={() => setRandoFormat(f.id)}
                    >
                      {f.icon} {f.label}
                    </Pill>
                  ))}
                </div>
              </Card>
            </div>

            {/* Find Partner Button */}
            <div className="flex justify-center pt-2">
              <Button
                size="lg"
                icon={Shuffle}
                disabled={!randoSubject || wheelSpinning}
                onClick={handleFindPartner}
              >
                {wheelSpinning ? 'Donuyor...' : 'Partner Bul'}
              </Button>
            </div>
            {!randoSubject && (
              <p
                className="text-center text-xs -mt-4"
                style={{ color: 'var(--text-muted)' }}
              >
                Baslamak icin bir ders sec
              </p>
            )}
          </motion.div>
        )}

        {/* ── SEARCHING ──────────────────────────────────────────────────── */}
        {randoState === 'searching' && (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <Card className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-6 rounded-full border-2"
                style={{
                  borderColor: 'rgba(6, 182, 212, 0.3)',
                  borderTopColor: '#06b6d4',
                }}
              />
              <SearchingDots />
              <p
                className="text-lg font-medium mt-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Calisma partneri araniyor...
              </p>
              <p
                className="text-sm mt-1.5 max-w-xs mx-auto"
                style={{ color: 'var(--text-secondary)' }}
              >
                Seninle{' '}
                <span style={{ color: 'var(--text-primary)' }}>
                  {selectedSubject?.emoji} {selectedSubject?.name}
                </span>{' '}
                dersinde {randoDuration / 60} dk calisacak birini eslestiriyoruz
              </p>
              <div className="mt-8">
                <Button variant="ghost" size="sm" icon={X} onClick={cancelRando}>
                  Iptal
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── MATCHED ────────────────────────────────────────────────────── */}
        {randoState === 'matched' && randoOpponent && (
          <motion.div
            key="matched"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.1,
              }}
              className="text-center"
            >
              <div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl border shadow-sm"
                style={{
                  background: 'linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.08))',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                }}
              >
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Eslesme Bulundu!
                </span>
                <Sparkles className="w-5 h-5 text-emerald-600" />
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Card glow="cyan" className="text-center py-10">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-6xl mb-4"
                >
                  {randoOpponent.emoji}
                </motion.div>
                <h2
                  className="text-xl font-bold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {randoOpponent.name}
                </h2>
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span
                    className="text-sm"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Seviye {randoOpponent.level}
                  </span>
                </div>

                {/* Session info row */}
                <div
                  className="mt-5 flex items-center justify-center gap-6 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <div className="text-center">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {selectedSubject?.emoji}
                    </p>
                    <p className="text-xs mt-0.5">{selectedSubject?.name}</p>
                  </div>
                  <div
                    className="w-px h-8"
                    style={{ backgroundColor: 'var(--border-subtle)' }}
                  />
                  <div className="text-center">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {randoDuration / 60}
                    </p>
                    <p className="text-xs mt-0.5">dakika</p>
                  </div>
                  <div
                    className="w-px h-8"
                    style={{ backgroundColor: 'var(--border-subtle)' }}
                  />
                  <div className="text-center">
                    <p
                      className="text-lg font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {FORMATS.find((f) => f.id === randoFormat)?.icon}
                    </p>
                    <p className="text-xs mt-0.5">
                      {FORMATS.find((f) => f.id === randoFormat)?.label}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="flex justify-center">
              <Button
                size="lg"
                icon={Play}
                onClick={() => setRandoState('active')}
              >
                Oturumu Baslat
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── ACTIVE ─────────────────────────────────────────────────────── */}
        {randoState === 'active' && randoOpponent && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Card glow="cyan" className="text-center py-10">
              <p
                className="text-xs font-medium uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Calisma Oturumu
              </p>
              <motion.p
                key={randoElapsed}
                initial={{ scale: 1.1, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold tabular-nums tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatTime(randoElapsed)}
              </motion.p>
              <p
                className="text-sm mt-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {selectedSubject?.emoji} {selectedSubject?.name} &middot;{' '}
                {randoDuration / 60} dk
              </p>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="text-4xl">{randoOpponent.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-semibold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {randoOpponent.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Seviye {randoOpponent.level} &middot; Seninle calisiyor
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <span className="text-sm">
                    {randoFormat === 'silent'
                      ? '\u{1F507}'
                      : randoFormat === 'chat'
                        ? '\u{1F4AC}'
                        : '\u{1F3A4}'}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {FORMATS.find((f) => f.id === randoFormat)?.label}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-3 px-2">
                <BookOpen className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Calisilan ders: {selectedSubject?.emoji} {selectedSubject?.name}
                </span>
              </div>
            </Card>

            <div className="flex justify-center pt-2">
              <Button
                variant="danger"
                size="lg"
                icon={StopCircle}
                onClick={completeRando}
              >
                Oturumu Bitir
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── COMPLETE ───────────────────────────────────────────────────── */}
        {randoState === 'complete' && randoOpponent && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <Card glow="gold" className="text-center py-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-4" />
              </motion.div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Oturum Tamamlandi!
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: 'var(--text-secondary)' }}
              >
                Calisma oturunu degerlendir
              </p>
              <div className="flex justify-center">
                <StarRating value={randoStars} onChange={setRandoStars} />
              </div>
              {randoStars > 0 && (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs mt-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {randoStars <= 2
                    ? 'Zorlu bir oturumdu, devam et!'
                    : randoStars === 3
                      ? 'Iyi odaklandin!'
                      : randoStars === 4
                        ? 'Harika bir oturum!'
                        : 'Mukemmel odak!'}
                </motion.p>
              )}
            </Card>

            {/* Summary */}
            <Card>
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                Oturum Ozeti
              </h3>
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Sure
                    </span>
                  </div>
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatTime(randoElapsed)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Ders
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {selectedSubject?.emoji} {selectedSubject?.name}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Format
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {FORMATS.find((f) => f.id === randoFormat)?.icon}{' '}
                    {FORMATS.find((f) => f.id === randoFormat)?.label}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Partner
                    </span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {randoOpponent.emoji} {randoOpponent.name}
                  </span>
                </div>
              </div>
            </Card>

            {/* Rewards */}
            <Card glow="purple">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-4"
                style={{ color: 'var(--text-secondary)' }}
              >
                Kazanilan Oduller
              </h3>
              <div className="flex items-center justify-center gap-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-purple-600">+{earnedXP}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    XP Kazanilan
                  </p>
                </motion.div>
                <div
                  className="w-px h-12"
                  style={{ backgroundColor: 'var(--border-subtle)' }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-amber-600">+{earnedCoins}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Coin Kazanilan
                  </p>
                </motion.div>
              </div>
            </Card>

            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                size="lg"
                icon={Shuffle}
                onClick={cancelRando}
              >
                Basa Don
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
