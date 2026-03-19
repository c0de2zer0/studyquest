'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { MyRoomCard } from '@/components/community/MyRoomCard';
import { RoomSearch } from '@/components/community/RoomSearch';
import { CreateRoomModal } from '@/components/community/CreateRoomModal';
import { PostCard } from '@/components/community/PostCard';
import { BattleCard } from '@/components/community/BattleCard';
import { ChannelCard } from '@/components/community/ChannelCard';
import type { CommunityPost } from '@/lib/mock-data';

type FeedTab = 'all' | 'battle' | 'channel_post' | 'tournament';

const TABS: { key: FeedTab; label: string }[] = [
  { key: 'all', label: '🌐 Keşfet' },
  { key: 'battle', label: '⚔️ Kapışmalar' },
  { key: 'channel_post', label: '🎓 Kanallar' },
  { key: 'tournament', label: '🏆 Turnuvalar' },
];

function CreatePostBar({ onOpen }: { onOpen: () => void }) {
  const userEmoji = useStore(s => s.user.emoji);
  return (
    <button onClick={onOpen} style={{
      width: '100%', padding: '10px 14px', textAlign: 'left',
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(123,92,245,.2)', border: '2px solid rgba(123,92,245,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
        {userEmoji}
      </div>
      <span style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--muted)' }}>
        Bir şeyler paylaş ya da yarışmaya çağır...
      </span>
    </button>
  );
}

function CreatePostForm({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Omit<CommunityPost, 'id' | 'reactions' | 'timestamp' | 'userId' | 'userName' | 'userEmoji' | 'userColor'>) => void;
}) {
  const [type, setType] = useState<'post' | 'challenge'>('post');
  const [content, setContent] = useState('');
  const SUBJECTS_LIST = ['Matematik','Fizik','Kimya','Biyoloji','Edebiyat','TYT'];
  const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({
      type,
      content,
      ...(type === 'challenge' ? { subject, durationMin: duration } : {}),
    });
    onClose();
  };

  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(123,92,245,.3)',
      borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['post', 'challenge'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
            fontFamily: 'Space Mono', fontSize: 9,
            background: type === t ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.04)',
            border: `1px solid ${type === t ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
            color: type === t ? '#A78BFA' : 'var(--dim)',
          }}>{t === 'post' ? '📝 Paylaşım' : '⚔️ Yarışma'}</button>
        ))}
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder={type === 'post' ? 'Bir şeyler paylaş...' : 'Yarışmaya çağır...'} rows={2}
        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
          fontFamily: 'Rajdhani', fontSize: 13, resize: 'none', outline: 'none' }} />
      {type === 'challenge' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={subject} onChange={e => setSubject(e.target.value)} style={{
            flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 6, padding: '6px 8px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 9 }}>
            {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={{
            background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 6, padding: '6px 8px', color: 'var(--text)', fontFamily: 'Space Mono', fontSize: 9 }}>
            <option value={30}>30 dk</option>
            <option value={60}>60 dk</option>
            <option value={120}>2 sa</option>
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)' }}>İptal</button>
        <button disabled={!content.trim()} onClick={handleSubmit} style={{
          background: content.trim() ? 'rgba(123,92,245,.8)' : 'rgba(123,92,245,.3)',
          border: '1px solid rgba(123,92,245,1)', borderRadius: 6, padding: '6px 14px',
          cursor: content.trim() ? 'pointer' : 'default',
          fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: '#fff' }}>PAYLAŞ</button>
      </div>
    </div>
  );
}

export function CommunityScreen() {
  const { communityPosts, createPost, joinChallenge, addPostReaction, user } = useStore(useShallow(s => ({
    communityPosts: s.communityPosts,
    createPost: s.createPost,
    joinChallenge: s.joinChallenge,
    addPostReaction: s.addPostReaction,
    user: s.user,
  })));

  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const filteredPosts = communityPosts.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'tournament') return p.tournamentName != null;
    if (activeTab === 'channel_post') return p.isVerifiedChannel === true;
    return p.type === activeTab;
  });

  const renderPost = (post: CommunityPost) => {
    if (post.type === 'battle') return <BattleCard key={post.id} post={post} />;
    if (post.isVerifiedChannel) return <ChannelCard key={post.id} post={post} onReact={addPostReaction} />;
    return <PostCard key={post.id} post={post} onReact={addPostReaction} onJoin={joinChallenge} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Sticky room card (when in a room) */}
      <MyRoomCard />

      {/* Room search */}
      <RoomSearch onCreateClick={() => setShowCreateRoom(true)} />

      {/* Feed tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '5px 12px', borderRadius: 16, whiteSpace: 'nowrap', cursor: 'pointer',
            fontFamily: 'Space Mono', fontSize: 9, flexShrink: 0,
            background: activeTab === tab.key ? 'rgba(123,92,245,.2)' : 'none',
            border: `1px solid ${activeTab === tab.key ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
            color: activeTab === tab.key ? '#A78BFA' : 'var(--dim)',
          }}>{tab.label}</button>
        ))}
      </div>

      {/* Create post bar / form */}
      {!showCreate
        ? <CreatePostBar onOpen={() => setShowCreate(true)} />
        : <CreatePostForm onClose={() => setShowCreate(false)}
            onSubmit={(data) => createPost({
              ...data, userId: user.id, userName: user.name,
              userEmoji: user.emoji, userColor: '#7B5CF5',
            })} />
      }

      {/* Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredPosts.map(renderPost)}
      </div>

      {/* Create room modal */}
      {showCreateRoom && <CreateRoomModal onClose={() => setShowCreateRoom(false)} />}
    </div>
  );
}
