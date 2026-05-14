'use client';
import { useStore } from '@/store';
import type { CommunityPost } from '@/lib/mock-data';

interface ViewingUser {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isVerified?: boolean;
}

function hashNum(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000000;
  return (h % mod) + 1;
}

function UserPost({ post }: { post: CommunityPost }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)',
      borderRadius: 10, padding: '10px 12px',
    }}>
      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', marginBottom: 5 }}>
        {post.type === 'battle' ? '⚔️ Kapışma' : post.type === 'challenge' ? '🏆 Yarışma' : '📝 Paylaşım'} · {post.timestamp}
      </div>
      <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
        {post.content}
      </div>
      {post.reactions.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {post.reactions.map(r => (
            <span key={r.emoji} style={{
              fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)',
              background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '2px 7px',
            }}>{r.emoji} {r.count}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function UserProfileModal({ user: viewUser, onClose }: {
  user: ViewingUser;
  onClose: () => void;
}) {
  const { communityPosts, showToast } = useStore(s => ({
    communityPosts: s.communityPosts,
    showToast: s.showToast,
  }));

  const userPosts = communityPosts.filter(p => p.userId === viewUser.id);

  // Deterministic mock stats based on user ID
  const mockLevel = hashNum(viewUser.id, 30);
  const mockHours = hashNum(viewUser.id + 'h', 800);
  const mockStreak = hashNum(viewUser.id + 's', 90);
  const mockTournaments = hashNum(viewUser.id + 't', 20);

  const stats = [
    { label: 'SEVİYE', value: mockLevel },
    { label: 'TOPLAM SA', value: mockHours },
    { label: 'SERİ', value: mockStreak },
    { label: 'TURNUVA', value: mockTournaments },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div style={{
        width: '100%', maxHeight: '85vh',
        background: '#0D1117', borderRadius: '16px 16px 0 0',
        border: '1px solid rgba(255,255,255,.1)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 0',
          background: `linear-gradient(135deg, ${viewUser.color}22, transparent)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)' }}>PROFİL</div>
            <button onClick={onClose} style={{
              background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
              color: '#EF4444', borderRadius: 6, padding: '3px 10px',
              fontFamily: 'Space Mono', fontSize: 9, cursor: 'pointer',
            }}>✕ Kapat</button>
          </div>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: viewUser.color + '33', border: `3px solid ${viewUser.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              boxShadow: `0 0 20px ${viewUser.color}40`,
            }}>{viewUser.emoji}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: viewUser.color }}>
                  {viewUser.name}
                </span>
                {viewUser.isVerified && (
                  <span style={{ fontSize: 14, color: '#22D3EE' }}>✓</span>
                )}
              </div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)', marginTop: 4 }}>
                {userPosts.length} paylaşım
              </div>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                flex: 1, textAlign: 'center', padding: '10px 4px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,.08)' : 'none',
                background: 'rgba(255,255,255,.03)',
              }}>
                <div style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 700, color: viewUser.color }}>{s.value}</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--dim)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => { showToast(`${viewUser.emoji} ${viewUser.name} ile arkadaş oldun!`, 'success', '🤝'); onClose(); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700,
                background: `${viewUser.color}CC`, border: 'none', color: '#fff',
              }}>+ ARKADAŞ EKLE</button>
            <button
              onClick={() => { showToast('Rando daveti gönderildi!', 'info', '⚔️'); onClose(); }}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700,
                background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)', color: '#EF4444',
              }}>⚔️ RANDO DAVET</button>
          </div>
        </div>

        {/* Posts */}
        <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)', marginBottom: 4 }}>
            SON PAYLAŞIMLAR
          </div>
          {userPosts.length === 0 ? (
            <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
              Henüz paylaşım yok
            </div>
          ) : (
            userPosts.slice(0, 5).map(p => <UserPost key={p.id} post={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
