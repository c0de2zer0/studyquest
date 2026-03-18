'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
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

type AiStep = 'source' | 'input' | 'processing' | 'results' | 'done';

export function PlanScreen() {
  const { planView, setPlanView, planWeekOffset, setPlanWeekOffset, showToast } = useStore();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiStep, setAiStep] = useState<AiStep>('source');
  const [aiSource, setAiSource] = useState('');
  const [aiText, setAiText] = useState('');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const mockExtractedTasks = [
    { id: 'ex1', name: 'Türev ve İntegral', subject: 'Matematik', day: 'Pzt', duration: '2 saat', emoji: '📐', selected: true },
    { id: 'ex2', name: 'Elektrik Devreleri', subject: 'Fizik', day: 'Sal', duration: '1.5 saat', emoji: '⚡', selected: true },
    { id: 'ex3', name: 'Organik Kimya', subject: 'Kimya', day: 'Çrş', duration: '2 saat', emoji: '⚗️', selected: true },
    { id: 'ex4', name: 'Hücre Bölünmesi', subject: 'Biyoloji', day: 'Per', duration: '1 saat', emoji: '🌿', selected: true },
    { id: 'ex5', name: 'Şiir Analizi', subject: 'Edebiyat', day: 'Cum', duration: '1 saat', emoji: '📖', selected: true },
  ];
  const [extractedTasks, setExtractedTasks] = useState(mockExtractedTasks);

  const handleProcessing = () => {
    setAiStep('processing');
    setTimeout(() => setAiStep('results'), 2500);
  };

  const handleConfirm = () => {
    showToast(`${extractedTasks.filter(t => t.selected).length} görev takvime eklendi!`, 'success', '📅');
    setShowAiModal(false);
    setAiStep('source');
  };

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
          onClick={() => { setShowAiModal(true); setAiStep('source'); }}
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

      {/* AI Modal */}
      {showAiModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(4px)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => e.target === e.currentTarget && setShowAiModal(false)}
        >
          <div className="card" style={{ maxWidth: 380, width: '100%', background: 'var(--s2)', border: '1px solid rgba(123,92,245,.3)', borderRadius: 16, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                {aiStep === 'source' ? 'Planını Nasıl Oluşturalım?' : aiStep === 'input' ? `${aiSource === 'photo' ? '📸' : aiSource === 'text' ? '📝' : aiSource === 'voice' ? '🎤' : '🗓️'} Planını Yükle` : aiStep === 'processing' ? 'AI Analiz Ediyor...' : 'Bulunan Görevler'}
              </span>
              <button onClick={() => setShowAiModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            {aiStep === 'source' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'photo', emoji: '📸', label: 'Fotoğraf Yükle' },
                  { key: 'text', emoji: '📝', label: 'Metni Yapıştır' },
                  { key: 'voice', emoji: '🎤', label: 'Sesli Anlat' },
                  { key: 'calendar', emoji: '🗓️', label: 'Takvimden Al' },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setAiSource(opt.key); setAiStep('input'); }}
                    style={{
                      padding: '16px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                      background: aiSource === opt.key ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
                      border: `1px solid ${aiSource === opt.key ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.08)'}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {aiStep === 'input' && (
              <div>
                {aiSource === 'text' && (
                  <textarea
                    rows={6}
                    value={aiText}
                    onChange={e => setAiText(e.target.value)}
                    placeholder="Programını buraya yapıştır..."
                    style={{ width: '100%', background: 'var(--s1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: 12, color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 12, resize: 'none' }}
                  />
                )}
                {aiSource === 'photo' && (
                  <div style={{ border: '2px dashed rgba(123,92,245,.3)', borderRadius: 10, padding: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--muted)' }}>Sürükle bırak veya</div>
                    <button className="btn-gradient" style={{ padding: '6px 16px', marginTop: 8 }}>Dosya Seç</button>
                  </div>
                )}
                {aiSource === 'voice' && (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <button style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(123,92,245,.2)', border: '2px solid #7B5CF5', fontSize: 28, cursor: 'pointer', animation: 'pulse-glow 1.5s infinite' }}>🎤</button>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginTop: 12 }}>Programını sesle anlat</div>
                  </div>
                )}
                {aiSource === 'calendar' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['Google Calendar', 'Notion', 'Google Sheets'].map(opt => (
                      <button key={opt} style={{ padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn-gradient" style={{ width: '100%', marginTop: 12, padding: '11px 0' }} onClick={handleProcessing}>
                  ANALİZ ET
                </button>
              </div>
            )}

            {aiStep === 'processing' && (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(123,92,245,.2)', border: '2px solid #7B5CF5', margin: '0 auto 16px', animation: 'pulse-glow 1s infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>✨</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--text)', marginBottom: 8 }}>AI analiz ediyor...</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>El yazısı tanınıyor · Görevler çıkarılıyor · Takvim oluşturuluyor</div>
              </div>
            )}

            {aiStep === 'results' && (
              <div>
                <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: 'var(--text)', marginBottom: 10 }}>Bulunan Görevler</div>
                {extractedTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <input
                      type="checkbox"
                      checked={task.selected}
                      onChange={() => setExtractedTasks(ts => ts.map(t => t.id === task.id ? { ...t, selected: !t.selected } : t))}
                      style={{ accentColor: '#7B5CF5' }}
                    />
                    <span style={{ fontSize: 14 }}>{task.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{task.name}</div>
                      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{task.day} · {task.duration}</div>
                    </div>
                  </div>
                ))}
                <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', margin: '10px 0' }}>
                  {extractedTasks.filter(t => t.selected).length} görev · Toplam {extractedTasks.filter(t => t.selected).length * 1.5} saat
                </div>
                <button className="btn-gradient" style={{ width: '100%', padding: '12px 0' }} onClick={handleConfirm}>
                  📅 TAKVİME EKLE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
