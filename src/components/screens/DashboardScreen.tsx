'use client';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { mockLeaderboard } from '@/lib/mock-data';
import { formatTime } from '@/lib/utils';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { Badge } from '@/components/atoms/Badge';
import { useState, useMemo } from 'react';
import { useTimer } from '@/hooks/useTimer';
import { RankBadge } from '@/components/RankBadge';
import { DAILY_QUOTES } from '@/lib/constants';

export function DashboardScreen() {
  useTimer();
  const {
    user, tasks,
    isRunning, elapsed, pomDone,
    activeSubject,
    startTimer, pauseTimer, stopTimer,
    addTask,
    setActiveTab,
    taskHistory,
  } = useStore(useShallow(s => ({
    user: s.user,
    tasks: s.tasks,
    isRunning: s.isRunning,
    elapsed: s.elapsed,
    pomDone: s.pomDone,
    activeSubject: s.activeSubject,
    startTimer: s.startTimer,
    pauseTimer: s.pauseTimer,
    stopTimer: s.stopTimer,
    addTask: s.addTask,
    completeTask: s.completeTask,
    setActiveTab: s.setActiveTab,
    taskHistory: s.taskHistory,
  })));

  const [newTaskName, setNewTaskName] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);

  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const totalTasks = tasks.length;
  const examDaysLeft = user.examDaysLeft;

  // Daily quote (date-seeded, changes every day, deterministic)
  const dayOfYear = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    return Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);
  }, []);
  const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];

  // Task completion stats from history
  const last7 = taskHistory.slice(-7);
  const avgPct = last7.length
    ? Math.round(last7.reduce((acc, d) => acc + (d.total > 0 ? d.done / d.total : 0), 0) / last7.length * 100)
    : 0;
  const examPct = Math.round(((89 - examDaysLeft) / 89) * 100);
  const dailyPct = Math.round((user.todayHours / user.dailyGoal) * 100);

  const friendList = [
    { id: 'f1', name: 'NightWolf', emoji: '🐺', status: 'studying', statusText: 'Matematik çalışıyor · 1sa 20dk', color: '#10B981' },
    { id: 'f2', name: 'StarGazer', emoji: '⭐', status: 'break', statusText: 'Mola – 8 dk önce', color: '#F59E0B' },
    { id: 'f3', name: 'IronMind', emoji: '🧠', status: 'dnd', statusText: 'Rahatsız etme modu', color: '#EF4444' },
    { id: 'f4', name: 'DawnRider', emoji: '🌅', status: 'offline', statusText: '2 saat önce çevrimiçiydi', color: '#64748B' },
  ];

  const statusDot = (color: string) =>
    ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 } as const);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Daily Quote */}
      <div className="card" style={{
        borderLeft: `3px solid ${quote.color}`,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: 'rgba(255,255,255,.03)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: quote.color + '33',
          border: `2px solid ${quote.color}66`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700, color: quote.color,
        }}>
          {quote.initials}
        </div>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>
            "{quote.text}"
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginTop: 4 }}>
            — {quote.author}
          </div>
        </div>
      </div>

      {/* Live Timer Card */}
      <div className="card card-cyan" style={{ border: '1px solid rgba(34,211,238,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: '#22D3EE', letterSpacing: 2, textTransform: 'uppercase' }}>
            AKTİF ZAMANLAYICI
          </span>
          <Badge variant="cyan">POMODORO</Badge>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div
            style={{
              fontFamily: 'Orbitron',
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: 3,
              background: isRunning ? 'linear-gradient(135deg, #7B5CF5, #22D3EE)' : 'none',
              WebkitBackgroundClip: isRunning ? 'text' : 'unset',
              WebkitTextFillColor: isRunning ? 'transparent' : 'var(--dim)',
              animation: isRunning ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
            }}
          >
            {formatTime(elapsed)}
          </div>
          {!isRunning && elapsed === 0 && (
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)', marginTop: 4 }}>
              BAŞLAMAK İÇİN TIKLA
            </div>
          )}
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 10 }}>
          📐 {activeSubject} · {pomDone + 1}. Pomodoro
        </div>
        {/* Pom dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          {[0, 1, 2, 3].map(i => {
            const isDone = i < pomDone;
            const isActive = i === pomDone;
            return (
              <div
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: isDone ? '#22D3EE' : isActive ? '#7B5CF5' : 'rgba(255,255,255,.15)',
                  boxShadow: isDone ? '0 0 4px #22D3EE' : isActive ? '0 0 4px #7B5CF5' : 'none',
                  animation: isActive && isRunning ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                }}
              />
            );
          })}
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button
            onClick={isRunning ? pauseTimer : startTimer}
            className="btn-gradient"
            style={{ padding: '10px 28px' }}
          >
            {isRunning ? '⏸ DURAKLAT' : '▶ BAŞLAT'}
          </button>
          <button
            onClick={stopTimer}
            style={{
              background: 'rgba(239,68,68,.1)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 8,
              color: '#EF4444',
              fontFamily: 'Orbitron',
              fontSize: 10,
              fontWeight: 700,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            ⏹ BİTİR
          </button>
        </div>
      </div>

      {/* Exam Countdown */}
      <div className="card card-amber" style={{ border: '1px solid rgba(245,158,11,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, color: '#F59E0B', letterSpacing: 1 }}>
            YKS GERİ SAYIM
          </span>
          <Badge
            variant={examDaysLeft < 30 ? 'red' : 'amber'}
            pulse={examDaysLeft < 7}
          >
            {examDaysLeft < 30 ? 'ACİL' : `-${examDaysLeft} GÜN`}
          </Badge>
        </div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 8 }}>
          Hedef: günde {user.dailyGoal} saat · Şu an: {user.todayHours} saat/gün
        </div>
        <ProgressBar value={examPct} variant="amber" height={6} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Geçen: %{examPct} hazırlık</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Kalan: {user.examGoalHours - user.totalHours} saat</span>
        </div>
      </div>

      {/* 3-column stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          {
            label: 'BUGÜN',
            value: user.todayHours.toFixed(1),
            sub: 'saat ✓',
            color: '#22D3EE',
            pct: dailyPct,
            extra: dailyPct >= 100 ? '🎯 HEDEF TAMAM!' : undefined,
            extraColor: '#10B981',
          },
          {
            label: 'SERİ',
            value: String(user.streak),
            sub: '🔥 gün',
            color: '#F59E0B',
            pct: (user.streak / 30) * 100,
          },
          {
            label: 'HEDEF',
            value: `${user.todayHours.toFixed(1)}/${user.dailyGoal}`,
            sub: `${(user.dailyGoal - user.todayHours).toFixed(1)} saat kaldı`,
            color: '#7B5CF5',
            pct: dailyPct,
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ borderTop: `2px solid ${s.color}`, padding: 10 }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: s.extra ? (s.extraColor || s.color) : 'var(--muted)' }}>
              {s.extra || s.sub}
            </div>
            <div className="progress-track" style={{ height: 3, marginTop: 4 }}>
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, s.pct)}%`, height: '100%', background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Rank Section */}
      <div className="card" style={{ border: '1px solid rgba(123,92,245,.15)', padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: 'var(--purple)', letterSpacing: 2 }}>RANK</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
            {user.rankTier !== 'Usta' ? `${user.lp} LP / 100 LP` : `${user.lp} LP`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RankBadge tier={user.rankTier} division={user.rankDivision} lp={user.lp} size="md" />
          <div style={{ flex: 1 }}>
            {user.rankTier !== 'Usta' && (
              <div className="progress-track" style={{ height: 5, borderRadius: 3 }}>
                <div className="progress-fill" style={{
                  width: `${Math.min(100, user.lp)}%`, height: '100%',
                  background: 'linear-gradient(90deg, var(--purple), var(--cyan))',
                  borderRadius: 3, transition: 'width .4s ease',
                }} />
              </div>
            )}
            {user.rankTier === 'Usta' && (
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Maksimum rank — LP birikim devam ediyor</div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Task List */}
      <div>
        <SectionLabel>GÜNÜN GÖREVLERİ · {doneTasks}/{totalTasks}</SectionLabel>
        <ProgressBar value={(doneTasks / Math.max(1, totalTasks)) * 100} height={3} className="mb-2" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {tasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                Bugün henüz görev yok. AI plan oluştur?
              </div>
              <button
                className="btn-gradient"
                style={{ padding: '8px 20px' }}
                onClick={() => setActiveTab('plan')}
              >
                PLAN OLUŞTUR
              </button>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="card"
                style={{
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  opacity: task.status === 'done' ? 0.5 : 1,
                  borderLeft: `3px solid ${task.subjectColor}`,
                  animation: task.status === 'active' ? 'pulse-glow 2s ease-in-out infinite' : 'none',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: `${task.subjectColor}1A`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {task.subjectEmoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    {task.name}
                  </div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
                    {task.startTime}–{task.endTime}
                  </div>
                </div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: '#F59E0B', flexShrink: 0 }}>
                  +{task.coins}sa
                </div>
                {task.status === 'done' && <Badge variant="green">✅ TAM</Badge>}
                {task.status === 'active' && <Badge variant="cyan">⏱ AKTİF</Badge>}
                {task.status === 'pending' && (
                  <button
                    onClick={startTimer}
                    style={{
                      fontFamily: 'Space Mono',
                      fontSize: 9,
                      color: 'var(--dim)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    — BAŞLAT
                  </button>
                )}
              </div>
            ))
          )}
          {/* Add task */}
          <div className="card" style={{ padding: 10 }}>
            {showTaskInput ? (
              <input
                autoFocus
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newTaskName.trim()) {
                    addTask(newTaskName.trim());
                    setNewTaskName('');
                    setShowTaskInput(false);
                  }
                  if (e.key === 'Escape') setShowTaskInput(false);
                }}
                placeholder="Görev adı... (Enter ile ekle)"
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Rajdhani',
                  fontSize: 12,
                  color: 'var(--text)',
                }}
              />
            ) : (
              <button
                onClick={() => setShowTaskInput(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Rajdhani',
                  fontSize: 12,
                  color: 'var(--dim)',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                + Görev ekle...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Completion Tracker */}
      <div>
        <div className="card" style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>
              GÜNLÜK GÖREV TAKİBİ
            </span>
            <span style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#10B981' }}>
              Ort: %{avgPct}
            </span>
          </div>
          {/* Today progress */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)' }}>
                Bugün: {doneTasks}/{totalTasks} görev
              </span>
              <span style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 700, color: '#22D3EE' }}>
                %{totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0}
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${totalTasks > 0 ? Math.round(doneTasks / totalTasks * 100) : 0}%`,
                background: 'linear-gradient(90deg, #7B5CF5, #22D3EE)',
                borderRadius: 2,
                transition: 'width .3s',
              }} />
            </div>
          </div>
          {/* 7-day mini bar chart */}
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36 }}>
            {last7.map((entry, i) => {
              const pct = entry.total > 0 ? entry.done / entry.total : 0;
              const isToday = i === last7.length - 1;
              const date = new Date(entry.date);
              const dayLabel = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][date.getDay()];
              return (
                <div key={entry.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <div style={{
                    width: '100%',
                    height: Math.max(2, pct * 24),
                    background: isToday ? '#22D3EE' : pct >= 0.8 ? '#10B981' : pct >= 0.5 ? '#7B5CF5' : 'rgba(255,255,255,.2)',
                    borderRadius: 2,
                  }} />
                  <span style={{ fontFamily: 'Space Mono', fontSize: 6, color: isToday ? '#22D3EE' : 'var(--muted)' }}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Friend Activity */}
      <div>
        <SectionLabel>ARKADAŞ AKTİVİTESİ</SectionLabel>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {friendList.map(f => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--s2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {f.emoji}
              </div>
              <div style={statusDot(f.color)} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                  {f.name}
                </div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: f.color }}>
                  {f.statusText}
                </div>
              </div>
              {f.status === 'studying' && (
                <button
                  onClick={() => setActiveTab('rando')}
                  style={{
                    fontFamily: 'Space Mono',
                    fontSize: 8,
                    color: '#7B5CF5',
                    background: 'rgba(123,92,245,.1)',
                    border: '1px solid rgba(123,92,245,.3)',
                    borderRadius: 4,
                    padding: '2px 6px',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  RANDO DAVET
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div>
        <SectionLabel>HAFTALIK SIRALAMA · TOP 5</SectionLabel>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockLeaderboard.slice(0, 5).map(entry => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = medals[entry.rank - 1] || String(entry.rank);
            return (
              <div
                key={entry.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: entry.isMe ? 'rgba(123,92,245,.07)' : 'transparent',
                  borderRadius: 6,
                  padding: '4px 6px',
                  border: entry.isMe ? '1px solid rgba(123,92,245,.2)' : '1px solid transparent',
                }}
              >
                <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{medal}</span>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--s2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {entry.emoji}
                </div>
                <span
                  style={{
                    fontFamily: 'Rajdhani',
                    fontSize: 11,
                    fontWeight: 700,
                    color: entry.isMe ? '#22D3EE' : 'var(--text)',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {entry.name}{' '}
                  {entry.isMe && (
                    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>(sen)</span>
                  )}
                </span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#22D3EE', flexShrink: 0 }}>
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            );
          })}
          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Space Mono',
              fontSize: 9,
              color: 'var(--purple)',
              cursor: 'pointer',
              textAlign: 'right',
              marginTop: 4,
            }}
          >
            Tam sıralamayı gör →
          </button>
        </div>
      </div>

      {/* Streak Banner */}
      {user.streak >= 7 && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(123,92,245,.15), rgba(34,211,238,.1))',
            border: '1px solid rgba(123,92,245,.25)',
            textAlign: 'center',
            padding: 16,
          }}
        >
          <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            🔥 {user.streak} günlük seri! Bu haftayı da tamamla.
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginTop: 4 }}>
            Her gün çalışmaya devam et ve bonusları topla
          </div>
        </div>
      )}
    </div>
  );
}
