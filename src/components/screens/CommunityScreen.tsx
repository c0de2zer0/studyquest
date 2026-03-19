'use client';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { useState } from 'react';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SUBJECTS } from '@/lib/constants';
import type { CommunityPost } from '@/lib/mock-data';

const REACTION_EMOJIS = ['🔥', '💪', '❤️', '🎉', '😤', '👑'];

function PostCard({ post, onJoin, onReact }: {
  post: CommunityPost;
  onJoin: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}) {
  const isChallenge = post.type === 'challenge';
  const alreadyJoined = (post.participants ?? []).includes('me');
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: `1px solid ${isChallenge ? 'rgba(123,92,245,.3)' : 'rgba(255,255,255,.07)'}`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: post.userColor + '33',
          border: `2px solid ${post.userColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>{post.userEmoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: post.userColor }}>
            {post.userName}
          </div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>
            {post.timestamp}
          </div>
        </div>
        {isChallenge && (
          <div style={{
            fontFamily: 'Space Mono', fontSize: 8, padding: '3px 8px',
            background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.4)',
            borderRadius: 20, color: '#A78BFA',
          }}>YARIŞMA</div>
        )}
      </div>

      {/* Content */}
      <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
        {post.content}
      </div>

      {/* Challenge info bar */}
      {isChallenge && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          background: 'rgba(123,92,245,.08)', borderRadius: 8, padding: '8px 12px',
        }}>
          <span style={{ fontSize: 16 }}>{SUBJECTS.find(s => s.name === post.subject)?.emoji ?? '📚'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: post.subjectColor ?? 'var(--text)' }}>
              {post.subject}
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)' }}>
              {post.durationMin} dk · {(post.participants ?? []).length} katılımcı
            </div>
          </div>
          <button
            onClick={() => onJoin(post.id)}
            style={{
              fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700,
              padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              background: alreadyJoined ? 'rgba(16,185,129,.15)' : 'rgba(123,92,245,.8)',
              border: `1px solid ${alreadyJoined ? 'rgba(16,185,129,.5)' : 'rgba(123,92,245,1)'}`,
              color: alreadyJoined ? '#10B981' : '#FFFFFF',
            }}
          >
            {alreadyJoined ? '✓ KATILDIN' : 'KATIL'}
          </button>
        </div>
      )}

      {/* Reactions + emoji picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
        {post.reactions.map(r => (
          <button
            key={r.emoji}
            onClick={() => onReact(post.id, r.emoji)}
            style={{
              background: r.reacted ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${r.reacted ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 9,
              color: r.reacted ? '#A78BFA' : 'var(--dim)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {r.emoji} {r.count}
          </button>
        ))}
        <button
          onClick={() => setShowReactions(v => !v)}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
            fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)',
          }}
        >+ 😊</button>
        {showReactions && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, zIndex: 10,
            background: '#1A1A2E', border: '1px solid rgba(255,255,255,.15)',
            borderRadius: 8, padding: '6px 8px', display: 'flex', gap: 6,
          }}>
            {REACTION_EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { onReact(post.id, e); setShowReactions(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
              >{e}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePostForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Omit<CommunityPost, 'id' | 'participants' | 'reactions' | 'timestamp' | 'userId' | 'userName' | 'userEmoji' | 'userColor'>) => void;
}) {
  const [type, setType] = useState<'post' | 'challenge'>('post');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (!content.trim()) return;
    const subj = SUBJECTS.find(s => s.name === subject);
    onSubmit({
      type,
      content,
      ...(type === 'challenge' ? {
        subject,
        subjectColor: subj?.color,
        durationMin: duration,
      } : {}),
    });
    onClose();
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(123,92,245,.3)',
      borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['post', 'challenge'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 9,
              background: type === t ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${type === t ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
              color: type === t ? '#A78BFA' : 'var(--dim)',
            }}
          >{t === 'post' ? '📝 Paylaşım' : '⚔️ Yarışma'}</button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={type === 'post' ? 'Bir şeyler paylaş...' : 'Yarışmaya çağır...'}
        rows={2}
        style={{
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
          fontFamily: 'Rajdhani', fontSize: 13, resize: 'none', outline: 'none',
        }}
      />
      {type === 'challenge' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{
              flex: 1, background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)', borderRadius: 6,
              padding: '6px 8px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 9,
            }}
          >
            {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}
          </select>
          <select
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            style={{
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)', borderRadius: 6,
              padding: '6px 8px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 9,
            }}
          >
            <option value={30}>30 dk</option>
            <option value={60}>60 dk</option>
            <option value={120}>2 sa</option>
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{
          background: 'none', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)',
        }}>İptal</button>
        <button
          disabled={!content.trim()}
          onClick={handleSubmit}
          style={{
            background: content.trim() ? 'rgba(123,92,245,.8)' : 'rgba(123,92,245,.3)',
            border: '1px solid rgba(123,92,245,1)',
            borderRadius: 6, padding: '6px 14px', cursor: content.trim() ? 'pointer' : 'default',
            fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: '#FFFFFF',
          }}
        >PAYLAŞ</button>
      </div>
    </div>
  );
}

export function CommunityScreen() {
  const {
    communityPosts, createPost, joinChallenge, addPostReaction,
  } = useStore(useShallow(s => ({
    communityPosts: s.communityPosts,
    createPost: s.createPost,
    joinChallenge: s.joinChallenge,
    addPostReaction: s.addPostReaction,
  })));
  // TODO Task 9: replace with new room/channel store fields
  const voiceRooms: { id: string; name: string; emoji: string; capacity: number; occupied: number }[] = [];
  const joinedRooms: string[] = [];
  const joinRoom = (_id: string) => {};
  const leaveRoom = (_id: string) => {};
  const openLobby = (_id: string) => {};
  const [activeChannel, setActiveChannel] = useState('genel');

  const [showCreate, setShowCreate] = useState(false);

  const mockMembers = [
    { id: 'u2', name: 'NightWolf', emoji: '🐺', statusLabel: 'Matematik çalışıyor', color: '#10B981' },
    { id: 'u4', name: 'CyberSage', emoji: '🧠', statusLabel: 'Fizik çalışıyor', color: '#10B981' },
    { id: 'u5', name: 'TechNinja', emoji: '🥷', statusLabel: 'Kimya çalışıyor', color: '#10B981' },
    { id: 'u6', name: 'MoonChild', emoji: '🌙', statusLabel: 'Çevrimiçi', color: '#22D3EE' },
    { id: 'u7', name: 'StarGazer', emoji: '⭐', statusLabel: 'Mola', color: '#F59E0B' },
    { id: 'u8', name: 'IronMind', emoji: '🏆', statusLabel: 'Rahatsız etme', color: '#EF4444' },
  ];

  const channels = [
    { id: 'genel', name: 'genel-sohbet', badge: 5 },
    { id: 'mat', name: 'yks-matematik', badge: null },
    { id: 'fiz', name: 'yks-fizik', badge: null },
    { id: 'kim', name: 'yks-kimya', badge: null },
    { id: 'mot', name: 'motivasyon', badge: null },
    { id: 'bas', name: 'basari-paylasim', badge: null },
  ];

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 120px)', minHeight: 500, overflow: 'hidden' }}>

      {/* LEFT SIDEBAR */}
      <div style={{
        width: 190, flexShrink: 0, overflowY: 'auto',
        borderRight: '1px solid rgba(255,255,255,.07)',
        paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div>
          <SectionLabel>SESLİ ODALAR</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {voiceRooms.map(room => {
              const joined = joinedRooms.includes(room.id);
              return (
                <div key={room.id} style={{
                  borderRadius: 6, padding: '6px 8px',
                  background: joined ? 'rgba(123,92,245,.12)' : 'rgba(255,255,255,.03)',
                  border: `1px solid ${joined ? 'rgba(123,92,245,.3)' : 'rgba(255,255,255,.06)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{room.emoji}</span>
                    <span style={{ fontFamily: 'Rajdhani', fontSize: 11, flex: 1, color: 'var(--text)' }}>{room.name}</span>
                    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{room.occupied}/{room.capacity}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => joined ? leaveRoom(room.id) : joinRoom(room.id)}
                      style={{
                        flex: 1, fontSize: 8, padding: '3px 0',
                        fontFamily: 'Space Mono', borderRadius: 4, cursor: 'pointer',
                        background: joined ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
                        border: `1px solid ${joined ? 'rgba(239,68,68,.4)' : 'rgba(16,185,129,.4)'}`,
                        color: joined ? '#EF4444' : '#10B981',
                      }}
                    >{joined ? 'AYRIL' : 'KATIL'}</button>
                    {joined && (
                      <button
                        onClick={() => openLobby(room.id)}
                        style={{
                          fontSize: 8, padding: '3px 8px',
                          fontFamily: 'Space Mono', borderRadius: 4, cursor: 'pointer',
                          background: 'rgba(123,92,245,.2)',
                          border: '1px solid rgba(123,92,245,.5)',
                          color: '#A78BFA',
                        }}
                      >LOBİ</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel>KANALLAR</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                style={{
                  background: activeChannel === ch.id ? 'rgba(255,255,255,.08)' : 'none',
                  border: 'none', borderRadius: 6, padding: '5px 8px',
                  cursor: 'pointer', textAlign: 'left', display: 'flex',
                  alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontFamily: 'Space Mono', fontSize: 10, color: 'var(--muted)' }}>#</span>
                <span style={{
                  fontFamily: 'Rajdhani', fontSize: 12,
                  fontWeight: activeChannel === ch.id ? 700 : 400,
                  color: activeChannel === ch.id ? 'var(--text)' : 'var(--dim)',
                  flex: 1,
                }}>{ch.name}</span>
                {ch.badge != null && (
                  <span style={{
                    background: '#7B5CF5', borderRadius: 8,
                    padding: '1px 5px', fontSize: 8, color: '#fff',
                    fontFamily: 'Space Mono',
                  }}>{ch.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER — POST FEED */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              width: '100%', padding: '10px 14px', textAlign: 'left',
              background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(123,92,245,.2)', border: '2px solid rgba(123,92,245,.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🦊</div>
            <span style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--muted)' }}>
              Bir şeyler paylaş ya da yarışmaya çağır...
            </span>
          </button>
        ) : (
          <CreatePostForm
            onClose={() => setShowCreate(false)}
            onSubmit={(data) => createPost({
              userId: 'me',
              userName: 'Shadow Fox',
              userEmoji: '🦊',
              userColor: '#7B5CF5',
              ...data,
            })}
          />
        )}

        {communityPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onJoin={(id) => { joinChallenge(id); openLobby(id); }}
            onReact={addPostReaction}
          />
        ))}
      </div>

      {/* RIGHT SIDEBAR — Online Members */}
      <div style={{
        width: 150, flexShrink: 0, overflowY: 'auto',
        borderLeft: '1px solid rgba(255,255,255,.07)',
        paddingLeft: 8,
      }}>
        <SectionLabel>ÇEVRİMİÇİ — {mockMembers.length}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockMembers.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(255,255,255,.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{m.emoji}</div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 8, height: 8, borderRadius: '50%',
                  background: m.color, border: '1.5px solid #07080F',
                }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{m.name}</div>
                <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>{m.statusLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
