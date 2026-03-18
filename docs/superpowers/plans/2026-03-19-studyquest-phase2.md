# StudyQuest Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add community challenge feed, fix avatar rendering, add daily quote + task tracking to dashboard, propagate integration subjects across all screens, and add daily task chart to analytics.

**Architecture:** Foundation store changes first (Task 1), then independent UI tasks (Tasks 2–6) that all read from the updated store. No WebSocket — all multiplayer is mock/simulation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand 5, Framer Motion, Lucide React. Test command: `npm run build` (no unit test framework).

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/store/index.ts` | Modify | Add `integrationSubjects`, `taskHistory`, `communityPosts`, actions |
| `src/lib/mock-data.ts` | Modify | Add mock posts, taskHistory, integrationSubjects |
| `src/lib/constants.ts` | Modify | Add `DAILY_QUOTES` array |
| `src/lib/avatar-layers.ts` | Modify | Redesign BASE_BODY_LAYER + BASE_HEAD_LAYER pixels |
| `src/components/PixelAvatar.tsx` | Modify | Better viewBox + background rect for visibility |
| `src/components/screens/AvatarScreen.tsx` | Modify | Larger preview, dark contrast bg |
| `src/components/screens/CommunityScreen.tsx` | Rewrite | Facebook-like feed + challenge posts |
| `src/components/screens/DashboardScreen.tsx` | Modify | Add daily quote card + task % card |
| `src/components/screens/AnalyticsScreen.tsx` | Modify | Add daily task completion bar chart |
| `src/components/screens/PlanScreen.tsx` | Modify | Use `allSubjects` from store |
| `src/components/screens/TimerScreen.tsx` | Modify | Subject picker uses `allSubjects` |

---

## Task 1: Store Foundation — Community Posts + Task History + Integration Subjects

**Files:**
- Modify: `src/store/index.ts`
- Modify: `src/lib/mock-data.ts`

### Step 1.1 — Add types and mock data to mock-data.ts

Add to `src/lib/mock-data.ts`:

```typescript
// After existing exports, add:

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  type: 'post' | 'challenge';
  content: string;
  subject?: string;
  subjectColor?: string;
  durationMin?: number;        // 30 | 60 | 120
  participants: string[];       // userIds who joined
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  timestamp: string;
}

export interface TaskHistoryEntry {
  date: string;   // 'YYYY-MM-DD'
  done: number;
  total: number;
}

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'p1', userId: 'u2', userName: 'NightWolf', userEmoji: '🐺', userColor: '#7B5CF5',
    type: 'challenge', content: 'Kim benimle matematik kafası yapıyor? 1 saat sprint!',
    subject: 'Matematik', subjectColor: '#7B5CF5', durationMin: 60,
    participants: ['u2', 'u3'], reactions: [{ emoji: '🔥', count: 12 }, { emoji: '💪', count: 8 }],
    timestamp: '2 dk önce',
  },
  {
    id: 'p2', userId: 'u4', userName: 'CyberSage', userEmoji: '🧠', userColor: '#22D3EE',
    type: 'post', content: 'Fizik sorusunu sonunda çözdüm! Elektrik devreleri artık kafamda net.',
    participants: [], reactions: [{ emoji: '🎉', count: 15 }, { emoji: '❤️', count: 6 }],
    timestamp: '15 dk önce',
  },
  {
    id: 'p3', userId: 'u5', userName: 'StarGazer', userEmoji: '⭐', userColor: '#F59E0B',
    type: 'challenge', content: '30 dakika kimya çalışma odası açıyorum, gelin!',
    subject: 'Kimya', subjectColor: '#F59E0B', durationMin: 30,
    participants: ['u5', 'u6', 'u7'], reactions: [{ emoji: '⚗️', count: 5 }],
    timestamp: '22 dk önce',
  },
  {
    id: 'p4', userId: 'u6', userName: 'IronMind', userEmoji: '🏆', userColor: '#10B981',
    type: 'post', content: 'Bu hafta 30 saat geçti, yeni rekor! Rank atlıyorum galiba 😤',
    participants: [], reactions: [{ emoji: '🔥', count: 24 }, { emoji: '👑', count: 11 }],
    timestamp: '1 sa önce',
  },
  {
    id: 'p5', userId: 'u7', userName: 'MoonChild', userEmoji: '🌙', userColor: '#A78BFA',
    type: 'challenge', content: '2 saatlik biyoloji maratonu — sadece kararlılar gelsin',
    subject: 'Biyoloji', subjectColor: '#10B981', durationMin: 120,
    participants: ['u7'], reactions: [{ emoji: '🌿', count: 3 }],
    timestamp: '2 sa önce',
  },
  {
    id: 'p6', userId: 'u8', userName: 'TechNinja', userEmoji: '🥷', userColor: '#EF4444',
    type: 'post', content: 'YKS ye 47 gün kaldı. Hâlâ burada miyiz? Evet. Devam.',
    participants: [], reactions: [{ emoji: '💀', count: 31 }, { emoji: '😤', count: 19 }],
    timestamp: '3 sa önce',
  },
];

// Last 30 days of task history (mock, newest last)
export const mockTaskHistory: TaskHistoryEntry[] = Array.from({ length: 30 }, (_, i) => {
  const total = Math.floor(Math.random() * 3) + 3; // 3-5 tasks per day
  const done = Math.floor(Math.random() * (total + 1));
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split('T')[0],
    done,
    total,
  };
});

// Integration subjects (from Notion/Google Calendar mock)
export const mockIntegrationSubjects = [
  { id: 'int-tarih', name: 'Tarih', emoji: '📜', color: '#F97316' },
  { id: 'int-cografya', name: 'Coğrafya', emoji: '🗺️', color: '#84CC16' },
  { id: 'int-felsefe', name: 'Felsefe', emoji: '🏛️', color: '#EC4899' },
];
```

- [ ] **Step 1.1:** Add the above to the bottom of `src/lib/mock-data.ts`
- [ ] **Step 1.2:** Run `npm run build` — should still compile cleanly

### Step 1.3 — Add constants: DAILY_QUOTES

Add to `src/lib/constants.ts`:

```typescript
export interface DailyQuote {
  text: string;
  author: string;
  initials: string;
  color: string;
}

export const DAILY_QUOTES: DailyQuote[] = [
  { text: 'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.', author: 'Robert Collier', initials: 'RC', color: '#7B5CF5' },
  { text: 'Bilgi güçtür, ama uyguladığın bilgi özgürlüktür.', author: 'Francis Bacon', initials: 'FB', color: '#22D3EE' },
  { text: 'Zorlu olan şeyleri deneyin; kolaylar sizi büyütmez.', author: 'Marcus Aurelius', initials: 'MA', color: '#F59E0B' },
  { text: 'Her uzman, bir zamanlar acemi birisiydi.', author: 'Helen Hayes', initials: 'HH', color: '#10B981' },
  { text: 'Bugün yapabileceğini yarına bırakma.', author: 'Benjamin Franklin', initials: 'BF', color: '#EF4444' },
  { text: 'Başlamak, yarının başarısının yarısıdır.', author: 'Aristoteles', initials: 'AR', color: '#A78BFA' },
  { text: 'Disiplin, tutku ile hedef arasındaki köprüdür.', author: 'Jim Rohn', initials: 'JR', color: '#EC4899' },
  { text: 'Zekâ çalışmadan bir sonuç vermez.', author: 'Albert Einstein', initials: 'AE', color: '#F97316' },
  { text: 'Her büyük başarı, bir zamanlar imkânsız görünüyordu.', author: 'Nelson Mandela', initials: 'NM', color: '#84CC16' },
  { text: 'Öğrenmek bir hazinedir; sahibine her yerde eşlik eder.', author: 'Çin Atasözü', initials: 'Ç', color: '#06B6D4' },
];
```

- [ ] **Step 1.3:** Add the above to `src/lib/constants.ts`

### Step 1.4 — Update store types and state

In `src/store/index.ts`, add to imports:
```typescript
import { mockCommunityPosts, mockTaskHistory, mockIntegrationSubjects, type CommunityPost, type TaskHistoryEntry } from '@/lib/mock-data';
```

Add to `StoreState` interface (after existing declarations):
```typescript
  // Community posts
  communityPosts: CommunityPost[];
  createPost: (post: Omit<CommunityPost, 'id' | 'participants' | 'reactions' | 'timestamp'>) => void;
  joinChallenge: (postId: string) => void;
  addPostReaction: (postId: string, emoji: string) => void;

  // Task history (for analytics + dashboard)
  taskHistory: TaskHistoryEntry[];

  // Integration subjects
  integrationSubjects: typeof mockIntegrationSubjects;
```

Add implementations inside `create<StoreState>((set, get) => ({`:
```typescript
  // Community posts
  communityPosts: mockCommunityPosts,
  createPost: (post) => set(s => ({
    communityPosts: [
      {
        ...post,
        id: `p${Date.now()}`,
        participants: [s.user.id || 'me'],
        reactions: [],
        timestamp: 'Az önce',
      },
      ...s.communityPosts,
    ],
  })),
  joinChallenge: (postId) => set(s => ({
    communityPosts: s.communityPosts.map(p =>
      p.id === postId && !p.participants.includes('me')
        ? { ...p, participants: [...p.participants, 'me'] }
        : p
    ),
  })),
  addPostReaction: (postId, emoji) => set(s => ({
    communityPosts: s.communityPosts.map(p => {
      if (p.id !== postId) return p;
      const existing = p.reactions.find(r => r.emoji === emoji);
      if (existing) {
        return {
          ...p,
          reactions: p.reactions.map(r =>
            r.emoji === emoji
              ? { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted }
              : r
          ),
        };
      }
      return { ...p, reactions: [...p.reactions, { emoji, count: 1, reacted: true }] };
    }),
  })),

  // Task history
  taskHistory: mockTaskHistory,

  // Integration subjects
  integrationSubjects: mockIntegrationSubjects,
```

- [ ] **Step 1.4:** Make the above store additions
- [ ] **Step 1.5:** Run `npm run build` — verify clean compile. Fix any TypeScript errors.
- [ ] **Step 1.6:** Commit: `git commit -m "feat: add community posts, task history, integration subjects to store"`

---

## Task 2: Avatar Visual Fix

**Files:**
- Modify: `src/lib/avatar-layers.ts` (BASE_BODY_LAYER, BASE_HEAD_LAYER only)
- Modify: `src/components/PixelAvatar.tsx`
- Modify: `src/components/screens/AvatarScreen.tsx`

The current avatar looks bad because: face region (y=2..8) is too small for visible features, body (x=4..11) is narrow, arms at x=1 and x=12 are only 3px wide and don't look attached to torso, and there's no background so the character is invisible on dark UI.

### Step 2.1 — Redesign base character layers

Replace `BASE_BODY_LAYER` and `BASE_HEAD_LAYER` in `src/lib/avatar-layers.ts`:

```typescript
export const BASE_BODY_LAYER: AnimatedLayerDef = {
  id: 'base-body',
  slot: 'body',
  pixels: [
    // neck
    { x: 6, y: 9, w: 4, h: 1, color: '#E8B48A' },
    // torso (wider, more natural)
    { x: 3, y: 10, w: 10, h: 11, color: '#E8B48A' },
    // left arm (attached to torso)
    { x: 1, y: 10, w: 3, h: 10, color: '#E8B48A' },
    // right arm (attached to torso)
    { x: 12, y: 10, w: 3, h: 10, color: '#E8B48A' },
    // hip connector
    { x: 3, y: 21, w: 10, h: 1, color: '#D4956A' },
    // left leg
    { x: 3, y: 22, w: 4, h: 9, color: '#E8B48A' },
    // right leg
    { x: 9, y: 22, w: 4, h: 9, color: '#E8B48A' },
    // feet
    { x: 2, y: 30, w: 5, h: 2, color: '#D4956A' },
    { x: 9, y: 30, w: 5, h: 2, color: '#D4956A' },
  ],
};

export const BASE_HEAD_LAYER: AnimatedLayerDef = {
  id: 'base-head',
  slot: 'head',
  pixels: [
    // head shape (wider, more round)
    { x: 3, y: 1, w: 10, h: 8, color: '#F5C89A' },
    // forehead shading
    { x: 4, y: 1, w: 8, h: 1, color: '#E8B48A' },
    // left eye white
    { x: 4, y: 3, w: 3, h: 3, color: '#FFFFFF' },
    // right eye white
    { x: 9, y: 3, w: 3, h: 3, color: '#FFFFFF' },
    // left pupil
    { x: 5, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // right pupil
    { x: 10, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // left eye shine
    { x: 5, y: 4, w: 1, h: 1, color: '#4A90E2' },
    // right eye shine
    { x: 10, y: 4, w: 1, h: 1, color: '#4A90E2' },
    // nose
    { x: 7, y: 6, w: 2, h: 1, color: '#D4956A' },
    // mouth
    { x: 5, y: 7, w: 6, h: 1, color: '#C07050' },
    // mouth corners (smile)
    { x: 5, y: 7, w: 1, h: 1, color: '#A06040' },
    { x: 10, y: 7, w: 1, h: 1, color: '#A06040' },
    // chin
    { x: 4, y: 8, w: 8, h: 1, color: '#E8B48A' },
    // ear left
    { x: 2, y: 3, w: 2, h: 4, color: '#E8B48A' },
    // ear right
    { x: 12, y: 3, w: 2, h: 4, color: '#E8B48A' },
  ],
};
```

- [ ] **Step 2.1:** Replace the two base layer constants in `src/lib/avatar-layers.ts`

### Step 2.2 — Add background and outline to PixelAvatar

In `src/components/PixelAvatar.tsx`, update the `<svg>` element to include a subtle character outline and dark background:

```tsx
return (
  <svg
    viewBox="0 0 16 32"
    width={pxSize}
    height={pxSize * 2}
    style={{ imageRendering: 'pixelated', display: 'block' }}
    aria-hidden="true"
  >
    {/* Dark background for visibility on any bg */}
    <rect x="0" y="0" width="16" height="32" fill="transparent" />
    {/* Character shadow */}
    <ellipse cx="8" cy="31.5" rx="5" ry="0.8" fill="rgba(0,0,0,0.3)" />
    {layers.map(layer => {
      const pixels = selectPixels(layer, direction, isWalking, frameIndex);
      return (
        <g key={layer.id}>
          {pixels.map((rect, i) => (
            <rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.w}
              height={rect.h}
              fill={rect.color}
            />
          ))}
        </g>
      );
    })}
  </svg>
);
```

- [ ] **Step 2.2:** Update PixelAvatar.tsx render return

### Step 2.3 — Improve AvatarScreen preview

In `src/components/screens/AvatarScreen.tsx`, find where `<PixelAvatar>` is rendered in the preview section. Wrap it in a better-contrasted container:

Find the preview container (search for `PixelAvatar` usage) and update the surrounding `div` style to:
```tsx
style={{
  background: 'linear-gradient(180deg, #0D1117 0%, #1A1040 50%, #0D1117 100%)',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
  border: '1px solid rgba(123,92,245,.3)',
  minHeight: 200,
  position: 'relative',
}}
```

And increase the PixelAvatar `size` prop to show it larger — change `size="preview"` to keep as-is but add explicit width/height via wrapper if needed.

- [ ] **Step 2.3:** Update AvatarScreen preview container styling
- [ ] **Step 2.4:** Run `npm run build` — verify clean
- [ ] **Step 2.5:** Commit: `git commit -m "fix: redesign pixel avatar base character for better proportions"`

---

## Task 3: Community Screen Rewrite — Facebook-style Feed

**Files:**
- Rewrite: `src/components/screens/CommunityScreen.tsx`

The current CommunityScreen has 3 panels. Keep the left sidebar and right member list. Replace the center chat area with a post feed.

### Step 3.1 — Rewrite CommunityScreen.tsx

```tsx
'use client';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { useState } from 'react';
import { SectionLabel } from '@/components/atoms/SectionLabel';
import { SUBJECTS } from '@/lib/constants';

const REACTION_EMOJIS = ['🔥', '💪', '❤️', '🎉', '😤', '👑'];

function PostCard({ post, onJoin, onReact }: {
  post: import('@/lib/mock-data').CommunityPost;
  onJoin: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}) {
  const isChallenge = post.type === 'challenge';
  const alreadyJoined = post.participants.includes('me');
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
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
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
          <span style={{ fontSize: 16 }}>{SUBJECTS.find(s => s.name === post.subject)?.emoji || '📚'}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: post.subjectColor || 'var(--text)' }}>
              {post.subject}
            </div>
            <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
              {post.durationMin} dk · {post.participants.length} katılımcı
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

      {/* Reactions + action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', position: 'relative' }}>
        {post.reactions.map(r => (
          <button
            key={r.emoji}
            onClick={() => onReact(post.id, r.emoji)}
            style={{
              background: r.reacted ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.05)',
              border: `1px solid ${r.reacted ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
              borderRadius: 12, padding: '2px 8px', cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 9, color: r.reacted ? '#A78BFA' : 'var(--dim)',
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
  onSubmit: (data: { type: 'post' | 'challenge'; content: string; subject?: string; subjectColor?: string; durationMin?: number }) => void;
}) {
  const [type, setType] = useState<'post' | 'challenge'>('post');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [duration, setDuration] = useState(60);

  return (
    <div style={{
      background: 'rgba(255,255,255,.04)', border: '1px solid rgba(123,92,245,.3)',
      borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* Type toggle */}
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
          fontFamily: 'Rajdhani', fontSize: 13, resize: 'none',
          outline: 'none',
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
          onClick={() => {
            if (!content.trim()) return;
            const subj = SUBJECTS.find(s => s.name === subject);
            onSubmit({
              type, content,
              ...(type === 'challenge' ? { subject, subjectColor: subj?.color, durationMin: duration } : {}),
            });
            onClose();
          }}
          style={{
            background: 'rgba(123,92,245,.8)', border: '1px solid rgba(123,92,245,1)',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
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
    voiceRooms, joinRoom, leaveRoom, joinedRooms, openLobby,
    activeChannel, setActiveChannel,
  } = useStore(useShallow(s => ({
    communityPosts: s.communityPosts,
    createPost: s.createPost,
    joinChallenge: s.joinChallenge,
    addPostReaction: s.addPostReaction,
    voiceRooms: s.voiceRooms,
    joinRoom: s.joinRoom,
    leaveRoom: s.leaveRoom,
    joinedRooms: s.joinedRooms,
    openLobby: s.openLobby,
    activeChannel: s.activeChannel,
    setActiveChannel: s.setActiveChannel,
  })));

  const [showCreate, setShowCreate] = useState(false);

  const mockMembers = [
    { id: 'u2', name: 'NightWolf', emoji: '🐺', status: 'studying', statusLabel: 'Matematik çalışıyor', color: '#10B981' },
    { id: 'u4', name: 'CyberSage', emoji: '🧠', status: 'studying', statusLabel: 'Fizik çalışıyor', color: '#10B981' },
    { id: 'u5', name: 'TechNinja', emoji: '🥷', status: 'studying', statusLabel: 'Kimya çalışıyor', color: '#10B981' },
    { id: 'u6', name: 'MoonChild', emoji: '🌙', status: 'online', statusLabel: 'Çevrimiçi', color: '#22D3EE' },
    { id: 'u7', name: 'StarGazer', emoji: '⭐', status: 'break', statusLabel: 'Mola', color: '#F59E0B' },
    { id: 'u8', name: 'IronMind', emoji: '🏆', status: 'dnd', statusLabel: 'Rahatsız etme', color: '#EF4444' },
  ];

  const channels = [
    { id: 'genel', name: 'genel-sohbet', badge: 5 },
    { id: 'mat', name: 'yks-matematik' },
    { id: 'fiz', name: 'yks-fizik' },
    { id: 'kim', name: 'yks-kimya' },
    { id: 'mot', name: 'motivasyon' },
    { id: 'bas', name: 'basari-paylasim' },
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 700;

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 120px)', minHeight: 500, overflow: 'hidden' }}>

      {/* LEFT SIDEBAR */}
      {!isMobile && (
        <div style={{
          width: 200, flexShrink: 0, overflowY: 'auto',
          borderRight: '1px solid rgba(255,255,255,.07)',
          paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 16,
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
                      <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>{room.count}/{room.max}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { joined ? leaveRoom(room.id) : joinRoom(room.id); }}
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
                  {ch.badge && (
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
      )}

      {/* CENTER — POST FEED */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Create post button */}
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
              userId: 'me', userName: 'Shadow Fox', userEmoji: '🦊', userColor: '#7B5CF5',
              ...data,
            })}
          />
        )}

        {/* Posts */}
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
      {!isMobile && (
        <div style={{
          width: 160, flexShrink: 0, overflowY: 'auto',
          borderLeft: '1px solid rgba(255,255,255,.07)',
          paddingLeft: 8,
        }}>
          <SectionLabel>ÇEVRİMİÇİ — {mockMembers.filter(m => m.status !== 'offline').length}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
      )}
    </div>
  );
}
```

- [ ] **Step 3.1:** Replace the entire content of `src/components/screens/CommunityScreen.tsx` with the code above
- [ ] **Step 3.2:** Run `npm run build` — fix any TypeScript errors (likely missing imports or type mismatches)
- [ ] **Step 3.3:** Commit: `git commit -m "feat: rewrite community as Facebook-style post feed with challenge system"`

---

## Task 4: Dashboard — Daily Quote + Task Completion %

**Files:**
- Modify: `src/components/screens/DashboardScreen.tsx`

### Step 4.1 — Add daily quote card at top of dashboard

At the top of `DashboardScreen`, before the first card, add:

```tsx
import { DAILY_QUOTES } from '@/lib/constants';

// Inside DashboardScreen function, before return:
const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
const quote = DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
```

Add as first card in the return JSX:
```tsx
{/* Daily Quote */}
<div className="card" style={{
  borderLeft: `3px solid ${quote.color}`,
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  background: 'rgba(255,255,255,.03)',
}}>
  <div style={{
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    background: quote.color + '33',
    border: `2px solid ${quote.color}66`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700, color: quote.color,
  }}>
    {quote.initials}
  </div>
  <div>
    <div style={{ fontFamily: 'Rajdhani', fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontStyle: 'italic' }}>
      "{quote.text}"
    </div>
    <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginTop: 4 }}>
      — {quote.author}
    </div>
  </div>
</div>
```

- [ ] **Step 4.1:** Add DAILY_QUOTES import and daily quote card

### Step 4.2 — Add task completion % card

Add `taskHistory` to the `useStore` selector in DashboardScreen:
```tsx
taskHistory: s.taskHistory,
```

After the existing task list section, add:
```tsx
import { mockTaskHistory } from '@/lib/mock-data';

// In component, using taskHistory from store:
const last7 = taskHistory.slice(-7);
const avgPct = last7.length
  ? Math.round(last7.reduce((acc, d) => acc + (d.total > 0 ? d.done / d.total : 0), 0) / last7.length * 100)
  : 0;
const todayEntry = taskHistory[taskHistory.length - 1];
const todayPct = todayEntry && todayEntry.total > 0
  ? Math.round(todayEntry.done / todayEntry.total * 100)
  : Math.round((doneTasks / Math.max(totalTasks, 1)) * 100);
```

Add card after task list:
```tsx
{/* Task Completion Tracker */}
<div className="card" style={{ padding: '12px 14px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', letterSpacing: 1 }}>
      GÜNLÜK GÖREV TAKIBI
    </span>
    <span style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#10B981' }}>
      Ort: %{avgPct}
    </span>
  </div>
  {/* Today progress */}
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--text)' }}>
        Bugün: {doneTasks}/{totalTasks} görev
      </span>
      <span style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 700, color: '#22D3EE' }}>
        %{todayPct}
      </span>
    </div>
    <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${todayPct}%`, background: 'linear-gradient(90deg, #7B5CF5, #22D3EE)', borderRadius: 2, transition: 'width .3s' }} />
    </div>
  </div>
  {/* 7-day mini bar chart */}
  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 28 }}>
    {last7.map((entry, i) => {
      const pct = entry.total > 0 ? entry.done / entry.total : 0;
      const isToday = i === last7.length - 1;
      const date = new Date(entry.date);
      const dayLabel = ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'][date.getDay()];
      return (
        <div key={entry.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{
            width: '100%', height: Math.max(2, pct * 20),
            background: isToday ? '#22D3EE' : pct >= 0.8 ? '#10B981' : pct >= 0.5 ? '#7B5CF5' : 'rgba(255,255,255,.2)',
            borderRadius: 2,
          }} />
          <span style={{ fontFamily: 'Space Mono', fontSize: 6, color: isToday ? '#22D3EE' : 'var(--muted)' }}>
            {dayLabel}
          </span>
        </div>
      );
    })}
  </div>
</div>
```

- [ ] **Step 4.2:** Add taskHistory to useStore selector and add the task completion card
- [ ] **Step 4.3:** Run `npm run build` — fix TypeScript errors
- [ ] **Step 4.4:** Commit: `git commit -m "feat: add daily quote and task completion tracker to dashboard"`

---

## Task 5: Analytics — Daily Task Chart

**Files:**
- Modify: `src/components/screens/AnalyticsScreen.tsx`

### Step 5.1 — Add taskHistory to AnalyticsScreen

Add `taskHistory` to the useStore call:
```tsx
const { user, taskHistory } = useStore(s => ({ user: s.user, taskHistory: s.taskHistory }));
```

Since this returns an object, wrap with `useShallow` and add import.

### Step 5.2 — Add daily task chart section

After the heatmap section and before DERS DAĞILIMI, insert:

```tsx
{/* Daily Task Completion Chart */}
<div>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <SectionLabel>GÜNLÜK GÖREV TAMAMLAMA</SectionLabel>
    <span style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Son 30 gün</span>
  </div>
  <div className="card" style={{ padding: '12px 14px' }}>
    {/* Summary row */}
    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
      {(() => {
        const total30 = taskHistory.reduce((a, d) => a + d.total, 0);
        const done30 = taskHistory.reduce((a, d) => a + d.done, 0);
        const avgPct = total30 > 0 ? Math.round(done30 / total30 * 100) : 0;
        const perfectDays = taskHistory.filter(d => d.total > 0 && d.done === d.total).length;
        return (
          <>
            <div style={{ flex: 1, background: 'rgba(16,185,129,.08)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>TAMAMLANAN</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: '#10B981' }}>{done30}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>görev</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(123,92,245,.08)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>ORTALAMA</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: '#7B5CF5' }}>%{avgPct}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>tamamlama</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(34,211,238,.08)', borderRadius: 6, padding: '8px 10px' }}>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>MÜKEMMEL</div>
              <div style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 700, color: '#22D3EE' }}>{perfectDays}</div>
              <div style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>gün</div>
            </div>
          </>
        );
      })()}
    </div>

    {/* Bar chart */}
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 60 }}>
      {taskHistory.map((entry, i) => {
        const donePct = entry.total > 0 ? entry.done / entry.total : 0;
        const incompletePct = 1 - donePct;
        const maxH = 52;
        const isToday = i === taskHistory.length - 1;
        return (
          <div
            key={entry.date}
            title={`${entry.date}: ${entry.done}/${entry.total} tamamlandı (%${Math.round(donePct * 100)})`}
            style={{
              flex: 1, height: maxH, display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', cursor: 'help',
              border: isToday ? '1px solid rgba(34,211,238,.5)' : 'none',
              borderRadius: 2,
            }}
          >
            {/* incomplete portion */}
            {incompletePct > 0 && (
              <div style={{
                width: '100%', height: `${incompletePct * maxH}px`,
                background: 'rgba(239,68,68,.3)', borderRadius: '2px 2px 0 0',
              }} />
            )}
            {/* done portion */}
            {donePct > 0 && (
              <div style={{
                width: '100%', height: `${donePct * maxH}px`,
                background: isToday
                  ? 'linear-gradient(180deg, #22D3EE, #0E7490)'
                  : donePct >= 0.8 ? '#10B981' : '#7B5CF5',
                borderRadius: incompletePct > 0 ? '0' : '2px 2px 0 0',
              }} />
            )}
          </div>
        );
      })}
    </div>

    {/* X axis labels */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
      <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>30g önce</span>
      <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: '#22D3EE' }}>Bugün</span>
    </div>

    {/* Legend */}
    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10B981' }} />
        <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>Tamamlanan</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(239,68,68,.4)' }} />
        <span style={{ fontFamily: 'Space Mono', fontSize: 7, color: 'var(--muted)' }}>Tamamlanmayan</span>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 5.1:** Add `useShallow` import and update `useStore` call in AnalyticsScreen to include `taskHistory`
- [ ] **Step 5.2:** Add the daily task chart section after the heatmap
- [ ] **Step 5.3:** Run `npm run build` — fix any errors
- [ ] **Step 5.4:** Commit: `git commit -m "feat: add daily task completion chart to analytics"`

---

## Task 6: Integration Subjects → Plan + Timer

**Files:**
- Modify: `src/components/screens/PlanScreen.tsx`
- Modify: `src/components/screens/TimerScreen.tsx`

### Step 6.1 — Expose allSubjects from store (computed)

In `src/store/index.ts`, add a getter helper. Since Zustand doesn't have computed values natively, expose a derived getter:

Add to `StoreState` interface:
```typescript
getAllSubjects: () => typeof SUBJECTS;
```

Add implementation:
```typescript
getAllSubjects: () => {
  const s = get();
  return [...SUBJECTS, ...s.integrationSubjects.map(is => ({
    id: is.id, name: is.name, emoji: is.emoji, color: is.color,
  }))];
},
```

### Step 6.2 — Update TimerScreen subject picker

In `src/components/screens/TimerScreen.tsx`:
1. Add `getAllSubjects` to the `useStore` selector
2. Find where `SUBJECTS` is used to render subject options in the picker
3. Replace with `getAllSubjects()` call

### Step 6.3 — Update PlanScreen

In `src/components/screens/PlanScreen.tsx`:
1. Add `getAllSubjects` to the `useStore` selector
2. Find where subjects/colors are referenced for calendar events
3. Replace with `getAllSubjects()` lookup where applicable

- [ ] **Step 6.1:** Add `getAllSubjects` to store
- [ ] **Step 6.2:** Update TimerScreen subject picker
- [ ] **Step 6.3:** Update PlanScreen subject references
- [ ] **Step 6.4:** Run `npm run build` — final clean build
- [ ] **Step 6.5:** Commit: `git commit -m "feat: propagate integration subjects to timer and plan screens"`

---

## Final Verification

- [ ] Run `npm run build` — zero errors
- [ ] Start dev server `npm run dev` and manually check:
  - [ ] Avatar preview in AvatarScreen looks proportional and visible
  - [ ] Community feed shows posts, challenge "KATIL" button opens lobby
  - [ ] Post creation form works (normal + challenge type)
  - [ ] Dashboard shows daily quote at top
  - [ ] Dashboard shows task completion % card with 7-day bars
  - [ ] Analytics shows daily task chart (30-day bars, green/red split)
  - [ ] Timer subject picker includes integration subjects
- [ ] Final commit: `git commit -m "feat: StudyQuest Phase 2 complete"`
