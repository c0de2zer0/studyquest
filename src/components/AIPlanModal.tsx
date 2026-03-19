'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import type { Task } from '@/store';
import { SUBJECTS, XP_PER_MINUTE } from '@/lib/constants';

type ConvStep = 'subjects' | 'hours' | 'exam' | 'days' | 'done';

interface PlanBlock {
  day: string;
  subject: string;
  hours: number;
  emoji: string;
  color: string;
}

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
  chips?: string[];
  multiChips?: boolean;
  planPreview?: PlanBlock[];
}

const SUBJECT_NAMES = SUBJECTS.map(s => s.name);
const HOURS_CHIPS = ['2 saat', '4 saat', '6 saat', '8 saat+'];
const DAYS_CHIPS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function generatePlan(
  subjects: string[],
  hoursPerDay: number,
  examDays: number,
  heavyDays: string[],
): PlanBlock[] {
  const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const isHeavy = (d: string) => heavyDays.includes(d);
  const subj = subjects.length > 0 ? subjects : ['Matematik'];
  return DAYS_TR.map((day, i) => {
    const dayHours = isHeavy(day) ? hoursPerDay + 2 : hoursPerDay;
    const s = subj[i % subj.length];
    const found = SUBJECTS.find(x => x.name === s) ?? SUBJECTS[0];
    return { day, subject: found.name, hours: dayHours, emoji: found.emoji, color: found.color };
  });
}

export function AIPlanModal({ onClose }: { onClose: () => void }) {
  const { user, addFullTask } = useStore(s => ({ user: s.user, addFullTask: s.addFullTask }));

  const [step, setStep] = useState<ConvStep>('subjects');
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: 'bot',
    text: 'Merhaba! 👋 Sana özel haftalık çalışma programı hazırlayacağım.\n\nHangi derslere çalışıyorsun?',
    chips: SUBJECT_NAMES, multiChips: true,
  }]);
  const [input, setInput] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [answers, setAnswers] = useState({
    subjects: [] as string[],
    hours: 4,
    examDays: user.examDaysLeft ?? 90,
    heavyDays: ['Cmt', 'Paz'] as string[],
  });
  const [plan, setPlan] = useState<PlanBlock[] | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMsg = (text: string) => {
    const userMsg: ChatMsg = { role: 'user', text };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setSelectedChips([]);

    setTimeout(() => {
      let botMsg: ChatMsg;
      if (step === 'subjects') {
        const subs = selectedChips.length > 0 ? selectedChips : text.split(',').map(s => s.trim()).filter(Boolean);
        if (subs.length === 0) subs.push(text);
        setAnswers(a => ({ ...a, subjects: subs }));
        botMsg = { role: 'bot', text: `Harika! ${subs.join(', ')} dersleri seçildi. 📚\n\nGünde kaç saat çalışabiliyorsun?`, chips: HOURS_CHIPS };
        setStep('hours');
      } else if (step === 'hours') {
        const h = text.includes('8') ? 8 : parseInt(text) || 4;
        setAnswers(a => ({ ...a, hours: h }));
        const examDaysLeft = user.examDaysLeft ?? 90;
        botMsg = { role: 'bot', text: `${h} saat/gün iyi bir hedef! 💪\n\nSınavına kaç gün var? (Şu an ${examDaysLeft} gün görünüyor — doğruysa devam yazabilirsin)`, chips: [`${examDaysLeft} gün (doğru)`] };
        setStep('exam');
      } else if (step === 'exam') {
        const days = parseInt(text) || user.examDaysLeft || 90;
        setAnswers(a => ({ ...a, examDays: days }));
        botMsg = { role: 'bot', text: `${days} gün var. Son rötuşlar... 🎯\n\nHangi günler daha çok vaktın var? (Birden fazla seçebilirsin)`, chips: DAYS_CHIPS, multiChips: true };
        setStep('days');
      } else {
        const hDays = selectedChips.length > 0 ? selectedChips : ['Cmt', 'Paz'];
        setAnswers(prev => {
          const newAnswers = { ...prev, heavyDays: hDays };
          const generated = generatePlan(newAnswers.subjects, newAnswers.hours, newAnswers.examDays, hDays);
          setPlan(generated);
          const total = generated.reduce((s, b) => s + b.hours, 0);
          const botMsgInner: ChatMsg = {
            role: 'bot',
            text: `Programın hazır! 🎉 Haftada ${total} saat, ${newAnswers.examDays} günde ~${total * Math.floor(newAnswers.examDays / 7)} saat çalışma hedefliyorsun.`,
            planPreview: generated,
          };
          setMsgs(p => [...p, botMsgInner]);
          return newAnswers;
        });
        setStep('done');
        return;
      }
      setMsgs(prev => [...prev, botMsg]);
    }, 400);
  };

  const handleChipToggle = (chip: string, multi?: boolean) => {
    if (!multi) {
      setSelectedChips([chip]);
      sendMsg(chip);
    } else {
      setSelectedChips(prev =>
        prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
      );
    }
  };

  const handleAddToPlan = () => {
    if (!plan) return;
    plan.forEach((block, i) => {
      const found = SUBJECTS.find(s => s.name === block.subject) ?? SUBJECTS[0];
      const endHour = Math.min(9 + block.hours, 23);
      const task: Task = {
        id: `ai-${Date.now()}-${i}`,
        name: `${block.emoji} ${block.subject} Çalışma`,
        subject: block.subject,
        subjectColor: found.color,
        subjectEmoji: found.emoji,
        startTime: '09:00',
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        duration: block.hours * 60,
        coins: parseFloat(block.hours.toFixed(1)),
        status: 'pending' as const,
        xp: Math.round(block.hours * 60 * XP_PER_MINUTE),
      };
      addFullTask(task);
    });
    onClose();
  };

  const lastMsg = msgs[msgs.length - 1];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.9)',
      display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A1040,#0F1A2E)',
        borderBottom: '1px solid rgba(123,92,245,.3)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
        <div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: 1 }}>AI PLAN ASİSTANI</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Konuşarak kişisel program oluşturuyor</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,.15)',
          border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', padding: '4px 12px',
          borderRadius: 8, fontFamily: 'Space Mono', fontSize: 9, cursor: 'pointer' }}>✕ Kapat</button>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                background: m.role === 'bot' ? 'linear-gradient(135deg,#7B5CF5,#22D3EE)' : '#7B5CF533',
                border: m.role === 'user' ? '1.5px solid #7B5CF5' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                {m.role === 'bot' ? '✨' : user.emoji}
              </div>
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  background: m.role === 'bot' ? '#1A1040' : 'rgba(123,92,245,.15)',
                  border: '1px solid rgba(123,92,245,.3)',
                  borderRadius: m.role === 'bot' ? '0 10px 10px 10px' : '10px 0 10px 10px',
                  padding: '10px 12px',
                }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text)', lineHeight: 1.6,
                    whiteSpace: 'pre-line' }}>{m.text}</div>
                  {/* Plan preview */}
                  {m.planPreview && (
                    <div style={{ background: '#0D1117', border: '1px solid rgba(123,92,245,.2)',
                      borderRadius: 8, padding: 10, marginTop: 8 }}>
                      <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#A78BFA', marginBottom: 6 }}>
                        📅 ÖNERİLEN HAFTALIK PROGRAM
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {m.planPreview.map(b => (
                          <div key={b.day} style={{ background: b.color + '22', borderRadius: 4,
                            padding: '4px 6px', fontFamily: 'Space Mono', fontSize: 7, color: b.color }}>
                            {b.day}: {b.emoji} {b.subject} {b.hours}sa
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Chips below last bot message */}
                {m.chips && i === msgs.length - 1 && step !== 'done' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {m.chips.map(chip => (
                      <button key={chip} onClick={() => handleChipToggle(chip, m.multiChips)} style={{
                        padding: '4px 10px', borderRadius: 14, cursor: 'pointer',
                        fontFamily: 'Space Mono', fontSize: 8,
                        background: selectedChips.includes(chip) ? 'rgba(123,92,245,.3)' : 'rgba(255,255,255,.05)',
                        border: `1px solid ${selectedChips.includes(chip) ? 'rgba(123,92,245,.6)' : 'rgba(255,255,255,.1)'}`,
                        color: selectedChips.includes(chip) ? '#A78BFA' : 'var(--dim)',
                      }}>{chip}</button>
                    ))}
                    {m.multiChips && selectedChips.length > 0 && (
                      <button onClick={() => sendMsg(selectedChips.join(', '))} style={{
                        padding: '4px 12px', borderRadius: 14, cursor: 'pointer',
                        fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700,
                        background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
                      }}>Devam →</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Plan action buttons */}
            {m.planPreview && i === msgs.length - 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 36 }}>
                <button onClick={handleAddToPlan} style={{
                  flex: 1, background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)', color: '#fff',
                  border: 'none', padding: '9px 0', borderRadius: 8,
                  fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                  📅 TAKVİME EKLE
                </button>
                <button onClick={() => {
                  setMsgs([{ role: 'bot', text: 'Tamam, tekrar deneyelim! Hangi derslere çalışıyorsun?',
                    chips: SUBJECT_NAMES, multiChips: true }]);
                  setStep('subjects');
                  setSelectedChips([]);
                  setPlan(null);
                }} style={{
                  background: '#1E293B', color: '#94A3B8', border: '1px solid #374151',
                  padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'Space Mono', fontSize: 9 }}>🔄 Yeniden</button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {step !== 'done' && (
        <div style={{ background: '#111827', borderTop: '1px solid #1E293B',
          padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const text = selectedChips.length > 0 ? selectedChips.join(', ') : input;
                if (text.trim()) sendMsg(text);
              }
            }}
            placeholder="Bir şey yaz veya yukarıdan seç..."
            style={{ flex: 1, background: '#0D1117', border: '1px solid rgba(123,92,245,.3)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
              fontFamily: 'Rajdhani', fontSize: 12, outline: 'none' }} />
          <button onClick={() => {
            const text = selectedChips.length > 0 ? selectedChips.join(', ') : input;
            if (text.trim()) sendMsg(text);
          }} style={{ background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)', border: 'none',
            width: 38, height: 38, borderRadius: 10, fontSize: 16, cursor: 'pointer' }}>→</button>
        </div>
      )}
    </div>
  );
}
