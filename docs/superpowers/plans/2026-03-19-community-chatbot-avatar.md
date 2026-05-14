# Community Redesign + AI Chatbot + Avatar Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign community as Instagram/Clubhouse-style feed with study rooms, add conversational AI plan chatbot to Plan screen, and fix avatar evolution tree click + equipped item display.

**Architecture:** Three independent feature groups sharing a common store foundation. Store changes (Task 1) must land first; all other tasks are parallelizable after that. Community is split into focused sub-components under `src/components/community/`. Avatar fixes are surgical edits to two existing files. AI chatbot is a new self-contained modal component.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand 5, inline styles (no Tailwind classes for new components — follow existing pattern). Test command: `npm run build` (TypeScript + Next.js compile).

**Spec:** `docs/superpowers/specs/2026-03-19-community-chatbot-avatar-design.md`

---

## File Map

### New files
```
src/components/community/
  RoomSearch.tsx          — room discovery bar + room cards + create button
  CreateRoomModal.tsx     — create room form modal
  MyRoomCard.tsx          — sticky card shown when user is in a room
  BattleCard.tsx          — live battle VS card in feed
  ChannelCard.tsx         — verified channel post wrapper + TournamentCard inside
  PostCard.tsx            — normal post card (replaces old one in CommunityScreen)
src/components/AIPlanModal.tsx  — full-screen chat modal for AI plan generation
```

### Modified files
```
src/lib/mock-data.ts         — add Room/RoomMember/RoomMessage types, mockRooms,
                               update CommunityPost type + mockCommunityPosts,
                               add isVerified to mockUser, add blue-tick market item
src/store/index.ts           — remove deprecated chat/voice fields, add room actions,
                               add isVerified, buyItem blue-tick hook
src/components/screens/CommunityScreen.tsx  — full rewrite using new sub-components
src/components/screens/AvatarScreen.tsx     — evolution tree onClick + info panel
src/components/screens/PlanScreen.tsx       — remove old AI modal, wire AIPlanModal
src/components/screens/MarketScreen.tsx     — add 'ozellik' category
src/lib/avatar-layers.ts                    — verify all item IDs covered (may be no-op)
```

---

## Task 1: Store Foundation — Types, Deprecations, Room Actions

**Files:**
- Modify: `src/lib/mock-data.ts`
- Modify: `src/store/index.ts`

### Step 1.1 — Add Room types to mock-data.ts

In `src/lib/mock-data.ts`, after the existing exports and before `mockEvolutionTree`, add:

```typescript
// ─── Room System ─────────────────────────────────────────────────────────────

export interface RoomMember {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface RoomMessage {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  content: string;
  timestamp: string;
}

export interface Room {
  id: string;
  name: string;
  subject: string;
  subjectColor: string;
  emoji: string;
  ownerId: string;
  ownerName: string;
  capacity: number;
  members: RoomMember[];
  permissions: { canWrite: boolean; canCompete: boolean };
  isOpen: boolean;
  messages: RoomMessage[];
}

export const mockRooms: Room[] = [
  {
    id: 'room-1', name: 'Türev Kafası', subject: 'Matematik', subjectColor: '#7B5CF5',
    emoji: '📐', ownerId: 'f1', ownerName: 'NightWolf', capacity: 10, isOpen: true,
    permissions: { canWrite: true, canCompete: true },
    members: [
      { id: 'f1', name: 'NightWolf', emoji: '🐺', color: '#22D3EE' },
      { id: 'f3', name: 'IronMind', emoji: '🧠', color: '#A78BFA' },
      { id: 'u3', name: 'CyberSage', emoji: '🧙', color: '#10B981' },
    ],
    messages: [
      { id: 'rm1', userId: 'f1', userName: 'NightWolf', userEmoji: '🐺', content: 'türev zincir kuralına baktım, şu soru bende var', timestamp: '10:41' },
      { id: 'rm2', userId: 'u3', userName: 'CyberSage', userEmoji: '🧙', content: 'hangi konu?', timestamp: '10:42' },
    ],
  },
  {
    id: 'room-2', name: 'Fizik Sprint', subject: 'Fizik', subjectColor: '#22D3EE',
    emoji: '⚡', ownerId: 'f3', ownerName: 'IronMind', capacity: 10, isOpen: true,
    permissions: { canWrite: false, canCompete: false },
    members: Array.from({ length: 10 }, (_, i) => ({ id: `rm${i}`, name: `Üye ${i+1}`, emoji: '👤', color: '#64748B' })),
    messages: [],
  },
  {
    id: 'room-3', name: 'Kimya Odası', subject: 'Kimya', subjectColor: '#F59E0B',
    emoji: '⚗️', ownerId: 'u4', ownerName: 'StarGazer', capacity: 8, isOpen: true,
    permissions: { canWrite: true, canCompete: false },
    members: [{ id: 'u4', name: 'StarGazer', emoji: '⭐', color: '#F59E0B' }],
    messages: [],
  },
];
```

- [ ] Add the Room types and `mockRooms` to `src/lib/mock-data.ts`
- [ ] Run `npm run build` — expect success

### Step 1.2 — Update CommunityPost type and mockCommunityPosts

Replace the existing `CommunityPost` interface (lines ~289-303) with:

```typescript
export type PostType = 'post' | 'challenge' | 'battle' | 'channel_post' | 'tournament';

export interface CommunityPost {
  id: string;
  type: PostType;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  timestamp: string;
  content: string;
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  // challenge
  subject?: string;
  subjectColor?: string;
  durationMin?: number;
  participants?: string[];
  // verified channel
  isVerifiedChannel?: boolean;
  channelName?: string;
  followerCount?: number;
  channelEmoji?: string;
  channelBorderColor?: string;
  // battle
  player1?: { id: string; name: string; emoji: string; color: string; score: number };
  player2?: { id: string; name: string; emoji: string; color: string; score: number };
  battleSubject?: string;
  battleDurationMin?: number;
  timeRemainingSeconds?: number;
  // tournament (inside channel posts)
  tournamentName?: string;
  tournamentPrize?: string;
  tournamentCapacity?: number;
  tournamentParticipants?: number;
  tournamentStartTime?: string;
}
```

Then extend `mockCommunityPosts` — keep existing posts (p1–p5) and add at the start:

```typescript
export const mockCommunityPosts: CommunityPost[] = [
  // Verified channel — Gri Koç with tournament
  {
    id: 'ch1', type: 'channel_post',
    userId: 'grikos', userName: 'Gri Koç', userEmoji: '🦁', userColor: '#FFD700',
    isVerifiedChannel: true, channelName: 'Gri Koç', followerCount: 847000,
    channelEmoji: '🦁', channelBorderColor: '#FFD700',
    content: '🏆 HAFTALIK MATEMATİK ŞAMPİYONASI başlıyor! 100 kişilik gruplar, eleme → final. Ödül: Nadir rozet + 50 sa coin.',
    timestamp: '10 dk önce', reactions: [],
    tournamentName: 'Haftalık Matematik Şampiyonası', tournamentPrize: 'Nadir Rozet + 50sa',
    tournamentCapacity: 1000, tournamentParticipants: 847, tournamentStartTime: 'Pazar 20:00',
  },
  // Live battle card
  {
    id: 'b1', type: 'battle',
    userId: 'f1', userName: 'NightWolf', userEmoji: '🐺', userColor: '#A78BFA',
    content: '',
    timestamp: 'Şimdi', reactions: [],
    player1: { id: 'f1', name: 'NightWolf', emoji: '🐺', color: '#A78BFA', score: 75 },
    player2: { id: 'f3', name: 'IronMind', emoji: '🧠', color: '#22D3EE', score: 82 },
    battleSubject: 'Türev', battleDurationMin: 30, timeRemainingSeconds: 763,
  },
  // Verified channel — Nit Dershanesi
  {
    id: 'ch2', type: 'channel_post',
    userId: 'nit', userName: 'Nit Dershanesi', userEmoji: '🏫', userColor: '#22D3EE',
    isVerifiedChannel: true, channelName: 'Nit Dershanesi', followerCount: 234000,
    channelEmoji: '🏫', channelBorderColor: '#22D3EE',
    content: 'Bu hafta sonu 100 kişilik YKS Matematik grubumuz için özel soru seti hazır. Kendi sınıfınızla yarışın!',
    timestamp: '1 sa önce', reactions: [],
    tournamentName: 'YKS Matematik Grubu', tournamentPrize: 'Sertifika + 20sa',
    tournamentCapacity: 100, tournamentParticipants: 67, tournamentStartTime: 'Cumartesi 14:00',
  },
  // ...existing posts p1-p5 unchanged, just add participants field to type-check
```

> **Note:** Keep existing posts p1–p5. Just ensure `participants: string[]` is present on challenge-type posts (they already have it). Normal posts need `participants: []` if not present.

- [ ] Replace `CommunityPost` interface in `src/lib/mock-data.ts`
- [ ] Add ch1, b1, ch2 posts to the START of `mockCommunityPosts`
- [ ] Fix `participants` field on existing posts (add `participants: []` where missing)
- [ ] Run `npm run build` — fix any type errors

### Step 1.3 — Add isVerified to mockUser

In `mockUser`, add after `friends: 12`:
```typescript
isVerified: false,
```

- [ ] Add `isVerified: false` to `mockUser`
- [ ] Run `npm run build`

### Step 1.4 — Add blue-tick item to mockMarketItems

After the last item in `mockMarketItems`, add:
```typescript
{ id: 'item-feature-blue-tick', name: 'Mavi Tik ✓', category: 'ozellik',
  emoji: '✓', rarity: 'legendary', price: 500, owned: false, equipped: false },
```

- [ ] Add blue-tick item to `mockMarketItems`
- [ ] Run `npm run build`

### Step 1.5 — Update store: remove deprecated fields, add rooms

In `src/store/index.ts`:

**Remove from `StoreState` interface:**
- `messages`, `activeChannel`, `joinedRooms`, `voiceRooms`
- `sendMessage`, `addReaction`, `setActiveChannel`, `joinRoom`, `leaveRoom`
- `activeLobbyRoom`, `openLobby`, `closeLobby`

**Add to `StoreState` interface** (under `// Chat` → replace with `// Rooms`):
```typescript
// Rooms
rooms: Room[];
myRoom: Room | null;
createRoom: (data: Omit<Room, 'id' | 'members' | 'messages'>) => void;
joinRoomById: (roomId: string) => void;
leaveCurrentRoom: () => void;
sendRoomMessage: (text: string) => void;
```

**Add `isVerified` to user section** (inferred from mockUser, no explicit declaration needed since `user: typeof mockUser`).

**Add `addFullTask` to `StoreState` interface:**
```typescript
addFullTask: (task: Task) => void;
```

**Add `addFullTask` implementation:**
```typescript
addFullTask: (task) => set(s => ({ tasks: [...s.tasks, task] })),
```

**Remove from store implementation:** all implementations of the deprecated fields above.

**Add to store implementation:**
```typescript
// Rooms
rooms: [...mockRooms],
myRoom: null,
createRoom: (data) => {
  const newRoom: Room = {
    ...data,
    id: `room-${Date.now()}`,
    members: [{ id: 'u1', name: get().user.name, emoji: get().user.emoji, color: '#7B5CF5' }],
    messages: [],
  };
  set(s => ({ rooms: [newRoom, ...s.rooms], myRoom: newRoom }));
},
joinRoomById: (roomId) => {
  const current = get().myRoom;
  if (current?.id === roomId) return; // already in this room
  // Leave current room first
  if (current) {
    set(s => ({
      rooms: s.rooms.map(r => r.id === current.id ? { ...r, members: r.members.filter(m => m.id !== 'u1') } : r),
    }));
  }
  const room = get().rooms.find(r => r.id === roomId);
  if (!room) return;
  if (room.members.length >= room.capacity) {
    get().showToast('Oda dolu!', 'error', '🚫');
    set(() => ({ myRoom: null }));
    return;
  }
  const me: RoomMember = { id: 'u1', name: get().user.name, emoji: get().user.emoji, color: '#7B5CF5' };
  set(s => ({
    myRoom: { ...room, members: [...room.members, me] },
    rooms: s.rooms.map(r => r.id === roomId ? { ...r, members: [...r.members, me] } : r),
  }));
},
leaveCurrentRoom: () => {
  const room = get().myRoom;
  if (!room) return;
  set(s => ({
    myRoom: null,
    rooms: s.rooms.map(r => r.id === room.id ? { ...r, members: r.members.filter(m => m.id !== 'u1') } : r),
  }));
},
sendRoomMessage: (text) => {
  if (!text.trim() || !get().myRoom) return;
  const now = new Date();
  const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const msg: RoomMessage = { id: `rm${Date.now()}`, userId: 'u1', userName: get().user.name, userEmoji: get().user.emoji, content: text, timestamp: ts };
  const roomId = get().myRoom!.id;
  set(s => ({
    myRoom: s.myRoom ? { ...s.myRoom, messages: [...s.myRoom.messages, msg] } : null,
    rooms: s.rooms.map(r => r.id === roomId ? { ...r, messages: [...r.messages, msg] } : r),
  }));
},
```

**Add blue-tick hook to `buyItem`:** After the existing `showToast` call in `buyItem`, add:
```typescript
if (id === 'item-feature-blue-tick') {
  set(s => ({ user: { ...s.user, isVerified: true } }));
}
```

**Update import at top of store:** Add `Room, RoomMember, RoomMessage, mockRooms` to the import from `@/lib/mock-data`. Remove `mockChatMessages, mockVoiceRooms`.

- [ ] Remove deprecated store fields + implementations
- [ ] Add Room types import
- [ ] Add rooms state + actions
- [ ] Add buyItem blue-tick hook
- [ ] Run `npm run build` — fix all type errors (CommunityScreen will break temporarily — that's expected)

### Step 1.6 — Commit foundation

```bash
git add src/lib/mock-data.ts src/store/index.ts
git commit -m "feat: add room system types + store actions, update CommunityPost type, add isVerified"
```

- [ ] Commit

---

## Task 2: Market — Add 'ozellik' Category

**Files:**
- Modify: `src/components/screens/MarketScreen.tsx`
- Modify: `src/components/screens/AvatarScreen.tsx`

### Step 2.1 — MarketScreen category arrays

In `MarketScreen.tsx` lines 13-14, change:
```typescript
const CATEGORIES = [...existing..., '✓ Özellik'];
const CAT_KEYS   = [...existing..., 'ozellik'];
```

The `ItemPixelPreview` function: add an `else if (item.category === 'ozellik')` branch returning a simple `✓` text div (no SVG preview needed).

- [ ] Add `'✓ Özellik'` to `CATEGORIES` and `'ozellik'` to `CAT_KEYS`
- [ ] Add ozellik case in `ItemPixelPreview` (return a simple styled `<div>✓</div>`)
- [ ] Run `npm run build`

### Step 2.2 — AvatarScreen wardrobe category

In `AvatarScreen.tsx`, `ITEM_CATEGORIES` and `CAT_KEYS` arrays: append `'✓ Özellik'` and `'ozellik'`. The wardrobe filter will show the blue-tick item there.

- [ ] Update `ITEM_CATEGORIES` + `CAT_KEYS` in AvatarScreen
- [ ] Run `npm run build`

### Step 2.3 — Commit

```bash
git add src/components/screens/MarketScreen.tsx src/components/screens/AvatarScreen.tsx
git commit -m "feat: add 'ozellik' category for blue-tick item in market and wardrobe"
```

- [ ] Commit

---

## Task 3: Avatar — Evolution Tree onClick

**Files:**
- Modify: `src/components/screens/AvatarScreen.tsx`

### Step 3.1 — Add selectedEv state and shake animation

At the top of `AvatarScreen()` function, add:
```typescript
const [selectedEv, setSelectedEv] = useState<string | null>(null);
const [shakingEv, setShakingEv] = useState<string | null>(null);
```

Add a CSS keyframe via a `<style>` tag inside the return (at the very top of the JSX):
```tsx
<style>{`
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%,60%{transform:translateX(-4px)}
    40%,80%{transform:translateX(4px)}
  }
`}</style>
```

### Step 3.2 — Add onClick to evolution tree items

In the evolution tree map, change the inner `<div style={{ cursor: ev.unlocked ? 'pointer' : 'default', ... }}>` to:

```tsx
<div
  style={{
    // ... existing styles ...
    animation: shakingEv === ev.id ? 'shake 0.3s ease' : 'none',
  }}
  onClick={() => {
    if (ev.unlocked) {
      setSelectedEv(selectedEv === ev.id ? null : ev.id);
    } else {
      setShakingEv(ev.id);
      setTimeout(() => setShakingEv(null), 350);
    }
  }}
>
```

### Step 3.3 — Add info panel below progress bar

After the existing `{nextEvolution && (...)}` progress bar block, add:

```tsx
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
```

- [ ] Add state variables to AvatarScreen
- [ ] Add `<style>` shake keyframe
- [ ] Add onClick to evolution tree items
- [ ] Add info panel below progress bar
- [ ] Run `npm run build`

### Step 3.4 — Commit

```bash
git add src/components/screens/AvatarScreen.tsx
git commit -m "fix: add evolution tree click interaction with info panel and shake animation"
```

- [ ] Commit

---

## Task 4: Avatar — LAYER_MAP Verification

**Files:**
- Possibly modify: `src/lib/avatar-layers.ts`

### Step 4.1 — Audit

Run this check:
```bash
node -e "
const md = require('./src/lib/mock-data');
const al = require('./src/lib/avatar-layers');
const ids = md.mockMarketItems.map(i => i.id);
const missing = ids.filter(id => !al.AVATAR_LAYER_MAP[id]);
console.log('Missing:', missing);
"
```

If output is `Missing: []` — skip to commit. If items are missing, add fallback colored-rect entries to `AVATAR_LAYER_MAP` for each missing ID using the slot color table from the spec.

- [ ] Run audit command
- [ ] If missing items found: add fallback entries to avatar-layers.ts
- [ ] Run `npm run build`

### Step 4.2 — Commit

```bash
git add src/lib/avatar-layers.ts
git commit -m "fix: ensure all market items have AVATAR_LAYER_MAP entries"
```

- [ ] Commit (even if no-op, for record)

---

## Task 5: Community Sub-components — PostCard

**Files:**
- Create: `src/components/community/PostCard.tsx`

### Step 5.1 — Create PostCard.tsx

Extract and refactor the existing `PostCard` + `CreatePostForm` from `CommunityScreen.tsx` into a standalone file. The component handles types `'post'` and `'challenge'`.

```tsx
'use client';
import { useState } from 'react';
import type { CommunityPost } from '@/lib/mock-data';
import { SUBJECTS } from '@/lib/constants';

const REACTION_EMOJIS = ['🔥', '💪', '❤️', '🎉', '😤', '👑'];

export function PostCard({ post, onReact, onJoin }: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
  onJoin?: (id: string) => void;
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
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: post.userColor + '33', border: `2px solid ${post.userColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>{post.userEmoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: post.userColor }}>
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
```

- [ ] Create `src/components/community/PostCard.tsx` with the code above
- [ ] Run `npm run build`

---

## Task 6: Community Sub-components — BattleCard

**Files:**
- Create: `src/components/community/BattleCard.tsx`

### Step 6.1 — Create BattleCard.tsx

```tsx
'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import type { CommunityPost } from '@/lib/mock-data';

export function BattleCard({ post }: { post: CommunityPost }) {
  const setActiveTab = useStore(s => s.setActiveTab);
  const [showScore, setShowScore] = useState(false);
  const p1 = post.player1!;
  const p2 = post.player2!;
  const total = p1.score + p2.score || 1;
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
      {/* Expanded score detail (simple) */}
      {showScore && (
        <div style={{ marginTop: 8, background: '#0D1117', borderRadius: 8, padding: 8,
          fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)', textAlign: 'center' }}>
          {p1.name}: {p1.score} · {p2.name}: {p2.score} — {post.battleSubject} kapışması devam ediyor
        </div>
      )}
    </div>
  );
}
```

- [ ] Create `src/components/community/BattleCard.tsx`
- [ ] Run `npm run build`

---

## Task 7: Community Sub-components — ChannelCard + TournamentCard

**Files:**
- Create: `src/components/community/ChannelCard.tsx`

### Step 7.1 — Create ChannelCard.tsx (includes TournamentCard inline)

```tsx
'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import type { CommunityPost } from '@/lib/mock-data';

function TournamentCard({ post }: { post: CommunityPost }) {
  const { showToast, tournaments } = useStore(s => ({ showToast: s.showToast, tournaments: s.tournaments }));
  const pct = Math.round(((post.tournamentParticipants ?? 0) / (post.tournamentCapacity ?? 1)) * 100);

  return (
    <div style={{ background: '#0D1117', border: `1px solid ${post.channelBorderColor}33`,
      borderRadius: 8, padding: '10px 12px', marginTop: 8 }}>
      <div style={{ fontFamily: 'Orbitron', fontSize: 10, fontWeight: 700,
        color: post.channelBorderColor, marginBottom: 4 }}>🏆 {post.tournamentName}</div>
      <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)', marginBottom: 6 }}>
        Ödül: {post.tournamentPrize} · Başlangıç: {post.tournamentStartTime}
      </div>
      {/* Progress bar */}
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

export function ChannelCard({ post, onReact }: {
  post: CommunityPost;
  onReact: (id: string, emoji: string) => void;
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
        <div style={{ width: 36, height: 36, background: borderColor + '33',
          border: `2px solid ${borderColor}`, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {post.channelEmoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13, color: borderColor }}>
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
```

- [ ] Create `src/components/community/ChannelCard.tsx`
- [ ] Run `npm run build`

---

## Task 8: Community Sub-components — RoomSearch + CreateRoomModal + MyRoomCard

**Files:**
- Create: `src/components/community/RoomSearch.tsx`
- Create: `src/components/community/CreateRoomModal.tsx`
- Create: `src/components/community/MyRoomCard.tsx`

### Step 8.1 — RoomSearch.tsx

```tsx
'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

export function RoomSearch({ onCreateClick }: { onCreateClick: () => void }) {
  const [query, setQuery] = useState('');
  const { rooms, myRoom, joinRoomById } = useStore(useShallow(s => ({
    rooms: s.rooms, myRoom: s.myRoom, joinRoomById: s.joinRoomById,
  })));

  const filtered = rooms.filter(r =>
    !query || r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.subject.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Oda ara... (Matematik, Fizik, YKS...)"
          style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontFamily: 'Rajdhani', fontSize: 12, outline: 'none' }}
        />
        <button onClick={onCreateClick} style={{
          background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
          padding: '8px 14px', borderRadius: 8,
          fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
        }}>+ Oda Kur</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
        {filtered.map(room => {
          const isFull = room.members.length >= room.capacity;
          const isMyRoom = myRoom?.id === room.id;
          return (
            <div key={room.id} style={{
              background: '#111827', border: `1px solid ${room.subjectColor}44`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, background: room.subjectColor + '33',
                  border: `2px solid ${room.subjectColor}`, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {room.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: room.subjectColor }}>{room.name}</div>
                  <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
                    {room.ownerName}&apos;ın odası · {room.isOpen ? 'Açık' : 'Davetli'}
                  </div>
                </div>
                <div style={{
                  background: isFull ? 'rgba(239,68,68,.15)' : 'rgba(16,185,129,.15)',
                  border: `1px solid ${isFull ? 'rgba(239,68,68,.4)' : 'rgba(16,185,129,.4)'}`,
                  color: isFull ? '#EF4444' : '#10B981',
                  padding: '2px 8px', borderRadius: 8, fontFamily: 'Space Mono', fontSize: 8,
                }}>{isFull ? 'Dolu ' : ''}{room.members.length}/{room.capacity}</div>
              </div>
              {/* Permission badges */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                {room.permissions.canWrite && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#94A3B8' }}>📝 Yazabilirsin</span>}
                {room.permissions.canCompete && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#94A3B8' }}>⚔️ Kapışabilirsin</span>}
                {!room.permissions.canWrite && !room.permissions.canCompete && <span style={{ background: '#1E293B', padding: '2px 8px', borderRadius: 8, fontSize: 8, color: '#EF4444' }}>🔒 Sadece izle</span>}
              </div>
              <button
                disabled={isFull || isMyRoom}
                onClick={() => joinRoomById(room.id)}
                style={{
                  width: '100%', padding: '5px 0', borderRadius: 6,
                  cursor: isFull || isMyRoom ? 'default' : 'pointer',
                  fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700,
                  background: isMyRoom ? 'rgba(16,185,129,.15)' : isFull ? 'rgba(255,255,255,.05)' : 'rgba(123,92,245,.8)',
                  border: isMyRoom ? '1px solid rgba(16,185,129,.4)' : isFull ? '1px solid rgba(255,255,255,.1)' : '1px solid #7B5CF5',
                  color: isMyRoom ? '#10B981' : isFull ? '#64748B' : '#fff',
                }}>
                {isMyRoom ? '✓ Bu Odadasın' : isFull ? 'Dolu' : 'ODAYA GİR'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Step 8.2 — CreateRoomModal.tsx

```tsx
'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { SUBJECTS } from '@/lib/constants';

export function CreateRoomModal({ onClose }: { onClose: () => void }) {
  const createRoom = useStore(s => s.createRoom);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0].name);
  const [canWrite, setCanWrite] = useState(true);
  const [canCompete, setCanCompete] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const subj = SUBJECTS.find(s => s.name === subject) ?? SUBJECTS[0];

  const handleCreate = () => {
    if (!name.trim()) return;
    createRoom({
      name: name.trim(), subject, subjectColor: subj.color, emoji: subj.emoji,
      ownerId: 'u1', ownerName: 'Shadow Fox', capacity: 10, isOpen,
      permissions: { canWrite, canCompete },
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111827', border: '1px solid rgba(123,92,245,.4)', borderRadius: 14,
        padding: 20, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: '#A78BFA' }}>+ Yeni Oda Kur</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Oda adı..."
          style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
            fontFamily: 'Rajdhani', fontSize: 13, outline: 'none' }} />
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{
          background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
          borderRadius: 8, padding: '8px 12px', color: 'var(--text)',
          fontFamily: 'Space Mono', fontSize: 9 }}>
          {SUBJECTS.map(s => <option key={s.id} value={s.name}>{s.emoji} {s.name}</option>)}
        </select>
        <div style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>Üyeler ne yapabilir?</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '📝 Yazabilir', val: canWrite, set: setCanWrite },
            { label: '⚔️ Kapışabilir', val: canCompete, set: setCanCompete },
          ].map(({ label, val, set }) => (
            <button key={label} onClick={() => set(v => !v)} style={{
              flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 8,
              background: val ? 'rgba(123,92,245,.2)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${val ? 'rgba(123,92,245,.5)' : 'rgba(255,255,255,.1)'}`,
              color: val ? '#A78BFA' : 'var(--dim)',
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ label: 'Açık Oda', val: true }, { label: 'Davetli', val: false }].map(opt => (
            <button key={opt.label} onClick={() => setIsOpen(opt.val)} style={{
              flex: 1, padding: '6px 0', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 8,
              background: isOpen === opt.val ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${isOpen === opt.val ? 'rgba(16,185,129,.4)' : 'rgba(255,255,255,.1)'}`,
              color: isOpen === opt.val ? '#10B981' : 'var(--dim)',
            }}>{opt.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 8, padding: 8, cursor: 'pointer', fontFamily: 'Space Mono', fontSize: 9, color: 'var(--dim)' }}>
            İptal
          </button>
          <button onClick={handleCreate} disabled={!name.trim()} style={{
            flex: 2, background: name.trim() ? 'rgba(123,92,245,.8)' : 'rgba(123,92,245,.3)',
            border: '1px solid #7B5CF5', borderRadius: 8, padding: 8, cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: '#fff' }}>
            ODA KUR
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 8.3 — MyRoomCard.tsx

```tsx
'use client';
import { useState } from 'react';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';

export function MyRoomCard() {
  const { myRoom, leaveCurrentRoom, sendRoomMessage, setActiveTab } = useStore(useShallow(s => ({
    myRoom: s.myRoom, leaveCurrentRoom: s.leaveCurrentRoom,
    sendRoomMessage: s.sendRoomMessage, setActiveTab: s.setActiveTab,
  })));
  const [chatOpen, setChatOpen] = useState(false);
  const [msg, setMsg] = useState('');

  if (!myRoom) return null;

  const displayMembers = myRoom.members.slice(0, 4);
  const overflow = myRoom.members.length - 4;
  const lastMsgs = myRoom.messages.slice(-3);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'linear-gradient(135deg,#1A1040,#0F1A2E)',
      border: '1px solid #7B5CF5', borderRadius: 12, padding: 12, marginBottom: 12,
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, background: myRoom.subjectColor + '33',
          border: `2px solid ${myRoom.subjectColor}`, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
          {myRoom.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 12, color: '#A78BFA' }}>{myRoom.name}</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
            {myRoom.ownerName}&apos;ın odası · <span style={{ color: '#10B981' }}>● Aktif</span>
          </div>
        </div>
        <button onClick={leaveCurrentRoom} style={{
          background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.4)',
          color: '#EF4444', padding: '4px 10px', borderRadius: 8,
          fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>ÇIKIŞ</button>
      </div>
      {/* Members + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
        {displayMembers.map(m => (
          <div key={m.id} style={{ width: 24, height: 24, background: m.color + '33',
            border: `1.5px solid ${m.color}`, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{m.emoji}</div>
        ))}
        {overflow > 0 && (
          <div style={{ width: 24, height: 24, background: '#1E293B', border: '1.5px solid #374151',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono', fontSize: 7, color: '#64748B' }}>+{overflow}</div>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {myRoom.permissions.canWrite && (
            <button onClick={() => setChatOpen(v => !v)} style={{
              background: chatOpen ? 'rgba(34,211,238,.3)' : 'rgba(34,211,238,.15)',
              border: '1px solid rgba(34,211,238,.4)', color: '#22D3EE',
              padding: '3px 8px', borderRadius: 6,
              fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>💬 Sohbet</button>
          )}
          {myRoom.permissions.canCompete && (
            <button onClick={() => setActiveTab('rando')} style={{
              background: 'rgba(123,92,245,.15)', border: '1px solid rgba(123,92,245,.4)',
              color: '#A78BFA', padding: '3px 8px', borderRadius: 6,
              fontFamily: 'Space Mono', fontSize: 8, cursor: 'pointer' }}>⚔️ Kapış</button>
          )}
        </div>
      </div>
      {/* Inline chat */}
      {chatOpen && (
        <div style={{ background: '#0D1117', borderRadius: 8, padding: 8,
          border: '1px solid rgba(255,255,255,.07)',
          maxHeight: '45vh', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lastMsgs.map(m => (
              <div key={m.id} style={{ fontFamily: 'Rajdhani', fontSize: 11, color: 'var(--dim)' }}>
                <span style={{ color: '#A78BFA' }}>{m.userEmoji} {m.userName}:</span> {m.content}
              </div>
            ))}
            {lastMsgs.length === 0 && (
              <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--dim)', textAlign: 'center' }}>
                Henüz mesaj yok. İlk sen yaz!
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input value={msg} onChange={e => setMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && msg.trim()) { sendRoomMessage(msg); setMsg(''); } }}
              placeholder="Bir şey yaz..."
              style={{ flex: 1, background: '#1E293B', border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 6, padding: '5px 8px', color: 'var(--text)',
                fontFamily: 'Rajdhani', fontSize: 11, outline: 'none' }} />
            <button onClick={() => { if (msg.trim()) { sendRoomMessage(msg); setMsg(''); } }} style={{
              background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
              fontFamily: 'Space Mono', fontSize: 9 }}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] Create `src/components/community/RoomSearch.tsx`
- [ ] Create `src/components/community/CreateRoomModal.tsx`
- [ ] Create `src/components/community/MyRoomCard.tsx`
- [ ] Run `npm run build`

### Step 8.4 — Commit sub-components

```bash
git add src/components/community/
git commit -m "feat: add community sub-components (RoomSearch, CreateRoomModal, MyRoomCard, BattleCard, ChannelCard, PostCard)"
```

- [ ] Commit

---

## Task 9: CommunityScreen — Full Rewrite

**Files:**
- Modify: `src/components/screens/CommunityScreen.tsx`

### Step 9.1 — Rewrite CommunityScreen.tsx

Replace the entire file content:

```tsx
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
  const SUBJECTS_IMPORT = ['Matematik','Fizik','Kimya','Biyoloji','Edebiyat','TYT'];
  const [subject, setSubject] = useState(SUBJECTS_IMPORT[0]);
  const [duration, setDuration] = useState(60);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit({ type, content,
      ...(type === 'challenge' ? { subject, durationMin: duration, participants: [] } : { participants: [] }),
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
            {SUBJECTS_IMPORT.map(s => <option key={s} value={s}>{s}</option>)}
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
              ...data, userId: 'me', userName: user.name,
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
```

- [ ] Replace `src/components/screens/CommunityScreen.tsx` with the code above
- [ ] Run `npm run build` — fix any remaining type errors
- [ ] Verify at `http://localhost:3000` that community tab shows the new layout

### Step 9.2 — Commit

```bash
git add src/components/screens/CommunityScreen.tsx
git commit -m "feat: rewrite CommunityScreen as Instagram/Clubhouse feed with study rooms"
```

- [ ] Commit

---

## Task 10: AIPlanModal Component

**Files:**
- Create: `src/components/AIPlanModal.tsx`

### Step 10.1 — Create AIPlanModal.tsx

```tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import type { Task } from '@/store';
import { SUBJECTS, XP_PER_MINUTE } from '@/lib/constants';

type ConvStep = 'subjects' | 'hours' | 'exam' | 'days' | 'done';

interface ChatMsg {
  role: 'bot' | 'user';
  text: string;
  chips?: string[];
  multiChips?: boolean;
  planPreview?: { day: string; subject: string; hours: number; emoji: string; color: string }[];
}

const SUBJECT_NAMES = SUBJECTS.map(s => s.name);
const HOURS_CHIPS = ['2 saat', '4 saat', '6 saat', '8 saat+'];
const DAYS_CHIPS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function generatePlan(
  subjects: string[],
  hoursPerDay: number,
  examDays: number,
  heavyDays: string[],
): ChatMsg['planPreview'] {
  const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const isHeavy = (d: string) => heavyDays.includes(d);
  const subj = subjects.length > 0 ? subjects : ['Matematik'];
  // Assign one subject per day in round-robin; heavy days get +2 hours
  // This gives each subject roughly equal days across the week
  return DAYS_TR.map((day, i) => {
    const dayHours = isHeavy(day) ? hoursPerDay + 2 : hoursPerDay;
    const s = subj[i % subj.length];
    const found = SUBJECTS.find(x => x.name === s) ?? SUBJECTS[0];
    return { day, subject: found.name, hours: dayHours, emoji: found.emoji, color: found.color };
  });
}

export function AIPlanModal({ onClose }: { onClose: () => void }) {
  const { user, addFullTask } = useStore(s => ({ user: s.user, addFullTask: s.addFullTask }));

  const [step, setStep] = useState<ConvStep>('subjects');
  const [msgs, setMsgs] = useState<ChatMsg[]>([{
    role: 'bot', text: 'Merhaba! 👋 Sana özel haftalık çalışma programı hazırlayacağım.\n\nHangi derslere çalışıyorsun?',
    chips: SUBJECT_NAMES, multiChips: true,
  }]);
  const [input, setInput] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{
    subjects: string[]; hours: number; examDays: number; heavyDays: string[];
  }>({ subjects: [], hours: 4, examDays: user.examDaysLeft ?? 90, heavyDays: ['Cmt', 'Paz'] });
  const [plan, setPlan] = useState<ChatMsg['planPreview']>(null!);

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMsg = (text: string) => {
    const userMsg: ChatMsg = { role: 'user', text };
    setMsgs(prev => [...prev, userMsg]);
    setInput('');
    setSelectedChips([]);

    setTimeout(() => {
      let botMsg: ChatMsg;
      if (step === 'subjects') {
        const subs = selectedChips.length > 0 ? selectedChips : [text];
        setAnswers(a => ({ ...a, subjects: subs }));
        botMsg = { role: 'bot', text: `Harika! ${subs.join(', ')} dersleri seçildi. 📚\n\nGünde kaç saat çalışabiliyorsun?`, chips: HOURS_CHIPS };
        setStep('hours');
      } else if (step === 'hours') {
        const h = text.includes('8') ? 8 : parseInt(text) || 4;
        setAnswers(a => ({ ...a, hours: h }));
        botMsg = { role: 'bot', text: `${h} saat/gün iyi bir hedef! 💪\n\nSınavına kaç gün var? (Şu an ${user.examDaysLeft} gün görünüyor — doğruysa devam yazabilirsin)`, chips: [`${user.examDaysLeft} gün (doğru)`] };
        setStep('exam');
      } else if (step === 'exam') {
        const days = parseInt(text) || user.examDaysLeft;
        setAnswers(a => ({ ...a, examDays: days }));
        botMsg = { role: 'bot', text: `${days} gün var. Son rötuşlar... 🎯\n\nHangi günler daha çok vaktın var? (Birden fazla seçebilirsin)`, chips: DAYS_CHIPS, multiChips: true };
        setStep('days');
      } else {
        const hDays = selectedChips.length > 0 ? selectedChips : ['Cmt', 'Paz'];
        const newAnswers = { ...answers, heavyDays: hDays };
        setAnswers(newAnswers);
        const generated = generatePlan(newAnswers.subjects, newAnswers.hours, newAnswers.examDays, hDays);
        setPlan(generated);
        const total = generated.reduce((s, b) => s + b.hours, 0);
        botMsg = {
          role: 'bot',
          text: `Programın hazır! 🎉 Haftada ${total} saat, ${newAnswers.examDays} günde ~${total * Math.floor(newAnswers.examDays / 7)} saat çalışma hedefliyorsun.`,
          planPreview: generated,
        };
        setStep('done');
      }
      setMsgs(prev => [...prev, botMsg]);
    }, 400);
  };

  const handleChipToggle = (chip: string, multi?: boolean) => {
    if (!multi) {
      setSelectedChips([chip]);
      sendMsg(chip);
    } else {
      setSelectedChips(prev =>
        prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
      );
    }
  };

  const handleAddToPlan = () => {
    if (!plan) return;
    const DAYS_FULL = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    plan.forEach((block, i) => {
      const found = SUBJECTS.find(s => s.name === block.subject) ?? SUBJECTS[0];
      const task: Task = {
        id: `ai-${Date.now()}-${i}`,
        name: `${block.emoji} ${block.subject} Çalışma`,
        subject: block.subject,
        subjectColor: block.color,
        subjectEmoji: block.emoji,
        startTime: '09:00',
        endTime: `${9 + block.hours}:00`,
        duration: block.hours * 60,
        coins: parseFloat(block.hours.toFixed(1)),
        status: 'pending' as const,
        xp: Math.round(block.hours * 60 * XP_PER_MINUTE),
      };
      addFullTask(task);
    });
    onClose();
  };

  const lastMsg = msgs[msgs.length - 1];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.9)',
      display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1A1040,#0F1A2E)',
        borderBottom: '1px solid rgba(123,92,245,.3)', padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
        <div>
          <div style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: '#A78BFA', letterSpacing: 1 }}>AI PLAN ASİSTANI</div>
          <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>Konuşarak kişisel program oluşturuyor</div>
        </div>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'rgba(239,68,68,.15)',
          border: '1px solid rgba(239,68,68,.3)', color: '#EF4444', padding: '4px 12px',
          borderRadius: 8, fontFamily: 'Space Mono', fontSize: 9, cursor: 'pointer' }}>✕ Kapat</button>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start',
              flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%',
                background: m.role === 'bot' ? 'linear-gradient(135deg,#7B5CF5,#22D3EE)' : '#7B5CF533',
                border: m.role === 'user' ? '1.5px solid #7B5CF5' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                {m.role === 'bot' ? '✨' : user.emoji}
              </div>
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  background: m.role === 'bot' ? '#1A1040' : 'rgba(123,92,245,.15)',
                  border: `1px solid ${m.role === 'bot' ? 'rgba(123,92,245,.3)' : 'rgba(123,92,245,.3)'}`,
                  borderRadius: m.role === 'bot' ? '0 10px 10px 10px' : '10px 0 10px 10px',
                  padding: '10px 12px',
                }}>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text)', lineHeight: 1.6,
                    whiteSpace: 'pre-line' }}>{m.text}</div>
                  {/* Plan preview */}
                  {m.planPreview && (
                    <div style={{ background: '#0D1117', border: '1px solid rgba(123,92,245,.2)',
                      borderRadius: 8, padding: 10, marginTop: 8 }}>
                      <div style={{ fontFamily: 'Orbitron', fontSize: 9, color: '#A78BFA', marginBottom: 6 }}>
                        📅 ÖNERİLEN HAFTALIK PROGRAM
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {m.planPreview.map(b => (
                          <div key={b.day} style={{ background: b.color + '22', borderRadius: 4,
                            padding: '4px 6px', fontFamily: 'Space Mono', fontSize: 7, color: b.color }}>
                            {b.day}: {b.emoji} {b.subject} {b.hours}sa
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Chips below bot message */}
                {m.chips && i === msgs.length - 1 && step !== 'done' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {m.chips.map(chip => (
                      <button key={chip} onClick={() => handleChipToggle(chip, m.multiChips)} style={{
                        padding: '4px 10px', borderRadius: 14, cursor: 'pointer',
                        fontFamily: 'Space Mono', fontSize: 8,
                        background: selectedChips.includes(chip) ? 'rgba(123,92,245,.3)' : 'rgba(255,255,255,.05)',
                        border: `1px solid ${selectedChips.includes(chip) ? 'rgba(123,92,245,.6)' : 'rgba(255,255,255,.1)'}`,
                        color: selectedChips.includes(chip) ? '#A78BFA' : 'var(--dim)',
                      }}>{chip}</button>
                    ))}
                    {m.multiChips && selectedChips.length > 0 && (
                      <button onClick={() => sendMsg(selectedChips.join(', '))} style={{
                        padding: '4px 12px', borderRadius: 14, cursor: 'pointer',
                        fontFamily: 'Orbitron', fontSize: 8, fontWeight: 700,
                        background: 'rgba(123,92,245,.8)', border: '1px solid #7B5CF5', color: '#fff',
                      }}>Devam →</button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Plan action buttons */}
            {m.planPreview && i === msgs.length - 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, paddingLeft: 36 }}>
                <button onClick={handleAddToPlan} style={{
                  flex: 1, background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)', color: '#fff',
                  border: 'none', padding: '9px 0', borderRadius: 8,
                  fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
                  📅 TAKVİME EKLE
                </button>
                <button onClick={() => { setMsgs([{
                  role: 'bot', text: 'Tamam, tekrar deneyelim! Hangi derslere çalışıyorsun?',
                  chips: SUBJECT_NAMES, multiChips: true,
                }]); setStep('subjects'); setSelectedChips([]); }} style={{
                  background: '#1E293B', color: '#94A3B8', border: '1px solid #374151',
                  padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
                  fontFamily: 'Space Mono', fontSize: 9 }}>🔄 Yeniden</button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {step !== 'done' && (
        <div style={{ background: '#111827', borderTop: '1px solid #1E293B',
          padding: '12px 16px', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (input.trim() || selectedChips.length > 0)) sendMsg(selectedChips.length > 0 ? selectedChips.join(', ') : input); }}
            placeholder="Bir şey yaz veya yukarıdan seç..."
            style={{ flex: 1, background: '#0D1117', border: '1px solid rgba(123,92,245,.3)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
              fontFamily: 'Rajdhani', fontSize: 12, outline: 'none' }} />
          <button onClick={() => { if (input.trim() || selectedChips.length > 0) sendMsg(selectedChips.length > 0 ? selectedChips.join(', ') : input); }}
            style={{ background: 'linear-gradient(135deg,#7B5CF5,#22D3EE)', border: 'none',
              width: 38, height: 38, borderRadius: 10, fontSize: 16, cursor: 'pointer' }}>→</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] Create `src/components/AIPlanModal.tsx`
- [ ] Run `npm run build` — fix type errors

### Step 10.2 — Commit

```bash
git add src/components/AIPlanModal.tsx src/store/index.ts
git commit -m "feat: add AI plan chatbot modal with conversational flow and calendar import"
```

- [ ] Commit

---

## Task 11: PlanScreen — Wire AI Modal

**Files:**
- Modify: `src/components/screens/PlanScreen.tsx`

### Step 11.1 — Remove old AI modal, add new one

In `PlanScreen.tsx`:

1. Remove: `type AiStep`, `showAiModal`, `aiStep`, `aiSource`, `aiText`, `extractedTasks`, `mockExtractedTasks`, `handleProcessing`, `handleConfirm` (all the old AI modal state)
2. Add: `import { AIPlanModal } from '@/components/AIPlanModal';`
3. Add state: `const [showAiPlan, setShowAiPlan] = useState(false);`
4. Find the "AI PLAN OLUŞTUR" button (currently `onClick` opens old modal) and change it to `onClick={() => setShowAiPlan(true)}`
5. Remove the old AI modal JSX (the large block rendering `showAiModal && (...)`)
6. Add at the bottom of the return, before the closing `</div>`: `{showAiPlan && <AIPlanModal onClose={() => setShowAiPlan(false)} />}`

- [ ] Remove old AI modal state + JSX from PlanScreen.tsx
- [ ] Import and wire AIPlanModal
- [ ] Run `npm run build`
- [ ] Test at `http://localhost:3000`: click "AI PLAN OLUŞTUR" → modal opens, chat works, "TAKVİME EKLE" closes modal

### Step 11.2 — Commit

```bash
git add src/components/screens/PlanScreen.tsx
git commit -m "feat: wire AI plan modal to Plan screen, remove old AI modal"
```

- [ ] Commit

---

## Final Check

- [ ] Run `npm run build` — zero errors
- [ ] Open `http://localhost:3000` and verify:
  - Community tab: feed with room search, room cards, verified channel posts with gold/cyan borders, battle card VS layout, tab filtering works
  - Join a room → sticky MyRoomCard appears at top
  - Plan tab → "AI PLAN OLUŞTUR" → modal opens, chip selections work, plan generates, "TAKVİME EKLE" works
  - Avatar tab → evolution tree items clickable, info panel appears, locked items shake
  - Market tab → "✓ Özellik" category shows blue-tick item
- [ ] Final commit if any last fixes needed

```bash
git log --oneline -8
```
