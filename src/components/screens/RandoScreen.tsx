'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { useRandoMatcher } from '@/hooks/useRandoMatcher';
import { formatTime } from '@/lib/utils';
import { SUBJECTS } from '@/lib/constants';
import { useState } from 'react';

const DURATION_OPTIONS = [
  { label: '30dk', value: 30 * 60 },
  { label: '1 Saat', value: 60 * 60 },
  { label: '2 Saat', value: 2 * 60 * 60 },
  { label: 'Özel', value: -1 },
];
const FORMAT_OPTIONS = [
  { label: 'Sessiz 🔇', value: 'silent' },
  { label: 'Sesli 🎤', value: 'voice' },
  { label: 'Videolu 📹', value: 'video' },
];

const EMOJI_REACTIONS = ['👍', '🔥', '💪', '🎯'];

export function RandoScreen() {
  useRandoMatcher();
  const {
    randoState, randoOpponent, randoElapsed, randoStars,
    randoSubject, randoDuration, randoFormat,
    setRandoState, setRandoStars, completeRando, cancelRando,
    setRandoSubject, setRandoDuration, setRandoFormat,
    user, showToast,
  } = useStore();

  const [miniChat, setMiniChat] = useState<string[]>([]);
  const [miniInput, setMiniInput] = useState('');
  const [burst, setBurst] = useState<{ emoji: string; key: number } | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const sendReaction = (emoji: string) => {
    setBurst({ emoji, key: Date.now() });
    setTimeout(() => setBurst(null), 1000);
  };

  const getDurationLabel = () => {
    const opt = DURATION_OPTIONS.find(o => o.value === randoDuration);
    return opt ? opt.label : `${Math.floor(randoDuration / 60)}dk`;
  };

  // ── IDLE STATE ────────────────────────────────────────────────
  if (randoState === 'idle') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{
            fontSize: 64, marginBottom: 16,
            display: 'inline-block',
            filter: 'drop-shadow(0 0 20px rgba(123,92,245,.4))',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}>🤝</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>RANDO SEANS</div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--muted)' }}>Rastgele bir öğrenciyle eşleş ve birlikte çalış</div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' }}>Tercihler</div>
          {/* Subject row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Ders</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setShowSubjectPicker(!showSubjectPicker)}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>{randoSubject}</span>
              <span style={{ color: 'var(--dim)', fontSize: 12 }}>›</span>
            </div>
          </div>
          {showSubjectPicker && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0' }}>
              {SUBJECTS.map(s => (
                <button key={s.id} onClick={() => { setRandoSubject(s.name); setShowSubjectPicker(false); }}
                  style={{ fontFamily: 'Space Mono', fontSize: 8, padding: '4px 8px', borderRadius: 4, cursor: 'pointer', background: randoSubject === s.name ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${randoSubject === s.name ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.08)'}`, color: randoSubject === s.name ? '#9D82F8' : 'var(--dim)' }}
                >{s.emoji} {s.name}</button>
              ))}
            </div>
          )}
          {/* Duration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Süre</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setShowDurationPicker(!showDurationPicker)}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>{getDurationLabel()}</span>
              <span style={{ color: 'var(--dim)', fontSize: 12 }}>›</span>
            </div>
          </div>
          {showDurationPicker && (
            <div style={{ display: 'flex', gap: 6, padding: '8px 0', flexWrap: 'wrap' }}>
              {DURATION_OPTIONS.filter(o => o.value > 0).map(opt => (
                <button key={opt.value} onClick={() => { setRandoDuration(opt.value); setShowDurationPicker(false); }}
                  style={{ fontFamily: 'Space Mono', fontSize: 8, padding: '4px 10px', borderRadius: 4, cursor: 'pointer', background: randoDuration === opt.value ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)', border: `1px solid ${randoDuration === opt.value ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.08)'}`, color: randoDuration === opt.value ? '#9D82F8' : 'var(--dim)' }}
                >{opt.label}</button>
              ))}
            </div>
          )}
          {/* Format */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Format</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => {
              const opts = FORMAT_OPTIONS.map(o => o.value);
              const idx = opts.indexOf(randoFormat);
              setRandoFormat(opts[(idx + 1) % opts.length]);
            }}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>{FORMAT_OPTIONS.find(f => f.value === randoFormat)?.label || 'Sessiz 🔇'}</span>
              <span style={{ color: 'var(--dim)', fontSize: 12 }}>›</span>
            </div>
          </div>
          {/* Level */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Seviye Filtresi</span>
            <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>Tüm seviyeler</span>
          </div>
        </div>

        {/* Match button */}
        <button
          className="btn-gradient"
          style={{ width: '100%', padding: '16px 0', fontSize: 11, borderRadius: 10 }}
          onClick={() => setRandoState('searching')}
        >⚡ EŞLEŞTİR</button>

        <div style={{ textAlign: 'center' }}>
          <button
            style={{ background: 'none', border: 'none', fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--dim)', cursor: 'pointer' }}
            onClick={() => { navigator.clipboard.writeText('studyquest.app/rando/sf-x8k2'); showToast('Davet linki kopyalandı! ✓', 'success', '🔗'); }}
          >Belirli Bir Arkadaşa Davet Et</button>
        </div>

        {/* Invite section */}
        <div>
          <SectionLabel>PLANLANMIŞ RANDO</SectionLabel>
          <div className="card">
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 8 }}>studyquest.app/rando/sf-x8k2</div>
            <button
              className="btn-gradient"
              style={{ padding: '7px 20px', fontSize: 9 }}
              onClick={() => { navigator.clipboard.writeText('studyquest.app/rando/sf-x8k2'); showToast('Kopyalandı! ✓', 'success', '📋'); }}
            >🔗 KOPYALA</button>
          </div>
        </div>
      </div>
    );
  }

  // ── SEARCHING STATE ────────────────────────────────────────────
  if (randoState === 'searching') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%',
              border: '1px solid rgba(123,92,245,.4)',
              animation: `pulse-glow ${1.5}s ease-in-out ${i * 0.5}s infinite`,
              transform: `scale(${1 + i * 0.3})`,
            }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🔍</div>
        </div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--text)' }}>Eşleşme aranıyor...</div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Tahmini süre: ~2 dk</div>
        <button
          onClick={cancelRando}
          style={{ fontFamily: 'Orbitron', fontSize: 9, color: 'var(--dim)', background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 6, padding: '7px 20px', cursor: 'pointer' }}
        >İptal</button>
      </div>
    );
  }

  // ── MATCHED STATE ────────────────────────────────────────────
  if (randoState === 'matched' && randoOpponent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,.15)', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, animation: 'pulse-glow 0.5s ease-out' }}>✓</div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: 'var(--text)' }}>Eşleşme Bulundu! 🎉</div>
        <div className="card" style={{ textAlign: 'center', padding: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 4 }}>{randoOpponent.emoji}</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--text)' }}>{randoOpponent.name}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>LV.{randoOpponent.level}</div>
        </div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Seans başlıyor...</div>
      </div>
    );
  }

  // ── ACTIVE SESSION STATE ────────────────────────────────────────
  if ((randoState === 'active' || randoState === 'break') && randoOpponent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* VS Card */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(123,92,245,.1), rgba(34,211,238,.05))', border: '1px solid rgba(123,92,245,.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {/* Me */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid #7B5CF5', background: 'rgba(123,92,245,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 6px' }}>{user.emoji}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>Sen</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>LV.{user.level}</div>
            </div>
            {/* VS */}
            <div style={{ padding: '0 8px' }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: 'var(--dim)', fontWeight: 700 }}>VS</div>
            </div>
            {/* Opponent */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', border: '2px solid #F59E0B', background: 'rgba(245,158,11,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 6px' }}>{randoOpponent.emoji}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#F59E0B' }}>{randoOpponent.name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>LV.{randoOpponent.level}</div>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="card" style={{ textAlign: 'center', padding: 20, position: 'relative' }}>
          {randoState === 'break' && (
            <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: '#F59E0B', marginBottom: 8 }}>Mola vakti ☕</div>
          )}
          <div style={{ fontFamily: 'Orbitron', fontSize: 32, color: '#22D3EE', letterSpacing: 3 }}>{formatTime(randoElapsed)}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginTop: 4 }}>(İkiniz de görüntülüyor)</div>
          {/* Emoji burst */}
          {burst && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', fontSize: 24, animation: 'confetti-fall .8s ease-out forwards' }}>{burst.emoji}</div>
          )}
        </div>

        {/* Reactions */}
        <div className="card">
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 8 }}>TEPKİ GÖNDER</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {EMOJI_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', fontSize: 20, cursor: 'pointer', transition: 'all .1s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123,92,245,.15)'; e.currentTarget.style.borderColor = 'rgba(123,92,245,.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'; }}
              >{emoji}</button>
            ))}
          </div>
        </div>

        {/* Mini chat */}
        <div className="card">
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 6 }}>HIZLI MESAJ</div>
          <div style={{ maxHeight: 80, overflowY: 'auto', marginBottom: 8 }}>
            {miniChat.map((msg, i) => (
              <div key={i} style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)', padding: '2px 0' }}>{msg}</div>
            ))}
            {miniChat.length === 0 && (
              <div style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--dim)' }}>Henüz mesaj yok...</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={miniInput}
              onChange={e => setMiniInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && miniInput.trim()) { setMiniChat(prev => [...prev, `Sen: ${miniInput}`]); setMiniInput(''); } }}
              placeholder="Kısa mesaj..."
              style={{ flex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, padding: '5px 8px', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--text)' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {randoState === 'active' ? (
            <button
              onClick={() => setRandoState('break')}
              style={{ flex: 1, padding: '11px 0', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 8, color: '#F59E0B', fontFamily: 'Orbitron', fontSize: 9, cursor: 'pointer' }}
            >☕ MOLA</button>
          ) : (
            <button
              onClick={() => setRandoState('active')}
              style={{ flex: 1, padding: '11px 0', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', borderRadius: 8, color: '#10B981', fontFamily: 'Orbitron', fontSize: 9, cursor: 'pointer' }}
            >▶ DEVAM ET</button>
          )}
          <button
            onClick={() => setRandoState('rating')}
            style={{ flex: 1, padding: '11px 0', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, color: '#EF4444', fontFamily: 'Orbitron', fontSize: 9, cursor: 'pointer' }}
          >⏹ SEANSINI BİTİR</button>
        </div>
      </div>
    );
  }

  // ── RATING STATE ────────────────────────────────────────────
  if (randoState === 'rating' && randoOpponent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20 }}>
        <div style={{ fontSize: 48 }}>{randoOpponent.emoji}</div>
        <div style={{ fontFamily: 'Orbitron', fontSize: 14, color: 'var(--text)' }}>{randoOpponent.name}&apos;u Değerlendir</div>
        {/* Stars */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onClick={() => setRandoStars(star)}
              style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', color: star <= randoStars ? '#F59E0B' : 'var(--dim)', transition: 'all .1s' }}
            >★</button>
          ))}
        </div>
        <textarea
          rows={3} placeholder="Notun var mı? (isteğe bağlı)"
          style={{ width: '100%', maxWidth: 320, background: 'var(--s1)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: 10, color: 'var(--text)', fontFamily: 'Rajdhani', fontSize: 12, resize: 'none' }}
        />
        <button className="btn-gradient" style={{ padding: '12px 40px', fontSize: 10 }} onClick={completeRando}>GÖNDER</button>
        <button style={{ background: 'none', border: 'none', fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--dim)', cursor: 'pointer' }} onClick={completeRando}>Atla</button>
      </div>
    );
  }

  // ── COMPLETE STATE ────────────────────────────────────────────
  if (randoState === 'complete') {
    const xpEarned = Math.round((randoElapsed / 60) * 3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 20, textAlign: 'center', position: 'relative' }}>
        {/* Confetti */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="confetti-dot" style={{
            background: ['#7B5CF5','#22D3EE','#F59E0B','#10B981','#EF4444','#EC4899','#FFD700','#A78BFA'][i],
            left: `${10 + i * 10}%`,
            animationDelay: `${i * 0.08}s`,
          }} />
        ))}
        <div style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, background: 'linear-gradient(135deg, #7B5CF5, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✨ SEANS TAMAMLANDI!</div>
        <div className="card" style={{ width: '100%', maxWidth: 320, padding: 16 }}>
          {[
            { label: 'Süre', value: formatTime(randoElapsed) },
            { label: 'Kazanılan XP', value: `+${xpEarned} XP`, color: '#10B981' },
            { label: 'Kazanılan Bakiye', value: '+1.5 sa', color: '#F59E0B' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>{row.label}</span>
              <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: row.color || 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px', background: 'rgba(123,92,245,.08)', borderRadius: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 18 }}>🤝</span>
            <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#9D82F8' }}>Çalışma Arkadaşı rozeti kazandın!</span>
          </div>
        </div>
        <button className="btn-gradient" style={{ padding: '12px 32px', fontSize: 10 }} onClick={cancelRando}>Tekrar Eşleş?</button>
        <button style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '10px 28px', color: 'var(--muted)', fontFamily: 'Orbitron', fontSize: 9, cursor: 'pointer' }} onClick={cancelRando}>Dashboard&apos;a Dön</button>
      </div>
    );
  }

  return null;
}
