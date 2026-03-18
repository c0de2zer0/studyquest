'use client';
import { useStore } from '@/store';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { Badge } from '@/components/atoms/Badge';
import { ProgressBar } from '@/components/atoms/ProgressBar';
import { mockLeaderboard } from '@/lib/mock-data';
import { RANK_TIERS, RANK_TIER_COLORS, RANK_TIER_EMOJIS } from '@/lib/constants';
import { RankBadge } from '@/components/RankBadge';
import { useCountdown } from '@/hooks/useCountdown';
import { useState } from 'react';

const VIEW_TABS = ['Haftalık', 'Aylık', 'Tüm Zamanlar', 'Arkadaşlar', 'Matematik'];

function mockTierForRank(rank: number): string {
  if (rank <= 2) return 'Elmas';
  if (rank <= 4) return 'Platin';
  if (rank <= 8) return 'Altın';
  if (rank <= 15) return 'Gümüş';
  return 'Bronz';
}

// Different mock data per view tab to simulate different leaderboards
const VIEW_DATA: Record<string, typeof mockLeaderboard> = {
  'Haftalık': mockLeaderboard,
  'Aylık': mockLeaderboard.map((e, i) => ({ ...e, rank: i + 1, xp: e.xp * 4, score: e.xp * 4 })),
  'Tüm Zamanlar': mockLeaderboard.map((e, i) => ({ ...e, rank: i + 1, xp: e.totalHours * 100, score: e.totalHours * 100 })),
  'Arkadaşlar': mockLeaderboard.slice(0, 5),
  'Matematik': mockLeaderboard.map((e, i) => ({ ...e, rank: i + 1, xp: Math.floor(e.xp * 0.36), score: Math.floor(e.xp * 0.36) })),
};

export function LeaderboardScreen() {
  const { user } = useStore();
  const [activeView, setActiveView] = useState('Haftalık');
  const countdown = useCountdown(3 * 86400 + 14 * 3600);
  const data = VIEW_DATA[activeView] || mockLeaderboard;
  const myEntry = data.find(e => e.isMe);

  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>SIRALAMA</div>
        <span className="badge badge-amber">⏰ {countdown.formatted} KALDI</span>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-scrollbar">
        {VIEW_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            style={{
              fontFamily: 'Space Mono', fontSize: 8, padding: '6px 12px', borderRadius: 6,
              whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              background: activeView === tab ? 'rgba(123,92,245,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${activeView === tab ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.08)'}`,
              color: activeView === tab ? '#9D82F8' : 'var(--dim)',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* League Status Card */}
      <div className="card card-amber" style={{ border: '1px solid rgba(245,158,11,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: '#F59E0B', fontWeight: 700 }}>ALTIN LİG</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>18/30 Kişi</span>
        </div>
        <ProgressBar value={60} variant="amber" height={6} className="mb-2" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#10B981' }}>↑ Üst 10 → Platin</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#EF4444' }}>↓ Alt 5 → Gümüş</span>
        </div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#22D3EE' }}>Sen #5 sıralamadasın</div>
        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginTop: 4 }}>
          Bu hafta: {user.weeklyXp.toLocaleString()} XP · Geçen hafta: {user.weeklyXpPrev.toLocaleString()} XP
          <span style={{ color: '#10B981' }}> (+{Math.round((user.weeklyXp / user.weeklyXpPrev - 1) * 100)}%)</span>
        </div>
      </div>

      {/* Podium */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
          {/* 2nd place */}
          {data[1] && (
            <div style={{ flex: 1, textAlign: 'center', paddingTop: 16, paddingBottom: 0 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🥈</div>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(192,192,192,.1)', border: '1px solid rgba(192,192,192,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, margin: '0 auto 4px' }}>{data[1].emoji}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>{data[1].name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#C0C0C0' }}>{data[1].xp.toLocaleString()}</div>
            </div>
          )}
          {/* 1st place */}
          {data[0] && (
            <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,215,0,.05)', border: '1px solid rgba(255,215,0,.18)', borderRadius: 8, padding: '10px 4px', paddingTop: 0 }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>🥇</div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 4px' }}>{data[0].emoji}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 700, color: '#FFD700' }}>{data[0].name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 10, color: '#FFD700' }}>{data[0].xp.toLocaleString()}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)', marginTop: 2 }}>HAFTA ŞAMPİYONU</div>
            </div>
          )}
          {/* 3rd place */}
          {data[2] && (
            <div style={{ flex: 1, textAlign: 'center', paddingTop: 24 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🥉</div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(205,127,50,.1)', border: '1px solid rgba(205,127,50,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, margin: '0 auto 4px' }}>{data[2].emoji}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>{data[2].name}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: '#CD7F32' }}>{data[2].xp.toLocaleString()}</div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.slice(3).map(entry => (
          <div key={entry.rank} className="card" style={{
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0,
            background: entry.isMe ? 'rgba(123,92,245,.07)' : 'var(--s1)',
            border: entry.isMe ? '1px solid rgba(123,92,245,.25)' : '1px solid rgba(255,255,255,.04)',
          }}>
            <span style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: medalColors[entry.rank - 1] || 'var(--dim)', width: 22, textAlign: 'center', flexShrink: 0 }}>{entry.rank}</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: entry.isMe ? '2px solid #7B5CF5' : 'none', flexShrink: 0 }}>{entry.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 12, fontWeight: 700, color: entry.isMe ? '#22D3EE' : 'var(--text)' }}>
                {entry.name} {entry.isMe && <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>(Sen)</span>}
              </div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>LV.{entry.level} · {entry.totalHours}sa toplam</div>
            </div>
            <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: entry.isMe ? '#7B5CF5' : '#22D3EE', flexShrink: 0 }}>{entry.xp.toLocaleString()}</span>
            <div style={{ flexShrink: 0 }}>
              <RankBadge
                tier={entry.isMe ? user.rankTier : mockTierForRank(entry.rank)}
                division={entry.isMe ? user.rankDivision : 4}
                lp={entry.isMe ? user.lp : 0}
                size="sm"
              />
            </div>
            <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: (entry.trend || 0) > 0 ? '#10B981' : (entry.trend || 0) < 0 ? '#EF4444' : 'var(--dim)', flexShrink: 0, width: 28 }}>
              {(entry.trend || 0) > 0 ? `↑${entry.trend}` : (entry.trend || 0) < 0 ? `↓${Math.abs(entry.trend || 0)}` : '—'}
            </span>
          </div>
        ))}
        {myEntry && (
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: '#10B981', textAlign: 'center', marginTop: 6 }}>
            ↑2 bu hafta · Bu hafta ligin %{Math.round((1 - (myEntry.rank - 1) / data.length) * 100)} üzerindesin
          </div>
        )}
      </div>

      {/* Rank System */}
      <div>
        <SectionLabel>RANK SİSTEMİ</SectionLabel>
        <div className="card">
          {RANK_TIERS.map((tier, i) => {
            const isCurrentTier = tier === user.rankTier;
            return (
              <div key={tier} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                borderBottom: i < RANK_TIERS.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
                background: isCurrentTier ? `${RANK_TIER_COLORS[tier]}0D` : 'transparent',
                borderRadius: isCurrentTier ? 6 : 0,
                paddingLeft: isCurrentTier ? 6 : 0,
                paddingRight: isCurrentTier ? 6 : 0,
              }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{RANK_TIER_EMOJIS[tier]}</span>
                <div style={{ flex: 1 }}>
                  <RankBadge
                    tier={tier}
                    division={isCurrentTier ? user.rankDivision : 4}
                    lp={isCurrentTier ? user.lp : 0}
                    size="sm"
                  />
                </div>
                {isCurrentTier && <Badge variant="purple">MEVCUT</Badge>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Personal Stats */}
      <div>
        <SectionLabel>HAFTALIK KİŞİSEL STATLAR</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 42, fontWeight: 700, color: '#10B981' }}>+2</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>↑ Bu hafta sıra</div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontFamily: 'Orbitron', fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>{user.weeklyXp.toLocaleString()}</div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Bu hafta XP</div>
          </div>
        </div>
      </div>
    </div>
  );
}
