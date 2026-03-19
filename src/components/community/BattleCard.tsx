'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import type { CommunityPost } from '@/lib/mock-data';

export function BattleCard({ post }: { post: CommunityPost }) {
  const setActiveTab = useStore(s => s.setActiveTab);
  const [showScore, setShowScore] = useState(false);
  const p1 = post.player1!;
  const p2 = post.player2!;
  const mins = Math.floor((post.timeRemainingSeconds ?? 0) / 60);
  const secs = (post.timeRemainingSeconds ?? 0) % 60;

  return (
    <div style={{ background: '#111827', border: '1px solid rgba(239,68,68,.4)',
      borderRadius: 12, padding: '12px 14px', position: 'relative' }}>
      {/* Badge */}
      <div style={{ position: 'absolute', top: -10, left: 12,
        background: '#EF4444', color: '#fff', padding: '2px 10px',
        borderRadius: 8, fontSize: 8, fontFamily: 'Orbitron', fontWeight: 700 }}>
        ⚔️ CANLI KAPIŞMA
      </div>
      {/* VS row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, background: p1.color + '33', border: `1.5px solid ${p1.color}`,
          borderRadius: '50%', textAlign: 'center', lineHeight: '26px', fontSize: 14, flexShrink: 0 }}>{p1.emoji}</div>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11, color: p1.color }}>{p1.name}</div>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: 'Orbitron', fontSize: 14, fontWeight: 900, color: '#EF4444' }}>VS</div>
        <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11, color: p2.color }}>{p2.name}</div>
        <div style={{ width: 28, height: 28, background: p2.color + '33', border: `1.5px solid ${p2.color}`,
          borderRadius: '50%', textAlign: 'center', lineHeight: '26px', fontSize: 14, flexShrink: 0 }}>{p2.emoji}</div>
      </div>
      {/* Score bars */}
      <div style={{ background: '#0D1117', borderRadius: 8, padding: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: p1.color }}>{p1.score} / 100</span>
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>📐 {post.battleSubject}</span>
          <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: p2.color }}>{p2.score} / 100</span>
        </div>
        <div style={{ display: 'flex', gap: 2, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: 8, background: p1.color, flex: p1.score }} />
          <div style={{ height: 8, background: p2.color, flex: p2.score }} />
        </div>
        <div style={{ textAlign: 'center', fontFamily: 'Space Mono', fontSize: 8, color: '#EF4444', marginTop: 4 }}>
          ⏱ {mins}:{String(secs).padStart(2, '0')} kaldı
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => setShowScore(v => !v)} style={{
          flex: 1, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
          color: '#EF4444', padding: 6, borderRadius: 8,
          fontFamily: 'Space Mono', fontSize: 9, cursor: 'pointer' }}>👁 İzle</button>
        <button onClick={() => setActiveTab('rando')} style={{
          flex: 1, background: 'rgba(123,92,245,.1)', border: '1px solid rgba(123,92,245,.3)',
          color: '#A78BFA', padding: 6, borderRadius: 8,
          fontFamily: 'Space Mono', fontSize: 9, cursor: 'pointer' }}>⚔️ Meydan Oku</button>
      </div>
      {/* Expanded score detail */}
      {showScore && (
        <div style={{ marginTop: 8, background: '#0D1117', borderRadius: 8, padding: 8,
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
          {p1.name}: {p1.score} · {p2.name}: {p2.score} — {post.battleSubject} kapışması devam ediyor
        </div>
      )}
    </div>
  );
}
