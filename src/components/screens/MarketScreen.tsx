'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { useState, useEffect } from 'react';
import { AVATAR_LAYER_MAP, BACKGROUND_PALETTES } from '@/lib/avatar-layers';
import type { MarketItem } from '@/store';

const RARITY_COLORS: Record<string, string> = {
  common: '#64748B', rare: '#22D3EE', epic: '#A78BFA', legendary: '#FFD700',
};

const CATEGORIES = ['Tümü', '🎓 Şapka', '💇 Saç', '🧥 Üst', '👖 Alt', '👟 Ayakkabı', '💎 Aksesuar', '🌌 Arka Plan', '🎭 Kostüm'];
const CAT_KEYS   = ['all',  'hat',     'hair',    'top',   'bottom', 'shoes',       'accessory',   'background',   'costume'];

function ItemPixelPreview({ item }: { item: MarketItem }) {
  if (item.category === 'background') {
    const colors = BACKGROUND_PALETTES[item.id] ?? ['#1A1A2E', '#0F0F1A', '#2D1B69'];
    return (
      <div style={{
        width: 28, height: 18, borderRadius: 3, flexShrink: 0,
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        border: '1px solid rgba(255,255,255,.1)',
      }} />
    );
  }
  if (item.category === 'costume') {
    return (
      <div style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</div>
    );
  }
  const layerDef = AVATAR_LAYER_MAP[item.id];
  if (!layerDef) return null;

  const slotViewBoxes: Record<string, { vb: string; w: number; h: number }> = {
    hat:       { vb: '0 0 16 8',  w: 20, h: 10 },
    hair:      { vb: '0 0 16 8',  w: 20, h: 10 },
    top:       { vb: '0 0 16 22', w: 20, h: 28 },
    bottom:    { vb: '0 0 16 32', w: 18, h: 28 },
    shoes:     { vb: '0 0 16 32', w: 18, h: 28 },
    accessory: { vb: '0 0 16 32', w: 12, h: 24 },
  };
  const dims = slotViewBoxes[item.category];
  if (!dims) return null;

  return (
    <svg
      viewBox={dims.vb}
      width={dims.w}
      height={dims.h}
      style={{ imageRendering: 'pixelated', border: '1px solid rgba(255,255,255,.08)', borderRadius: 2, flexShrink: 0 }}
      aria-hidden="true"
    >
      {layerDef.pixels.map((rect, i) => (
        <rect key={i} x={rect.x} y={rect.y} width={rect.w} height={rect.h} fill={rect.color} />
      ))}
    </svg>
  );
}

const EARNING_ROWS = [
  { action: '1 saat çalışma', reward: '+1 sa' },
  { action: 'Günlük seri bonusu', reward: '+0.1 sa/gün' },
  { action: 'Görev tamamlama', reward: '+0.25 sa' },
  { action: 'Rando seans bitirme', reward: '+1.5 sa' },
  { action: 'Turnuva 1. sıra', reward: '+10 sa' },
  { action: 'Turnuva 2. sıra', reward: '+5 sa' },
  { action: 'Turnuva 3. sıra', reward: '+2 sa' },
  { action: 'Haftalık hedef', reward: '+3 sa' },
  { action: 'Mükemmel hafta (7/7)', reward: '+5 sa' },
  { action: 'İlk giriş bonusu', reward: '+5 sa (tek)' },
  { action: 'Arkadaş davet et', reward: '+2 sa (ikisi)' },
];

export function MarketScreen() {
  const { user, items, buyItem, equipItem, unequipItem, marketCategory, marketSort, marketSearch, setMarketCategory, setMarketSort, setMarketSearch } = useStore();

  const [dailySeconds, setDailySeconds] = useState(11 * 3600 + 42 * 60 + 30);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDailySeconds(s => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const dailyDeal = items.find(i => (i as any).isDaily);

  // Filter items
  const filteredItems = items.filter(item => {
    if ((item as any).isDaily) return false;
    if (marketCategory !== 'all' && item.category !== marketCategory) return false;
    if (marketSearch && !item.name.toLowerCase().includes(marketSearch.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
    if (marketSort === 'rarity') return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
    if (marketSort === 'price_asc') return a.price - b.price;
    if (marketSort === 'price_desc') return b.price - a.price;
    return 0;
  });

  const handleBuy = (id: string) => {
    const success = buyItem(id);
    if (success) setPurchasedIds(prev => [...prev, id]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>MARKET</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
            Koleksiyon: {user.collectionCount}/{user.collectionTotal} (%{Math.round(user.collectionCount / user.collectionTotal * 100)})
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Orbitron', fontSize: 16, color: '#F59E0B' }}>⏱ {user.balance.toFixed(1)} sa</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <input
          value={marketSearch}
          onChange={e => setMarketSearch(e.target.value)}
          placeholder="🔍 Eşya ara..."
          style={{
            width: '100%', background: 'var(--s1)', border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontFamily: 'Space Mono', fontSize: 10,
          }}
        />
      </div>

      {/* Daily Deal */}
      {dailyDeal && (
        <div className="card card-amber" style={{ border: '1px solid rgba(245,158,11,.3)', boxShadow: '0 0 20px rgba(245,158,11,.08)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#F59E0B', letterSpacing: 2 }}>GÜNÜN FIRSATI</span>
          </div>
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="badge badge-red">%30 İNDİRİM</span>
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 48 }}>{dailyDeal.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{dailyDeal.name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Efsanevi · Sezonluk</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#F59E0B', marginTop: 4 }}>⏰ {formatCountdown(dailySeconds)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 11, color: 'var(--dim)', textDecoration: 'line-through' }}>{dailyDeal.price} sa</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 22, color: '#F59E0B' }}>{(dailyDeal as any).dailyPrice} sa</div>
              <button
                className="btn-gradient"
                style={{ padding: '6px 16px', marginTop: 4, fontSize: 9 }}
                onClick={() => handleBuy(dailyDeal.id)}
                disabled={dailyDeal.owned}
              >
                {dailyDeal.owned ? 'SAHİPSİN' : 'SATIN AL'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
        {CATEGORIES.map((cat, i) => {
          const key = CAT_KEYS[i];
          const isActive = marketCategory === key;
          return (
            <button
              key={cat}
              onClick={() => setMarketCategory(key)}
              style={{
                fontFamily: 'Space Mono', fontSize: 8, padding: '5px 10px', borderRadius: 6,
                whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                background: isActive ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${isActive ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.08)'}`,
                color: isActive ? '#9D82F8' : 'var(--dim)',
                position: 'relative',
              }}
            >
              {cat}
              {key === 'costume' && (
                <span style={{ position: 'absolute', top: -2, right: -2, width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>Sırala:</span>
        {[['rarity', 'Nadirlik'], ['price_asc', 'Fiyat ↑'], ['price_desc', 'Fiyat ↓']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMarketSort(val)}
            style={{
              fontFamily: 'Space Mono', fontSize: 8, padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
              background: marketSort === val ? 'rgba(123,92,245,.15)' : 'none',
              border: `1px solid ${marketSort === val ? 'rgba(123,92,245,.4)' : 'rgba(255,255,255,.06)'}`,
              color: marketSort === val ? '#9D82F8' : 'var(--dim)',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Item Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {filteredItems.map(item => {
          const rc = RARITY_COLORS[item.rarity];
          const price = item.price;
          const canAfford = user.balance >= price;

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: 10, textAlign: 'center', position: 'relative',
                border: item.equipped ? `1px solid rgba(123,92,245,.4)` : item.owned ? `1px solid ${rc}30` : !canAfford ? `1px solid rgba(239,68,68,.2)` : '1px solid rgba(255,255,255,.06)',
                '--shine-color': rc,
              } as React.CSSProperties}
            >
              {/* Shine line in rarity color */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${rc}, transparent)`, opacity: 0.6 }} />

              {item.equipped && (
                <div style={{ position: 'absolute', top: 6, right: 4 }}>
                  <span className="badge badge-purple" style={{ fontSize: 6 }}>GİYİLİ ✓</span>
                </div>
              )}
              {item.owned && !item.equipped && (
                <div style={{ position: 'absolute', top: 6, right: 4 }}>
                  <span className="badge badge-green" style={{ fontSize: 6 }}>SAHİPSİN</span>
                </div>
              )}
              {!item.owned && !canAfford && (
                <div style={{ position: 'absolute', top: 6, left: 4 }}>
                  <span className="badge badge-red" style={{ fontSize: 6 }}>YETERSİZ</span>
                </div>
              )}

              <div style={{ fontSize: 28, margin: '8px 0 4px' }}>{item.emoji}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: rc, letterSpacing: 1, marginBottom: 3 }}>{item.rarity.toUpperCase()}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--text)', marginBottom: 4, lineHeight: 1.3, minHeight: 28 }}>{item.name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: !canAfford && !item.owned ? '#EF4444' : '#F59E0B', marginBottom: 6 }}>⏱ {price} sa</div>

              {!item.owned && (
                <button
                  onClick={() => handleBuy(item.id)}
                  disabled={!canAfford}
                  style={{
                    width: '100%', padding: '6px 0', borderRadius: 4, cursor: canAfford ? 'pointer' : 'not-allowed',
                    background: canAfford ? 'linear-gradient(135deg, #7B5CF5, #22D3EE)' : 'rgba(255,255,255,.04)',
                    border: canAfford ? 'none' : '1px solid rgba(255,255,255,.08)',
                    color: canAfford ? 'white' : 'var(--dim)',
                    fontFamily: 'Orbitron', fontSize: 7, fontWeight: 700,
                    opacity: canAfford ? 1 : 0.6,
                  }}
                  data-tooltip={!canAfford ? `Bu eşyayı almak için ${(price - user.balance).toFixed(1)} sa daha kazanman gerekiyor` : undefined}
                >
                  {canAfford ? 'SATIN AL' : 'YETERSİZ'}
                </button>
              )}
              {item.owned && !item.equipped && (
                <button
                  onClick={() => equipItem(item.id)}
                  style={{ width: '100%', padding: '6px 0', borderRadius: 4, cursor: 'pointer', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.3)', color: '#10B981', fontFamily: 'Orbitron', fontSize: 7, fontWeight: 700 }}
                >GİY</button>
              )}
              {item.owned && item.equipped && (
                <button
                  onClick={() => unequipItem(item.id)}
                  style={{ width: '100%', padding: '6px 0', borderRadius: 4, cursor: 'pointer', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', fontFamily: 'Orbitron', fontSize: 7, fontWeight: 700 }}
                >ÇIKAR</button>
              )}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--dim)' }}>🛍️ Arama sonucu bulunamadı.</div>
        </div>
      )}

      {/* Earning methods */}
      <div>
        <SectionLabel>NASIL KAZANILIR?</SectionLabel>
        <div className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {EARNING_ROWS.map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < EARNING_ROWS.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
              }}>
                <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--muted)' }}>{row.action}</span>
                <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#F59E0B', flexShrink: 0 }}>{row.reward}</span>
              </div>
            ))}
            {/* Today earned */}
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: '#10B981' }}>Bugün kazandın</span>
              <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#10B981' }}>+4.7 sa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
