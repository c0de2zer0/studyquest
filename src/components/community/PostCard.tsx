'use client';
import { useState } from 'react';
import type { CommunityPost } from '@/lib/mock-data';
import { SUBJECTS } from '@/lib/constants';

const REACTION_EMOJIS = ['🔥', '💪', '❤️', '🎉', '😤', '👑'];

export function PostCard({ post, onReact, onJoin, onUserClick }: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
  onJoin?: (id: string) => void;
  onUserClick?: (user: { id: string; name: string; emoji: string; color: string }) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isChallenge = post.type === 'challenge';
  const joined = (post.participants ?? []).includes('me');

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${isChallenge ? 'rgba(123,92,245,.3)' : 'rgba(255,255,255,.07)'}`,
      borderRadius: 12, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          onClick={() => onUserClick?.({ id: post.userId, name: post.userName, emoji: post.userEmoji, color: post.userColor })}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: post.userColor + '33', border: `2px solid ${post.userColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            cursor: onUserClick ? 'pointer' : 'default',
          }}>{post.userEmoji}</div>
        <div style={{ flex: 1 }}>
          <div
            onClick={() => onUserClick?.({ id: post.userId, name: post.userName, emoji: post.userEmoji, color: post.userColor })}
            style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: post.userColor, cursor: onUserClick ? 'pointer' : 'default', display: 'inline-block' }}>
            {post.userName}
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>{post.timestamp}</div>
        </div>
        {isChallenge && (
          <span style={{ fontFamily: 'Space Mono', fontSize: 8, padding: '3px 8px',
            background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.4)',
            borderRadius: 20, color: '#A78BFA' }}>YARIŞMA</span>
        )}
      </div>
      {/* Content */}
      <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
        {post.content}
      </div>
      {/* Challenge info */}
      {isChallenge && post.subject && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(123,92,245,.08)', borderRadius: 8, padding: '8px 12px' }}>
          <span style={{ fontSize: 16 }}>{SUBJECTS.find(s => s.name === post.subject)?.emoji ?? '📚'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: post.subjectColor ?? 'var(--text)' }}>
              {post.subject}
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>
              {post.durationMin} dk · {(post.participants ?? []).length} katılımcı
            </div>
          </div>
          <button onClick={() => onJoin?.(post.id)} style={{
            fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700,
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
            background: joined ? 'rgba(16,185,129,.15)' : 'rgba(123,92,245,.8)',
            border: `1px solid ${joined ? 'rgba(16,185,129,.5)' : 'rgba(123,92,245,1)'}`,
            color: joined ? '#10B981' : '#FFFFFF',
          }}>{joined ? '✓ KATILDIN' : 'KATIL'}</button>
        </div>
      )}
      {/* Reactions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
        {post.reactions.map(r => (
          <button key={r.emoji} onClick={() => onReact(post.id, r.emoji)} style={{
            background: r.reacted ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.05)',
            border: `1px solid ${r.reacted ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
            fontFamily: 'Space Mono', fontSize: 9,
            color: r.reacted ? '#A78BFA' : 'var(--dim)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>{r.emoji} {r.count}</button>
        ))}
        <button onClick={() => setShowPicker(v => !v)} style={{
          background: 'none', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)',
        }}>+ 😊</button>
        {showPicker && (
          <div style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 10,
            background: '#1A1A2E', border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8, padding: '6px 8px', display: 'flex', gap: 6 }}>
            {REACTION_EMOJIS.map(e => (
              <button key={e} onClick={() => { onReact(post.id, e); setShowPicker(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>{e}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
