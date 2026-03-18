'use client';
import { useStore } from '@/store';
import { useTimer } from '@/hooks/useTimer';
import { formatTime } from '@/lib/utils';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { TIMER_MODES, AMBIENT_SOUNDS, SUBJECTS } from '@/lib/constants';
import { useState } from 'react';

const TIMER_MODES_LIST = [
  { key: 'pomodoro' as const, label: '🍅 Pomodoro 25/5' },
  { key: 'long' as const, label: '🧘 Uzun 90dk' },
  { key: 'custom' as const, label: '⚙️ Özel' },
  { key: 'free' as const, label: '🌊 Serbest' },
];

export function TimerScreen() {
  useTimer();
  const {
    timerMode, timerPhase, elapsed, isRunning, pomDone,
    activeSubject, showSessionComplete, sessionXpEarned, sessionCoinsEarned,
    customWork, customBreak,
    ambientSound, ambientVolume,
    setTimerMode, startTimer, pauseTimer, stopTimer, skipPhase,
    setActiveSubject, setCustomWork, setCustomBreak,
    dismissSessionComplete, setAmbientSound, setAmbientVolume,
    user,
  } = useStore(s => ({
    timerMode: s.timerMode,
    timerPhase: s.timerPhase,
    elapsed: s.elapsed,
    isRunning: s.isRunning,
    pomDone: s.pomDone,
    activeSubject: s.activeSubject,
    showSessionComplete: s.showSessionComplete,
    sessionXpEarned: s.sessionXpEarned,
    sessionCoinsEarned: s.sessionCoinsEarned,
    customWork: s.customWork,
    customBreak: s.customBreak,
    ambientSound: s.ambientSound,
    ambientVolume: s.ambientVolume,
    setTimerMode: s.setTimerMode,
    startTimer: s.startTimer,
    pauseTimer: s.pauseTimer,
    stopTimer: s.stopTimer,
    skipPhase: s.skipPhase,
    setActiveSubject: s.setActiveSubject,
    setCustomWork: s.setCustomWork,
    setCustomBreak: s.setCustomBreak,
    dismissSessionComplete: s.dismissSessionComplete,
    setAmbientSound: s.setAmbientSound,
    setAmbientVolume: s.setAmbientVolume,
    user: s.user,
  }));

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const getDuration = () => {
    if (timerMode === 'free') return Infinity;
    if (timerMode === 'custom') return timerPhase === 'work' ? customWork * 60 : customBreak * 60;
    const m = TIMER_MODES[timerMode];
    return timerPhase === 'work' ? m.workDuration : m.breakDuration;
  };
  const duration = getDuration();
  const progress = duration === Infinity ? 0 : elapsed / duration;
  const remaining = duration === Infinity ? elapsed : Math.max(0, duration - elapsed);

  // SVG ring
  const R = 90;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - progress);
  const gradientId = timerPhase === 'break' ? 'timerGradBreak' : 'timerGrad';

  const pomDots = [0, 1, 2, 3];

  if (showSessionComplete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7,8,15,.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 500,
          padding: 20,
        }}
      >
        <div className="card" style={{ textAlign: 'center', maxWidth: 360, width: '100%', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div
            style={{
              fontFamily: 'Orbitron',
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #7B5CF5, #22D3EE)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 16,
            }}
          >
            SEANS TAMAMLANDI!
          </div>
          <div className="card" style={{ padding: 12, marginBottom: 12 }}>
            {[
              { label: 'Ders', value: activeSubject, color: undefined },
              { label: 'Kazanılan XP', value: `+${sessionXpEarned} XP`, color: '#10B981' },
              { label: 'Kazanılan Bakiye', value: `+${sessionCoinsEarned.toFixed(2)} sa`, color: '#F59E0B' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{row.label}</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: 11, color: row.color || 'var(--text)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-gradient"
              style={{ flex: 1, padding: '12px 0' }}
              onClick={dismissSessionComplete}
            >
              DEVAM ET
            </button>
            <button
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 8,
                color: 'var(--muted)',
                fontFamily: 'Orbitron',
                fontSize: 9,
                cursor: 'pointer',
              }}
              onClick={() => {
                navigator.clipboard.writeText(
                  `StudyQuest'te ${activeSubject} çalıştım! +${sessionXpEarned} XP kazandım 🎯`
                );
                dismissSessionComplete();
              }}
            >
              📤 PAYLAŞ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
        {TIMER_MODES_LIST.map(m => (
          <button
            key={m.key}
            onClick={() => setTimerMode(m.key)}
            style={{
              fontFamily: 'Space Mono',
              fontSize: 9,
              padding: '6px 11px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              background: timerMode === m.key ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${timerMode === m.key ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
              color: timerMode === m.key ? '#9D82F8' : 'var(--dim)',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Custom inputs */}
      {timerMode === 'custom' && (
        <div className="card" style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Çalışma (dk)', value: customWork, set: setCustomWork },
            { label: 'Mola (dk)', value: customBreak, set: setCustomBreak },
          ].map(f => (
            <div key={f.label} style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 4 }}>
                {f.label}
              </div>
              <input
                type="number"
                value={f.value}
                min={1}
                max={120}
                onChange={e => f.set(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'var(--s2)',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 6,
                  padding: '6px 8px',
                  color: 'var(--text)',
                  fontFamily: 'Orbitron',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Timer Ring */}
      <div className="card" style={{ textAlign: 'center', padding: 24, position: 'relative' }}>
        {/* Outer decorative ring */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 220,
            height: 220,
            borderRadius: '50%',
            border: '1px solid rgba(123,92,245,.2)',
            pointerEvents: 'none',
          }}
        />
        <svg width={200} height={200} style={{ display: 'block', margin: '0 auto' }}>
          <defs>
            <linearGradient id="timerGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#7B5CF5" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <linearGradient id="timerGradBreak" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle cx={100} cy={100} r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={6} />
          {/* Progress circle */}
          <circle
            cx={100}
            cy={100}
            r={R}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={timerMode === 'free' ? 0 : offset}
            className="timer-ring-progress"
          />
          {/* Center time text */}
          <text
            x={100}
            y={94}
            textAnchor="middle"
            style={{ fontFamily: 'Orbitron', fontSize: 36, fontWeight: 700, fill: 'url(#timerGrad)' }}
          >
            {timerMode === 'free' ? formatTime(elapsed) : formatTime(remaining)}
          </text>
          {/* Phase label */}
          <text
            x={100}
            y={116}
            textAnchor="middle"
            style={{ fontFamily: 'Space Mono', fontSize: 10, fill: 'var(--muted)' }}
          >
            {timerPhase === 'work' ? 'ÇALIŞMA' : 'MOLA'}
          </text>
        </svg>

        {/* Pom dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '12px 0 4px' }}>
          {pomDots.map(i => {
            const isDone = i < pomDone;
            const isActive = i === pomDone;
            return (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isDone ? '#22D3EE' : isActive ? '#7B5CF5' : 'rgba(255,255,255,.12)',
                  boxShadow: isDone ? '0 0 6px #22D3EE' : isActive ? '0 0 6px #7B5CF5' : 'none',
                  border: isActive ? 'none' : isDone ? 'none' : '1px solid rgba(255,255,255,.15)',
                  animation: isActive && isRunning ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
          {pomDone}/4 Pomodoro tamamlandı
        </div>
      </div>

      {/* Subject selector */}
      <div className="card card-cyan" style={{ border: '1px solid rgba(34,211,238,.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>AKTİF DERS</span>
          <button
            onClick={() => setShowSubjectPicker(!showSubjectPicker)}
            style={{
              fontFamily: 'Space Mono',
              fontSize: 8,
              color: '#22D3EE',
              background: 'rgba(34,211,238,.1)',
              border: '1px solid rgba(34,211,238,.3)',
              borderRadius: 4,
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            DEĞİŞTİR
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(123,92,245,.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {SUBJECTS.find(s => s.name === activeSubject)?.emoji || '📚'}
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              {activeSubject}
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
              Aktif görev: Elektrik Devreleri
            </div>
          </div>
        </div>
        {showSubjectPicker && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12 }}>
            {SUBJECTS.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSubject(s.name);
                  setShowSubjectPicker(false);
                }}
                style={{
                  background: activeSubject === s.name ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
                  border: `1px solid ${activeSubject === s.name ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
                  borderRadius: 6,
                  padding: '6px 4px',
                  cursor: 'pointer',
                  fontFamily: 'Space Mono',
                  fontSize: 8,
                  color: activeSubject === s.name ? '#9D82F8' : 'var(--dim)',
                  textAlign: 'center',
                }}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {showConfirm ? (
          <div className="card" style={{ width: '100%', textAlign: 'center', padding: 16 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>
              Seansı bitirmek istiyor musun?
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#10B981', marginBottom: 12 }}>
              +{Math.round((elapsed / 60) * 3)} XP · +{(elapsed / 3600).toFixed(2)} sa kazanacaksın
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'rgba(239,68,68,.1)',
                  border: '1px solid rgba(239,68,68,.3)',
                  borderRadius: 8,
                  color: '#EF4444',
                  fontFamily: 'Orbitron',
                  fontSize: 9,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  stopTimer();
                  setShowConfirm(false);
                }}
              >
                Evet, bitir
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,.1)',
                  borderRadius: 8,
                  color: 'var(--muted)',
                  fontFamily: 'Orbitron',
                  fontSize: 9,
                  cursor: 'pointer',
                }}
                onClick={() => setShowConfirm(false)}
              >
                Hayır, devam et
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button
              className="btn-gradient"
              style={{ flex: 1, padding: '14px 0', fontSize: 11 }}
              onClick={isRunning ? pauseTimer : startTimer}
            >
              {isRunning ? '⏸ DURAKLAT' : '▶ BAŞLAT'}
            </button>
            <button
              onClick={skipPhase}
              style={{
                padding: '14px 12px',
                background: 'rgba(34,211,238,.05)',
                border: '1px solid rgba(34,211,238,.2)',
                borderRadius: 8,
                color: '#22D3EE',
                fontFamily: 'Orbitron',
                fontSize: 9,
                cursor: 'pointer',
              }}
            >
              ⏭ ATLA
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                padding: '14px 12px',
                background: 'rgba(239,68,68,.05)',
                border: '1px solid rgba(239,68,68,.2)',
                borderRadius: 8,
                color: '#EF4444',
                fontFamily: 'Orbitron',
                fontSize: 9,
                cursor: 'pointer',
              }}
            >
              ⏹ BİTİR
            </button>
          </div>
        )}
      </div>

      {/* Ambient sounds */}
      <div>
        <SectionLabel>AMBİENT SES</SectionLabel>
        <div className="card">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
            {AMBIENT_SOUNDS.map(s => {
              const isActive = ambientSound === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setAmbientSound(isActive ? null : s.id)}
                  style={{
                    background: isActive ? 'rgba(34,211,238,.1)' : 'rgba(255,255,255,.03)',
                    border: `1px solid ${isActive ? 'rgba(34,211,238,.4)' : 'rgba(255,255,255,.08)'}`,
                    borderRadius: 8,
                    padding: '10px 6px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{s.emoji}</span>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: isActive ? '#22D3EE' : 'var(--dim)' }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
          {ambientSound && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>SES</span>
              <input
                type="range"
                min={0}
                max={100}
                value={ambientVolume}
                onChange={e => setAmbientVolume(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#22D3EE' }}
              />
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>{ambientVolume}%</span>
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <a
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#F59E0B' }}
            >
              🎵 Spotify Bağla
            </a>
          </div>
        </div>
      </div>

      {/* Today summary */}
      <div>
        <SectionLabel>BUGÜNÜN ÖZETİ</SectionLabel>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            {
              label: 'Toplam Süre',
              value: `${Math.floor(user.todayHours)}sa ${Math.round((user.todayHours % 1) * 60)}dk`,
            },
            {
              label: 'Pomodoro',
              value: `${pomDone} adet`,
            },
            {
              label: 'Seri',
              value: `${user.streak} gün 🔥`,
            },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
