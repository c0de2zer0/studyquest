'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { mockEvolutionTree, mockBadges } from '@/lib/mock-data';
import PixelAvatar from '@/components/PixelAvatar';

const ITEM_CATEGORIES = ['🎓 Şapka', '💇 Saç', '🧥 Üst', '👖 Alt', '👟 Ayak', '💎 Aksesuar', '🌌 Arka Plan', '🦸 Kostüm', '✓ Özellik'] as const;
const CAT_KEYS = ['hat', 'hair', 'top', 'bottom', 'shoes', 'accessory', 'background', 'costume', 'ozellik'];

const SLOT_LABELS = ['Şapka', 'Saç', 'Üst', 'Alt', 'Ayak', 'Aksesuar', 'Arka Plan'];
const SLOT_KEYS = ['hat', 'hair', 'top', 'bottom', 'shoes', 'accessory', 'background'];

export function AvatarScreen() {
  const { user, items, equipItem, unequipItem, setActiveTab, showToast } = useStore();
  const [wardrobeCat, setWardrobeCat] = useState(0);
  const [glowColor, setGlowColor] = useState(user.avatar.glowColor);
  const [selectedEv, setSelectedEv] = useState<string | null>(null);
  const [shakingEv, setShakingEv] = useState<string | null>(null);

  const totalHours = user.totalHours;
  const currentEvolution = mockEvolutionTree.find(e => e.current);
  const nextEvolution = mockEvolutionTree.find(e => !e.unlocked && !e.current);
  const nextReqHours = nextEvolution?.reqHours ?? 800;
  const evolutionPct = Math.round((totalHours / nextReqHours) * 100);

  const rarityColors: Record<string, string> = {
    common: '#64748B',
    rare: '#22D3EE',
    epic: '#A78BFA',
    legendary: '#FFD700',
  };

  const filteredItems = items.filter(item => {
    const catKey = CAT_KEYS[wardrobeCat];
    if (catKey === 'costume') return item.category === 'costume' || item.rarity === 'legendary';
    return item.category === catKey;
  });

  const avatarStats = [
    { label: 'ODAK', value: user.stats.focus, color: '#7B5CF5' },
    { label: 'HIZ', value: user.stats.speed, color: '#22D3EE' },
    { label: 'DAYANIKLILIK', value: user.stats.endurance, color: '#F59E0B' },
    { label: 'HAFIZA', value: user.stats.memory, color: '#10B981' },
  ];

  const glowColors = ['#7B5CF5', '#22D3EE', '#F59E0B', '#10B981', '#EF4444', '#EC4899', '#FFD700', '#94A3B8'];

  // Suppress unused variable warnings for imported items used only for their side effects / type checking
  void currentEvolution;
  void Badge;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-4px)}
          40%,80%{transform:translateX(4px)}
        }
      `}</style>
      {/* Avatar Stage */}
      <div className="card" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(123,92,245,.12), transparent)',
        border: '1px solid rgba(123,92,245,.2)',
        textAlign: 'center',
        padding: 24,
      }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            animation: 'float 3s ease-in-out infinite',
            display: 'inline-block',
            cursor: 'pointer',
            background: 'linear-gradient(180deg, #0A0612 0%, #0F0A20 20%, #1E1050 50%, #2A1868 65%, #1A0D40 80%, #0D1117 100%)',
            border: '1px solid rgba(123,92,245,.4)',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            minHeight: 200,
            position: 'relative',
          }}>
            {/* Room floor glow */}
            <div style={{
              position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
              width: 120, height: 24, borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(123,92,245,.35) 0%, rgba(123,92,245,.08) 60%, transparent 100%)',
              pointerEvents: 'none',
            }} />
            <PixelAvatar
              equippedItems={user.equippedItems}
              size="preview"
              direction="down"
            />
          </div>
          {/* Glow below */}
          <div style={{
            position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
            width: 100, height: 16, borderRadius: '50%',
            background: `${glowColor}40`, filter: 'blur(12px)',
          }} />
        </div>
        <div style={{
          fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, letterSpacing: 2,
          background: 'linear-gradient(135deg, #22D3EE, #7B5CF5)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: 4,
        }}>SHADOW FOX</div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 12 }}>
          {user.avatar.tier} · Seviye {user.level} · {user.avatar.rarity}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          <span className="badge badge-purple">⚡ VELOCITY CLASS</span>
          <span className="badge badge-cyan">💎 LV.{user.level}</span>
          <span className="badge badge-amber">🔥 {user.streak} SERİ</span>
        </div>
        {/* Glow color picker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {glowColors.map(c => (
            <div
              key={c}
              onClick={() => setGlowColor(c)}
              style={{
                width: 16, height: 16, borderRadius: '50%', background: c, cursor: 'pointer',
                border: glowColor === c ? '2px solid white' : '2px solid transparent',
                boxShadow: glowColor === c ? `0 0 6px ${c}` : 'none',
                transition: 'all .15s',
              }}
            />
          ))}
        </div>
        <button
          style={{ fontFamily: 'Orbitron', fontSize: 8, color: '#7B5CF5', background: 'none', border: '1px solid rgba(123,92,245,.3)', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}
          onClick={() => showToast('Profil kartı kopyalandı! 📤', 'success', '🦊')}
        >KARTI PAYLAŞ</button>
      </div>

      {/* Evolution Tree */}
      <div>
        <SectionLabel>EVRİM AĞACI</SectionLabel>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', gap: 0, paddingBottom: 8 }} className="no-scrollbar">
            {mockEvolutionTree.map((ev, i) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {i > 0 && (
                  <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)', padding: '0 4px', userSelect: 'none' }}>──</span>
                )}
                <div
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    width: 54, cursor: ev.unlocked ? 'pointer' : 'default',
                    opacity: !ev.unlocked ? .25 : 1,
                    filter: !ev.unlocked ? 'grayscale(1)' : 'none',
                    animation: shakingEv === ev.id ? 'shake 0.3s ease' : 'none',
                  }}
                  data-tooltip={!ev.unlocked ? `Gerekli: ${ev.reqHours} saat` : undefined}
                  onClick={() => {
                    if (ev.unlocked) {
                      setSelectedEv(prev => prev === ev.id ? null : ev.id);
                    } else {
                      setShakingEv(ev.id);
                      setTimeout(() => setShakingEv(null), 350);
                    }
                  }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: ev.current ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
                    border: ev.current ? '2px solid #7B5CF5' : '1px solid rgba(255,255,255,.12)',
                    boxShadow: ev.current ? '0 0 16px rgba(123,92,245,.3)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    position: 'relative',
                  }}>
                    {ev.emoji}
                    {ev.unlocked && !ev.current && (
                      <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 10 }}>✓</span>
                    )}
                    {!ev.unlocked && (
                      <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 10 }}>🔒</span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: ev.current ? '#7B5CF5' : 'var(--dim)', textAlign: 'center' }}>{ev.name}</span>
                  {ev.current && <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: '#7B5CF5' }}>★ LV.{user.level}</span>}
                  {!ev.current && !ev.unlocked && <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>{ev.reqHours}sa</span>}
                </div>
              </div>
            ))}
          </div>
          {nextEvolution && (
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={evolutionPct} variant="purple" height={5} />
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginTop: 4 }}>
                {nextEvolution.name}&apos;a {nextReqHours - totalHours} saat kaldı · %{Math.min(100, evolutionPct)} tamamlandı
              </div>
            </div>
          )}
          {selectedEv && (() => {
            const ev = mockEvolutionTree.find(e => e.id === selectedEv);
            if (!ev) return null;
            return (
              <div style={{
                marginTop: 10, background: 'rgba(123,92,245,.1)',
                border: '1px solid rgba(123,92,245,.3)', borderRadius: 8, padding: '10px 12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 24 }}>{ev.emoji}</span>
                  <div>
                    <div style={{ fontFamily: 'Orbitron', fontSize: 11, color: '#A78BFA' }}>{ev.name}</div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
                      {ev.current
                        ? '★ Mevcut formun'
                        : ev.unlocked
                        ? `✓ ${ev.reqHours} saatte ulaştın`
                        : `🔒 Gerekli: ${ev.reqHours} saat çalışma`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <SectionLabel>TEMEL STATLAR</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {avatarStats.map(stat => (
            <div key={stat.label} className="card" style={{ padding: 12 }} data-tooltip="Bu stat nasıl hesaplanır?">
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', letterSpacing: 1, marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <ProgressBar
                value={stat.value}
                variant={stat.label === 'ODAK' ? 'purple' : stat.label === 'HIZ' ? 'cyan' : stat.label === 'DAYANIKLILIK' ? 'amber' : 'green'}
                height={5}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Equipped Items */}
      <div>
        <SectionLabel>GİYİLİ EŞYALAR</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {SLOT_KEYS.map((slot, i) => {
            const equipped = items.find(item => item.equipped && item.category === slot);
            return (
              <div
                key={slot}
                className="card"
                style={{
                  padding: 10, textAlign: 'center', minHeight: 70,
                  border: equipped ? `1px solid ${rarityColors[equipped.rarity]}40` : '1px dashed rgba(255,255,255,.1)',
                  opacity: equipped ? 1 : 0.4,
                  cursor: equipped ? 'pointer' : 'default',
                }}
              >
                {equipped ? (
                  <>
                    <div style={{ fontSize: 22, marginBottom: 3 }}>{equipped.emoji}</div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: rarityColors[equipped.rarity] }}>
                      {equipped.rarity.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>{equipped.name.substring(0, 10)}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 18, color: 'var(--dim)' }}>+</div>
                    <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)' }}>{SLOT_LABELS[i]}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Wardrobe */}
      <div>
        <SectionLabel>DOLAP</SectionLabel>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10 }} className="no-scrollbar">
          {ITEM_CATEGORIES.map((cat, i) => (
            <button
              key={i}
              onClick={() => setWardrobeCat(i)}
              style={{
                fontFamily: 'Space Mono', fontSize: 8, padding: '5px 10px', borderRadius: 6,
                whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                background: wardrobeCat === i ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${wardrobeCat === i ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
                color: wardrobeCat === i ? '#9D82F8' : 'var(--dim)',
              }}
            >{cat}</button>
          ))}
        </div>
        {filteredItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--dim)' }}>🛍️ Bu kategoride eşyan yok. Markete göz at!</div>
            <button className="btn-gradient" style={{ marginTop: 10, padding: '7px 18px' }} onClick={() => setActiveTab('market')}>MARKETE GİT</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {filteredItems.map(item => {
              const rc = rarityColors[item.rarity];
              return (
                <div
                  key={item.id}
                  className="card"
                  style={{
                    padding: 10, textAlign: 'center',
                    opacity: item.owned ? 1 : 0.5,
                    border: item.owned ? `1px solid ${rc}40` : '1px solid rgba(255,255,255,.06)',
                    position: 'relative',
                  }}
                >
                  {item.equipped && (
                    <div style={{ position: 'absolute', top: 4, right: 4 }}>
                      <span className="badge badge-purple" style={{ fontSize: 6 }}>GİYİLİ</span>
                    </div>
                  )}
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{item.emoji}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: rc, marginBottom: 2 }}>{item.rarity.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 9, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3, minHeight: 24 }}>{item.name}</div>
                  {item.owned ? (
                    <button
                      onClick={() => item.equipped ? unequipItem(item.id) : equipItem(item.id)}
                      style={{
                        width: '100%', padding: '5px 0', borderRadius: 4, cursor: 'pointer', fontFamily: 'Orbitron', fontSize: 7,
                        background: item.equipped ? 'rgba(239,68,68,.1)' : 'rgba(123,92,245,.1)',
                        border: `1px solid ${item.equipped ? 'rgba(239,68,68,.3)' : 'rgba(123,92,245,.3)'}`,
                        color: item.equipped ? '#EF4444' : '#7B5CF5',
                      }}
                    >{item.equipped ? 'ÇIKAR' : 'GİY'}</button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('market')}
                      style={{ width: '100%', padding: '5px 0', borderRadius: 4, cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 7, background: 'none', border: '1px solid rgba(255,255,255,.08)', color: 'var(--dim)' }}
                    >Market: {item.price}sa</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Badges */}
      <div>
        <SectionLabel>BAŞARI ROZETLERİ</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {mockBadges.map(badge => (
            <div
              key={badge.id}
              className="card"
              style={{
                padding: 10, textAlign: 'center',
                opacity: badge.unlocked ? 1 : 0.35,
                filter: badge.unlocked ? 'none' : 'grayscale(1)',
                cursor: 'pointer',
              }}
              data-tooltip={badge.unlocked ? badge.description : badge.condition}
            >
              <div style={{ fontSize: badge.unlocked ? 24 : 18, marginBottom: 4 }}>{badge.emoji}</div>
              {badge.unlocked ? (
                <div style={{ fontFamily: 'Space Mono', fontSize: 6, color: 'var(--muted)', lineHeight: 1.3 }}>{badge.name}</div>
              ) : (
                <div style={{ fontFamily: 'Space Mono', fontSize: 6, color: 'var(--dim)' }}>🔒 ???</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rank Badge */}
      <div>
        <SectionLabel>RANK</SectionLabel>
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚔️</div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: '#F97316', letterSpacing: 2 }}>ÜSTAT</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', marginBottom: 12 }}>
            {user.totalHours} toplam saat
          </div>
          <ProgressBar value={((user.totalHours - 400) / 400) * 100} variant="amber" height={5} />
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginTop: 6 }}>
            Efsane&apos;ye {800 - user.totalHours} saat kaldı
          </div>
        </div>
      </div>
    </div>
  );
}
