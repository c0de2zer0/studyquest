# Design Spec: Community Redesign + AI Chatbot + Avatar Fixes
**Date:** 2026-03-19
**Status:** Approved (v2 — post-review)

---

## 0. Deprecations & Removals

These existing pieces are **removed** in this spec:

| What | Where | Why |
|------|-------|-----|
| `messages`, `sendMessage`, `addReaction`, `activeChannel`, `setActiveChannel`, `joinedRooms`, `voiceRooms`, `joinRoom`, `leaveRoom` | `store/index.ts` | Replaced by new Room system |
| `mockChatMessages`, `mockVoiceRooms`, `mockChannels` | `mock-data.ts` | Replaced by `mockRooms` |
| `LobbyRoom.tsx` | `screens/` | Voice lobby orphaned; keep file but remove from CommunityScreen |
| `activeLobbyRoom`, `openLobby`, `closeLobby` | store | Lobby feature removed from community flow |
| Existing AI modal (showAiModal, aiStep, extractedTasks) | `PlanScreen.tsx` | **Replaced** by new `AIPlanModal.tsx` |
| Discord 3-column layout | `CommunityScreen.tsx` | Full rewrite |

---

## 1. Community Page — Full Redesign

### 1.1 Layout
Single full-width column. No sidebars.

```
┌─────────────────────────────────────────┐
│  [MY ROOM CARD] ← only when in a room  │
├─────────────────────────────────────────┤
│  [🔍 Oda ara...] [+ Oda Kur]            │
├─────────────────────────────────────────┤
│  Tabs: Keşfet | Kapışmalar | Kanallar | Turnuvalar │
├─────────────────────────────────────────┤
│  [Bir şey paylaş...] create bar         │
│  [Post cards — filtered by active tab]  │
└─────────────────────────────────────────┘
```

### 1.2 Tab Filtering Logic

| Tab | Shows |
|-----|-------|
| Keşfet | All post types |
| Kapışmalar | type === 'battle' only |
| Kanallar | isVerifiedChannel === true only |
| Turnuvalar | type === 'tournament' only |

### 1.3 Study Rooms

**Types:**
```typescript
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
```

**Store additions (new, not replacing anything above that's already removed):**
```typescript
rooms: Room[];
myRoom: Room | null;
createRoom: (data: Omit<Room, 'id' | 'members' | 'messages'>) => void;
joinRoomById: (roomId: string) => void;   // rejects if full, shows toast
leaveCurrentRoom: () => void;
sendRoomMessage: (text: string) => void;
```

**Room discovery UI (`src/components/community/RoomSearch.tsx`):**
- Search input: filters `rooms` by name/subject
- Room card: emoji + name + owner + `X/Y kişi` + permission badges + join button
- Full rooms: join button disabled, shows "Dolu"
- Permission badges: `📝 Yazabilirsin` / `⚔️ Kapışabilirsin` / `🔒 Sadece izle`

**Create Room (`src/components/community/CreateRoomModal.tsx`):**
- Fields: ad (text, required), konu (subject select), izinler (canWrite checkbox, canCompete checkbox), tür (açık/davetli radio)
- "ODA KUR" → `createRoom()` → `joinRoomById(newRoom.id)`

**My Room Card (`src/components/community/MyRoomCard.tsx`):**
- Sticky: `position: sticky; top: 0; z-index: 10`
- Shows: room emoji/name, owner, member avatar row (max 4 + "+N")
- Buttons: `💬 Sohbet` (toggle inline chat) / `⚔️ Kapış` (navigates to Rando tab) / `ÇIKIŞ`
- Inline chat: last 3 messages + text input, visible only when `canWrite === true`
- Mobile (<640px): collapsed by default, tap header to expand; max-height 45vh

### 1.4 Updated CommunityPost Type

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

  // challenge fields (existing)
  subject?: string;
  subjectColor?: string;
  durationMin?: number;
  participants?: string[];

  // verified channel fields
  isVerifiedChannel?: boolean;
  channelName?: string;
  followerCount?: number;
  channelEmoji?: string;
  channelBorderColor?: string;

  // battle fields
  player1?: { id: string; name: string; emoji: string; color: string; score: number };
  player2?: { id: string; name: string; emoji: string; color: string; score: number };
  battleSubject?: string;
  battleDurationMin?: number;
  timeRemainingSeconds?: number;

  // tournament fields (inside channel posts)
  tournamentName?: string;
  tournamentPrize?: string;
  tournamentCapacity?: number;
  tournamentParticipants?: number;
  tournamentStartTime?: string;
}
```

### 1.5 Post Card Components

File structure:
```
src/components/community/
  RoomSearch.tsx        ← room discovery + search
  CreateRoomModal.tsx   ← create room form
  MyRoomCard.tsx        ← sticky card when in a room
  PostCard.tsx          ← normal post (existing, refactored)
  BattleCard.tsx        ← live battle VS card
  ChannelCard.tsx       ← verified channel post wrapper
  TournamentCard.tsx    ← embedded tournament call-to-action
  CreatePostForm.tsx    ← existing, kept
  CommunityScreen.tsx   ← orchestrates all above
```

**BattleCard:**
- Shows VS layout with score bars
- `👁 İzle` → opens a simple score modal (no routing)
- `⚔️ Meydan Oku` → `setActiveTab('rando')` (navigates to existing Rando screen)

**ChannelCard:**
- Gold/colored border based on `channelBorderColor`
- `✦ ONAYLI KANAL` badge
- `TAKİP ET` button → increments mock follower count (local state only)
- Can embed `<TournamentCard />` or `<BattleCard />` inside

**TournamentCard (inside ChannelCard):**
- Tournament name + prize + progress bar (participants / capacity)
- Start time
- `⚔️ TURNUVAYA KATIL` → adds to `store.tournaments` with a toast

### 1.6 Blue Tick / Verified System

**Market item (add to `mockMarketItems`):**
```typescript
{ id: 'item-feature-blue-tick', name: 'Mavi Tik ✓', category: 'ozellik',
  emoji: '✓', rarity: 'legendary', price: 500, owned: false, equipped: false }
```

**Market UI:** Add `'ozellik'` to `ITEM_CATEGORIES` in `AvatarScreen.tsx` and `MarketScreen.tsx` filter.

**`buyItem` special case:** After buying `item-feature-blue-tick`, set `user.isVerified = true`. Implement as a post-buy hook inside `buyItem`:
```typescript
if (id === 'item-feature-blue-tick') {
  set(s => ({ user: { ...s.user, isVerified: true } }));
}
```
`isVerified` is permanent once bought (no un-equip/sell mechanic).

**Store:** Add `isVerified: boolean` (default `false`) to `mockUser`.

**Effects when verified:**
- `✓` badge next to username in posts, rooms, leaderboard rows
- Posts get `isVerifiedChannel: true` styling
- Can create tournaments (button enabled)

**Mock pre-seeded verified channels in `mockCommunityPosts`:**
- Gri Koç: `channelBorderColor: '#FFD700'`, `followerCount: 847000`
- Nit Dershanesi: `channelBorderColor: '#22D3EE'`, `followerCount: 234000`

---

## 2. Plan Page — AI Chatbot Modal

### 2.1 Trigger
Remove existing `showAiModal` + `aiStep` state machine from `PlanScreen.tsx`. Replace with:
```typescript
const [showAiPlan, setShowAiPlan] = useState(false);
```
"✨ AI PLAN OLUŞTUR" button → `setShowAiPlan(true)`.

### 2.2 New File: `src/components/AIPlanModal.tsx`

Props: `{ onClose: () => void; onAddToPlan: (tasks: Task[]) => void }`

### 2.3 Internal State
```typescript
type ChatMsg = { role: 'bot' | 'user'; text: string; planPreview?: GeneratedPlan };
type ConvStep = 'subjects' | 'hours' | 'exam' | 'days' | 'done';
interface GeneratedPlan {
  weeklyBlocks: { day: string; subject: string; hours: number; emoji: string; color: string }[];
  totalPerWeek: number;
  estimatedTotal: number;
}
```

### 2.4 Conversation Flow

```
Step 'subjects':
  Bot: "Merhaba! Hangi derslere çalışıyorsun?"
  Quick-reply chips: Matematik / Fizik / Kimya / Biyoloji / Edebiyat / TYT
  Multiple chips selectable, or free text.
  On send → advance to 'hours'

Step 'hours':
  Bot: "Günde kaç saat çalışabiliyorsun?"
  Chips: 2 saat / 4 saat / 6 saat / 8 saat+
  On send → advance to 'exam'

Step 'exam':
  Bot: "Sınavına kaç gün var? ({user.examDaysLeft} gün görünüyor, doğru mu?)"
  User confirms or types new number → store examDaysLeft update
  On send → advance to 'days'

Step 'days':
  Bot: "Hangi günler daha çok vaktin var?"
  Multi-select chips: Pzt / Sal / Çar / Per / Cum / Cmt / Paz
  On send → generate plan, advance to 'done'

Step 'done':
  Bot message contains planPreview
  Action buttons: TAKVİME EKLE / Yeniden Oluştur
```

### 2.5 Plan Generation Logic

```typescript
function generatePlan(subjects: string[], hoursPerDay: number, examDays: number, heavyDays: string[]): GeneratedPlan {
  // Distribute hours: Matematik/Fizik get 30% each, others split remainder
  // heavyDays get hoursPerDay + 2, others get hoursPerDay
  // Output: weeklyBlocks[]
}
```

### 2.6 Task Shape Mapping (TAKVİME EKLE)

Generated plan blocks → `Task` objects:
```typescript
{
  id: `ai-${Date.now()}-${i}`,
  name: `${subjectEmoji} ${subject} Çalışma`,
  subject,
  subjectColor,
  subjectEmoji,
  startTime: '09:00',
  endTime: `${9 + hours}:00`,
  duration: hours * 60,
  coins: parseFloat((hours / 1).toFixed(1)),
  status: 'pending' as const,
  xp: Math.round(hours * 60 * XP_PER_MINUTE),
}
```

`onAddToPlan(tasks)` → `store.tasks = [...store.tasks, ...tasks]`; `setShowAiPlan(false)`.

### 2.7 UI Layout
- Full-screen fixed overlay `position: fixed; inset: 0; z-index: 50`
- Header + scrollable chat area + sticky input bar
- Chat bubbles: bot (left, purple border) / user (right, purple fill)
- Quick-reply chips below bot messages
- Input disabled while step === 'done' (only action buttons shown)

---

## 3. Avatar Fixes

### 3.1 Evolution Tree — onClick

In `AvatarScreen.tsx`, add:
```typescript
const [selectedEv, setSelectedEv] = useState<string | null>(null);
```

On unlocked item click → `setSelectedEv(ev.id)`:
- Show info panel below tree: form name, required hours, stat bonuses (mock)
- If `ev.current`: show "Bu senin mevcut formun ✓"
- If previously unlocked: show "Bu formu geçtin ✓ · {ev.reqHours} saatte ulaştın"

On locked item click: CSS shake animation (keyframe `@keyframes shake`) for 300ms via `useState<string>` for `shakingId`.

### 3.2 Equipped Items — AVATAR_LAYER_MAP Audit

Read all item IDs from `mockMarketItems`. Cross-check against `AVATAR_LAYER_MAP` keys in `avatar-layers.ts`. For any item ID without an entry, add a fallback colored-rect layer:

| Slot | y range | x range | Notes |
|------|---------|---------|-------|
| hat | 0–2 | 3–12 | Covers top of head |
| hair | 2–5 | 3–12 | Hairline area |
| top | 10–20 | 1–14 | Covers torso + arms |
| bottom | 21–29 | 3–12 | Covers hips/legs |
| shoes | 30–31 | 2–13 | Covers feet |
| accessory | 8–10 | 11–14 | Neck/shoulder area |

Color comes from item's `rarityColor` mapped from item rarity.

> Note: Reviewer found that AVATAR_LAYER_MAP may already cover all existing items. Implementer should verify — if all items have entries, skip this step.

---

## 4. Implementation Order

```
1. Store + Types
   - Remove deprecated chat/voice store keys
   - Add Room types, mockRooms, isVerified, rooms/myRoom actions
   - Update CommunityPost type with all new fields
   - Add 'ozellik' category support + buyItem blue-tick hook

2. Avatar LAYER_MAP audit + fix (quick)

3. AvatarScreen — evolution tree onClick + info panel

4. Community sub-components (parallel work possible)
   - RoomSearch.tsx
   - CreateRoomModal.tsx
   - MyRoomCard.tsx
   - BattleCard.tsx
   - ChannelCard.tsx + TournamentCard.tsx
   - PostCard.tsx (refactor existing)
   - CommunityScreen.tsx (orchestrate)

5. AIPlanModal.tsx (new)

6. PlanScreen.tsx — remove old AI modal, wire new one
```
