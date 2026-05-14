'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import type { CommunityPost } from '@/lib/mock-data';

function TournamentCard({ post }: { post: CommunityPost }) {
  const showToast = useStore(s => s.showToast);
  const pct = Math.round(((post.tournamentParticipants ?? 0) / (post.tournamentCapacity ?? 1)) * 100);

  return (
    <div style={{ background: '#0D1117', border: `1px solid ${post.channelBorderColor}33`,
      borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 700,
        color: post.channelBorderColor, marginBottom: 4 }}>🏆 {post.tournamentName}</div>
      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 6 }}>
        Ödül: {post.tournamentPrize} · Başlangıç: {post.tournamentStartTime}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>👥 Katılımcılar</span>
        <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: post.channelBorderColor }}>
          {post.tournamentParticipants} / {post.tournamentCapacity}
        </span>
      </div>
      <div style={{ background: '#1E293B', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4,
          background: `linear-gradient(90deg, ${post.channelBorderColor}, ${post.channelBorderColor}99)` }} />
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => showToast(`${post.tournamentName} turnuvasına katıldın! 🏆`, 'success', '⚔️')}
          style={{ flex: 1, background: post.channelBorderColor, color: post.channelBorderColor === '#FFD700' ? '#000' : '#fff',
            border: 'none', padding: 7, borderRadius: 8,
            fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
          ⚔️ TURNUVAYA KATIL
        </button>
      </div>
    </div>
  );
}

export function ChannelCard({ post, onReact, onUserClick }: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
  onUserClick?: (user: { id: string; name: string; emoji: string; color: string }) => void;
}) {
  const [following, setFollowing] = useState(false);
  const borderColor = post.channelBorderColor ?? '#7B5CF5';

  return (
    <div style={{ background: '#111827', border: `2px solid ${borderColor}`,
      borderRadius: 12, padding: '12px 14px', position: 'relative' }}>
      {/* Verified badge */}
      <div style={{ position: 'absolute', top: -10, left: 12,
        background: borderColor, color: borderColor === '#FFD700' ? '#000' : '#fff',
        padding: '2px 10px', borderRadius: 8,
        fontSize: 8, fontFamily: 'Orbitron', fontWeight: 700 }}>
        ✦ ONAYLI KANAL
      </div>
      {/* Channel header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 8 }}>
        <div
          onClick={() => onUserClick?.({ id: post.userId, name: post.channelName ?? post.userName, emoji: post.channelEmoji ?? post.userEmoji, color: borderColor })}
          style={{ width: 36, height: 36, background: borderColor + '33',
            border: `2px solid ${borderColor}`, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            cursor: onUserClick ? 'pointer' : 'default' }}>
          {post.channelEmoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span
              onClick={() => onUserClick?.({ id: post.userId, name: post.channelName ?? post.userName, emoji: post.channelEmoji ?? post.userEmoji, color: borderColor })}
              style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: borderColor, cursor: onUserClick ? 'pointer' : 'default' }}>
              {post.channelName}
            </span>
            <span style={{ color: borderColor, fontSize: 12 }}>✓</span>
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
            {((post.followerCount ?? 0) / 1000).toFixed(0)}K takipçi · {post.timestamp}
          </div>
        </div>
        <button onClick={() => setFollowing(v => !v)} style={{
          background: following ? 'rgba(16,185,129,.15)' : borderColor + '22',
          border: `1px solid ${following ? 'rgba(16,185,129,.5)' : borderColor + '66'}`,
          color: following ? '#10B981' : borderColor,
          padding: '4px 10px', borderRadius: 8,
          fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>
          {following ? '✓ TAKİP' : 'TAKİP ET'}
        </button>
      </div>
      {/* Content */}
      {post.content && (
        <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5, marginBottom: 8 }}>
          {post.content}
        </div>
      )}
      {/* Tournament embed */}
      {post.tournamentName && <TournamentCard post={post} />}
    </div>
  );
}
