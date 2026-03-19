'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { AIPlanModal } from '@/components/AIPlanModal';
import { mockWeeklyCalendar } from '@/lib/mock-data';

const DAYS = ['Pzt', 'Sal', 'Çrş', 'Per', 'Cum', 'Cmt', 'Paz'];
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 9-22

const INTEGRATIONS = [
  { id: 'gcal', name: 'Google Calendar', emoji: '🗓️', color: '#22D3EE', status: 'connected', statusText: 'Bağlı · Son sync: 2dk önce' },
  { id: 'notion', name: 'Notion', emoji: '📋', color: '#94A3B8', status: 'connected', statusText: 'Bağlı · 3 database' },
  { id: 'obsidian', name: 'Obsidian', emoji: '⬛', color: '#7B5CF5', status: 'disconnected', statusText: 'Bağlanmadı' },
  { id: 'sheets', name: 'Google Sheets', emoji: '📊', color: '#10B981', status: 'connected', statusText: 'Bağlı · Otomatik import aktif' },
  { id: 'todoist', name: 'Todoist', emoji: '✅', color: '#EF4444', status: 'disconnected', statusText: 'Bağlanmadı' },
];

export function PlanScreen() {
  const { planView, setPlanView, planWeekOffset, setPlanWeekOffset, showToast } = useStore();
  const [showAiPlan, setShowAiPlan] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const today = new Date();
  const todayDayIdx = (today.getDay() + 6) % 7; // 0=Mon

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Week header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setPlanWeekOffset(planWeekOffset - 1)}
            style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >←</button>
          <span style={{ fontFamily: 'Orbitron', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>23–29 Aralık 2024</span>
          <button
            onClick={() => setPlanWeekOffset(planWeekOffset + 1)}
            style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--text)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >→</button>
        </div>
        <button
          className="btn-gradient"
          style={{ padding: '7px 14px', fontSize: 9 }}
          onClick={() => setShowAiPlan(true)}
        >✨ AI PLAN OLUŞTUR</button>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['week', 'day', 'list'] as const).map(v => (
          <button
            key={v}
            onClick={() => setPlanView(v)}
            style={{
              fontFamily: 'Space Mono', fontSize: 9, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              background: planView === v ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${planView === v ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
              color: planView === v ? '#9D82F8' : 'var(--dim)',
              textTransform: 'capitalize',
            }}
          >{v === 'week' ? 'Hafta' : v === 'day' ? 'Gün' : 'Liste'}</button>
        ))}
      </div>

      {/* Weekly Calendar */}
      {planView === 'week' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ minWidth: 600 }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ padding: 6 }} />
                {DAYS.map((d, i) => (
                  <div key={d} style={{
                    padding: '6px 4px', textAlign: 'center',
                    fontFamily: 'Space Mono', fontSize: 9,
                    color: i === todayDayIdx ? '#22D3EE' : 'var(--muted)',
                    borderBottom: i === todayDayIdx ? '2px solid #22D3EE' : '2px solid transparent',
                  }}>{d}</div>
                ))}
              </div>
              {/* Time rows */}
              <div style={{ position: 'relative' }}>
                {HOURS.map(hour => (
                  <div key={hour} style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', height: 44, borderTop: '1px solid rgba(255,255,255,.03)' }}>
                    <div style={{ padding: '4px 4px 0', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', textAlign: 'right' }}>{hour}:00</div>
                    {DAY_KEYS.map(day => {
                      const blocks = (mockWeeklyCalendar[day] || []).filter(b => Math.floor(b.start) === hour);
                      return (
                        <div key={day} style={{ position: 'relative', borderLeft: '1px solid rgba(255,255,255,.02)' }}>
                          {blocks.map(block => (
                            <div
                              key={block.id}
                              onClick={() => setSelectedTask(selectedTask === block.id ? null : block.id)}
                              style={{
                                position: 'absolute', top: 2, left: 2, right: 2,
                                height: `${(block.end - block.start) * 44 - 4}px`,
                                background: `${block.color}28`,
                                borderLeft: `2px solid ${block.color}`,
                                borderRadius: 4, padding: '2px 4px',
                                cursor: 'pointer', overflow: 'hidden',
                                opacity: block.completed ? 0.5 : 1,
                              }}
                            >
                              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: block.color, fontWeight: 700 }}>
                                {block.emoji} {block.subject}
                              </div>
                              {block.completed && <span style={{ position: 'absolute', right: 2, bottom: 2, fontSize: 8 }}>✓</span>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* Current time line */}
                <div style={{
                  position: 'absolute', left: 40, right: 0,
                  top: `${(new Date().getHours() - 9 + new Date().getMinutes() / 60) * 44}px`,
                  height: 1, background: 'var(--red)', opacity: 0.6,
                  pointerEvents: 'none',
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {planView === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DAY_KEYS.map((dayKey, dayIdx) => {
            const blocks = mockWeeklyCalendar[dayKey] || [];
            if (blocks.length === 0) return null;
            return (
              <div key={dayKey}>
                <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: dayIdx === todayDayIdx ? '#22D3EE' : 'var(--muted)', letterSpacing: 1, marginBottom: 4, paddingLeft: 4 }}>
                  {DAYS[dayIdx]}
                </div>
                {blocks.map(block => (
                  <div key={block.id} className="card" style={{ padding: 10, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, opacity: block.completed ? .5 : 1, borderLeft: `3px solid ${block.color}` }}>
                    <span style={{ fontSize: 16 }}>{block.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700 }}>{block.task}</div>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{block.start}:00–{block.end}:00</div>
                    </div>
                    {block.completed && <span className="badge badge-green">✓</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Day view */}
      {planView === 'day' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {Array.from({ length: 17 }, (_, i) => i + 7).map(hour => {
            const blocks = (mockWeeklyCalendar[DAY_KEYS[todayDayIdx]] || []).filter(b => Math.floor(b.start) === hour);
            return (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', height: 52, borderTop: '1px solid rgba(255,255,255,.03)' }}>
                <div style={{ padding: '6px 8px', fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', textAlign: 'right' }}>{hour}:00</div>
                <div style={{ position: 'relative', borderLeft: '1px solid rgba(255,255,255,.03)' }}>
                  {blocks.map(block => (
                    <div key={block.id} style={{
                      position: 'absolute', top: 3, left: 4, right: 4,
                      height: `${(block.end - block.start) * 52 - 6}px`,
                      background: `${block.color}28`, borderLeft: `3px solid ${block.color}`,
                      borderRadius: 4, padding: '3px 6px', overflow: 'hidden',
                    }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: block.color }}>{block.emoji} {block.task}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Integrations */}
      <div>
        <SectionLabel>ENTEGRASYONLAR</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {INTEGRATIONS.map(int => (
            <div key={int.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${int.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{int.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{int.name}</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{int.statusText}</div>
              </div>
              {int.status === 'connected' ? (
                <span className="badge badge-green">✓ AKTİF</span>
              ) : (
                <button
                  onClick={() => showToast(`${int.name} bağlantısı yapılıyor...`, 'info', int.emoji)}
                  style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#7B5CF5', background: 'rgba(123,92,245,.1)', border: '1px solid rgba(123,92,245,.3)', borderRadius: 4, padding: '4px 10px', cursor: 'pointer' }}
                >BAĞLA</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Plan Modal */}
      {showAiPlan && <AIPlanModal onClose={() => setShowAiPlan(false)} />}
    </div>
  );
}
