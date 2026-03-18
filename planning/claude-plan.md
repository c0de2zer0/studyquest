# StudyQuest — Implementation Plan

**Project:** StudyQuest gamified study app
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Zustand 5, Framer Motion, Lucide React
**Style:** Dark cyberpunk aesthetic, Turkish UI
**Scope:** Five new features: Rank System, Pixel Art Avatar, Market Expansion, Community Page Rewrite, Avatar Lobby

---

## Background & Architecture Overview

StudyQuest is a client-side only gamified study application. It has no backend — all state lives in a single Zustand 5 store (`/src/store/index.ts`) initialized from mock data. There are 11 screen components in `/src/components/screens/`. UI is built from scratch using HTML, CSS, and React — no external UI libraries (no shadcn, MUI, etc.).

Styling uses CSS custom properties defined in `/src/app/globals.css` (`--bg`, `--s1`, `--s2`, `--purple`, `--cyan`, `--amber`, etc.) combined with Tailwind CSS 4 utilities and inline React styles. Fonts: Orbitron (headers), Space Mono (labels), Rajdhani (body). Animations are defined as CSS keyframes in globals.css.

The Zustand store uses a flat single-store pattern (no slices, no immer middleware). Actions use Zustand's `set()` directly. All state mutations follow the existing pattern: `set(state => ({ ... }))` or direct callback form. New fields and actions will be added to the existing store following this same pattern.

**Store note:** The store is already ~466 lines. All new components should use narrow selectors (`useStore(state => state.specificField)`) rather than subscribing to the entire store, to avoid unnecessary re-renders. This is especially important in LobbyRoom where a rAF loop runs at 60fps.

There is no test framework. TypeScript strict mode (`"strict": true`) serves as the primary correctness check.

---

## Section 1: Rank System (LoL-Style)

### Overview

Add a League of Legends–inspired rank system replacing the existing hours-based rank system. Players accumulate LP (League Points) by completing study sessions. At 100 LP, they promote to the next division or tier. No LP loss. A celebration modal fires on promotion.

### Deprecating the Old Rank System

The codebase currently has `RANK_THRESHOLDS` in `/src/lib/constants.ts` (tiers like "Kasif", "Cirak", "Ogrenci", "Bilge", "Ustat", "Efsane" based on total study hours) and `user.rank`/`user.rankEmoji` fields. These are fully replaced by the new system:

- `RANK_THRESHOLDS` constant: mark as deprecated with a comment, leave in place to avoid breaking any remaining UI that references it, but do not use in new code
- `user.rank` and `user.rankEmoji`: these fields remain in the data model but their values are derived from `rankTier` + `rankDivision`. The format becomes e.g. "Altın IV"
- Any screen currently using `user.rank` or `user.rankEmoji` directly (Dashboard, Profile, Leaderboard) will be updated to use the new `RankBadge` component instead

### Data Model

Add the following fields to `mockUser` in `/src/lib/mock-data.ts` AND to the `user` object typing in the store:

```typescript
// Add to mockUser in mock-data.ts (initial values):
lp: 45,
rankTier: 'Altın',        // Starting tier
rankDivision: 4,          // IV = 4
lpHistory: [],            // Empty initially
showRankUpModal: false,
rankUpInfo: null,

// Corresponding types for StoreState['user']:
lp: number;
rankTier: string;         // 'Demir' | 'Bronz' | 'Gümüş' | 'Altın' | 'Platin' | 'Elmas' | 'Usta'
rankDivision: number;     // 1-4 (IV=4, III=3, II=2, I=1). 0 for Usta (no divisions)
lpHistory: number[];      // last 20 LP gain amounts for sparkline display
showRankUpModal: boolean; // flag to trigger the celebration modal
rankUpInfo: { newTier: string; newDivision: number } | null;
```

Since the store types `user` as `typeof mockUser`, adding these fields to `mockUser` automatically extends the inferred type.

### Constants

In `/src/lib/constants.ts`, add:

```typescript
const RANK_TIERS = ['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta'];
const LP_PER_MINUTE = 2;  // LP gained per minute of study session
const RANK_TIER_COLORS: Record<string, string> = {
  Demir: '#7C7C7C',
  Bronz: '#CD7F32',
  Gümüş: '#C0C0C0',
  Altın: '#FFD700',
  Platin: '#4DD8D3',
  Elmas: '#B9F2FF',  // matches --cyan palette
  Usta: '#8B5CF6',   // matches --purple palette
};
const RANK_TIER_EMOJIS: Record<string, string> = { /* one emoji per tier */ };
```

### Store Actions

Add two new actions to the store:

```typescript
gainLP: (minutesStudied: number) => void;
  // Calculates LP = Math.round(minutesStudied * LP_PER_MINUTE)
  // Adds to user.lp.
  // Uses a WHILE LOOP to handle multiple promotions in one call:
  //   while (lp >= 100 && tier !== 'Usta') {
  //     lp -= 100;
  //     if (division > 1) division -= 1  (IV→III→II→I)
  //     else { move to next tier, division = 4 }
  //   }
  // If at Usta: lp accumulates beyond 100 (no cap, no tier change)
  // After the while loop, if any promotion occurred:
  //   sets showRankUpModal = true
  //   sets rankUpInfo = { newTier: finalTier, newDivision: finalDivision }
  //   (only the FINAL rank is stored — one modal shows the ultimate result)
  // Appends original LP gain amount to lpHistory (keep last 20)
  // Also updates user.rank and user.rankEmoji to stay in sync

dismissRankUp: () => void;
  // Sets showRankUpModal = false, rankUpInfo = null
```

### Integration with Timer — Exact Locations

LP must be awarded in three places in the store:

1. **`tickTimer` action** (around line 242–259): When a work phase timer reaches zero naturally, XP and coins are already awarded in this block. Add `get().gainLP(Math.round(workSessionDurationSeconds / 60))` in the same block.

2. **`stopTimer` action** (around line 211–231): When the user manually stops during an active work phase, XP and coins are already awarded. Add `get().gainLP(Math.round(elapsedSeconds / 60))` here. If the session was less than 1 minute, `Math.round()` will produce 0, which is fine (gainLP is a no-op for 0 LP).

3. **`completeRando` action** (around line 400): Awards XP but currently not LP. Add `get().gainLP(Math.round(randoDurationSeconds / 60))` here.

### UI Components

**RankBadge** (`/src/components/RankBadge.tsx`)
A compact display component showing the rank tier color, tier name, division (in Roman numerals: I, II, III, IV), and LP progress bar. Used in Dashboard, Leaderboard rows, and Profile.

Props: `tier: string`, `division: number`, `lp: number`, `size: 'sm' | 'md' | 'lg'`

**RankUpModal** (`/src/components/RankUpModal.tsx`)
Full-screen overlay (position: fixed, z-index: 9999) that fires when `showRankUpModal` is true. Shows new rank badge, a "RANK UP!" heading in Orbitron font, and confetti using the existing `confetti-fall` CSS animation. Auto-dismisses after 4 seconds or on click/tap. Calls `dismissRankUp()` on close.

**Important:** The auto-dismiss `setTimeout` must be cleaned up in the `useEffect` return function to prevent state updates on unmounted components:
```typescript
useEffect(() => {
  const timer = setTimeout(() => store.dismissRankUp(), 4000);
  return () => clearTimeout(timer);  // cleanup on unmount
}, []);
```

### Screen Updates

- **DashboardScreen:** Add a rank section below XP strip. Shows `RankBadge` (md size) + LP bar labeled "X LP / 100 LP". If at Usta tier, show LP without cap. Replace any existing `user.rank`/`user.rankEmoji` display with `RankBadge`.
- **ProfileScreen:** In the existing rank display area, replace the current static rank string with `RankBadge` (lg size) + LP history sparkline (a series of small colored bars showing the last 20 LP gains from `lpHistory`).
- **LeaderboardScreen:** Append `RankBadge` (sm size) to each leaderboard row after the existing stats. Replace static rank strings.

### RankUpModal Placement

In `AppShell.tsx`, conditionally render `<RankUpModal />` based on `showRankUpModal` from the store. This ensures it appears regardless of which tab is active. LobbyRoom is NOT in AppShell (it lives in CommunityScreen — see Section 5).

---

## Section 2: Pixel Art Avatar System

### Overview

Replace the large emoji character display with a programmatic pixel art avatar built from SVG `<rect>` elements. Each equipped item is a separate "layer" of colored rectangles that stack on top of the base character. On the Avatar Screen and in the Lobby, the full SVG character is shown. In small contexts (chat messages, leaderboard), existing emojis continue to be used.

### Pixel Art Architecture

The avatar is a fixed-size SVG (`viewBox="0 0 16 32"` — 16 wide, 32 tall, rendered at CSS-scaled sizes). Each layer is a group of `<rect>` elements defined by x, y, width, height, and color.

```typescript
interface PixelRect {
  x: number; y: number; w: number; h: number; color: string;
}

interface AvatarLayerDef {
  id: string;          // unique identifier (matches item id from market)
  slot: AvatarSlot;
  pixels: PixelRect[];
}

type AvatarSlot = 'body' | 'head' | 'hair' | 'top' | 'bottom' | 'shoes' | 'hat' | 'accessory';
```

The layer z-order (bottom to top): `body` → `bottom` → `shoes` → `top` → `hair` → `head` → `hat` → `accessory`.

The base character (always visible) consists of two layers: `body` (torso, arms, legs — skin color) and `head` (face, eyes — skin color with pixel eyes/mouth). These are built-in and do not come from inventory.

For walking animation in the Lobby, each layer has directional variants. A layer can be represented as a map of direction to pixel arrays:

```typescript
interface AnimatedLayerDef extends AvatarLayerDef {
  directional?: {
    down: PixelRect[];
    left: PixelRect[];
    right: PixelRect[];
    up: PixelRect[];
  };
  walkFrames?: PixelRect[][];  // frames[0] = idle, frames[1..3] = walk cycle
}
```

For the Avatar Screen (static display), only the default pixel array is used.

### Avatar Layer Data

All layer pixel definitions live in `/src/lib/avatar-layers.ts`. This file exports:

```typescript
export const BASE_BODY_LAYER: AnimatedLayerDef;   // default skin tone body
export const BASE_HEAD_LAYER: AnimatedLayerDef;   // default face
export const AVATAR_LAYER_MAP: Record<string, AnimatedLayerDef>; // item id → layer def
```

The `AVATAR_LAYER_MAP` keys match the `id` field of `MarketItem` entries. When an item is equipped, its layer definition is looked up by id from this map.

### PixelAvatar Component

Create `/src/components/PixelAvatar.tsx`. Wrap with `React.memo` to prevent unnecessary re-renders from parent state changes unrelated to avatar appearance:

```typescript
const PixelAvatar = React.memo(function PixelAvatar(props: PixelAvatarProps) { ... });

interface PixelAvatarProps {
  equippedItems: StoreState['user']['equippedItems'];
  size: 'preview' | 'lobby';  // preview = 96px wide, lobby = 48px wide
  direction?: 'down' | 'left' | 'right' | 'up';
  isWalking?: boolean;
  frameIndex?: number;  // 0-3, controlled by parent for walking animation
}
```

The component renders an `<svg>` with `viewBox="0 0 16 32"` and `style={{ imageRendering: 'pixelated' }}`. It collects the active layers (base body, base head, + each equipped slot's layer) sorted by z-order and renders each as a `<g>` containing `<rect>` elements. The SVG is rendered at the size determined by the `size` prop.

### Avatar Screen Integration

In `AvatarScreen.tsx`, replace the large emoji div with `<PixelAvatar equippedItems={user.equippedItems} size="preview" direction="down" />`.

**Critical: `equipItem` store action must be updated.** The existing `equipItem` action only toggles `equipped: boolean` on the `MarketItem` in the `items` array — it does NOT update `user.equippedItems`. This must be fixed:

- When equipping: set `user.equippedItems[item.category] = item.id`
- When unequipping (toggle off): set `user.equippedItems[item.category] = null`
- For **costume** items (see Section 3): set all four slots simultaneously

Without this fix, `PixelAvatar` would never reflect equip changes since it reads from `user.equippedItems`.

### Store Changes

Extend the `equippedItems` object in `mockUser` to include the new slots (also updates the inferred type in StoreState):

```typescript
equippedItems: {
  hat: string | null;
  top: string | null;
  bottom: string | null;      // NEW
  shoes: string | null;       // NEW
  hair: string | null;        // NEW — was missing, now explicit
  accessory: string | null;
  background: string | null;
}
```

Update the `equipItem` action to handle the new slots and implement the `user.equippedItems` sync described above.

---

## Section 3: Market Expansion

### Overview

Expand `mockMarketItems` from 16 to 50+ items across 7 categories (adding `bottom`, `shoes`, `hair`, and `costume`). Every equippable item will also have a corresponding entry in `AVATAR_LAYER_MAP`. Market cards will show a small SVG pixel art preview using the layer definition.

### New Item Categories

Add items following this distribution per category:

| Category | Turkish Name | Slot | Target Count |
|----------|-------------|------|--------------|
| hat | Baş/Şapka | hat | 8 items |
| hair | Saç | hair | 6 items (NEW category) |
| top | Üst Giysi | top | 8 items |
| bottom | Alt Giysi | bottom | 6 items (NEW category) |
| shoes | Ayakkabı | shoes | 6 items (NEW category) |
| accessory | Aksesuar | accessory | 8 items |
| background | Arka Plan | background | 8 items |
| costume | Kostüm | hat+top+bottom+shoes | 6 items |

Items should follow the naming convention and fantasy/cyberpunk theme of existing items (e.g., "Ejderha Zırhı", "Lazer Gözlük", "Neon Koşucular").

### Costume Equip Logic

Costumes are a special category that simultaneously set four slots. The `equipItem` action must handle this:

- Equipping a costume: sets `equippedItems.hat`, `equippedItems.top`, `equippedItems.bottom`, and `equippedItems.shoes` to the costume's corresponding layer item ids (these are stored as a `costumeSlots` field on the MarketItem or looked up from AVATAR_LAYER_MAP)
- Unequipping a costume (toggle): clears all four slots to `null`
- Equipping a single hat/top/bottom/shoes while a costume is active: first clear the costume (set all 4 slots to null), then set only the new item's slot

To implement costume detection: when a user equips an item in `hat`, `top`, `bottom`, or `shoes` category, check if any of the four slots currently has a costume id (i.e., the equipped item's category in the market is "costume"). If so, clear all four slots first.

### Rarity Pricing

Match existing item pricing conventions to avoid inconsistency:

```
Common: 15–50 sa | Rare: 50–150 sa | Epic: 150–400 sa | Legendary: 500–1000 sa
```

### MarketItem Pixel Preview

In `MarketScreen.tsx`, each item card currently shows an emoji. Alongside the emoji, add a small `<svg>` pixel art preview. This is done by looking up the item's `id` in `AVATAR_LAYER_MAP`, retrieving its `pixels` array, and rendering a miniature SVG (e.g., 32×32 or 24×48 depending on slot type). For `background` category items, show a color swatch instead (2-3 rectangles of the background palette colors).

The MarketItem type in the store does not need changes. The pixel preview is purely a display concern — the `PixelAvatar` component handles rendering.

### Mock Data File

`/src/lib/mock-data.ts` will have its `mockMarketItems` array extended with ~34 new items. A companion file `/src/lib/avatar-layers.ts` will define the pixel art for all items. These two files must stay in sync: every item with an equippable slot should have a corresponding entry in `AVATAR_LAYER_MAP`.

---

## Section 4: Community Page Rewrite

### Overview

`CommunityScreen.tsx` is completely rewritten. The new implementation is a three-panel Discord-like layout: left sidebar (channels + voice rooms), center (message list + input), right sidebar (member list). On mobile-width screens, tabs switch between the three panels.

### Layout

The outer container is `height: calc(100vh - <header+tabbar height>)` with `display: flex` and `overflow: hidden`. The three panels are:

1. **Left sidebar** (240px, `flex-shrink: 0`, `overflow-y: auto`): Channel categories and voice rooms.
2. **Main chat area** (`flex: 1`, `display: flex`, `flex-direction: column`): channel header + scrollable messages + input bar.
3. **Right sidebar** (240px, `flex-shrink: 0`, `overflow-y: auto`): member list grouped by status.

On screens narrower than ~700px, replace the three-panel layout with three tabs (Kanallar / Sohbet / Üyeler) using a tab bar at the top of the component.

### Left Sidebar — Channel List

Render channels from `mockChannels` grouped by their `category` field. The existing mock data uses `"lessons"` and `"general"` as category values — use these exact values for filtering. Display labels in Turkish: "Ders Kanalları" for `"lessons"` and "Genel" for `"general"`. Each category is a collapsible group using local React `useState`. Channel items show the `#` icon (Lucide `Hash`), the channel name, and an unread dot if `unread > 0`. The active channel is highlighted.

Below text channels, render the voice rooms from store's `voiceRooms`. Each room shows: `🔊` icon, room name, capacity indicator, and a "Katıl" / "Çık" button. Clicking "Katıl" calls `openLobby(roomId)`.

### Message Channel Filtering

**Critical: The `Message` interface must include a `channel` field.** Currently messages in the store have no channel association, which means all channels show the same messages.

Changes required:
- Add `channel: string` to the `Message` interface in the store
- Update the `sendMessage` action to read `get().activeChannel` from state and attach it: `channel: state.activeChannel`
- Update `mockChatMessages` in mock-data.ts to include `channel` ids matching the ids of `mockChannels` entries (e.g., `channel: 'genel-sohbet'`)
- When rendering the message list, filter: `store.messages.filter(m => m.channel === store.activeChannel)`

### Center Panel — Message List

The list uses `useRef` for the bottom sentinel and `useEffect` (on `messages.length`) to auto-scroll.

Message grouping: compare each message's `userId` with the previous message's `userId`. If they match (and time delta < 5 minutes), render a compact form (no avatar, no username, just content + time on hover). Otherwise render a full message row (avatar emoji, username, content).

On message hover, show a reaction action bar: 8 preset emoji buttons plus a "+" button that expands to a small emoji grid. Clicking a preset calls `addReaction(msgId, emoji)`. The existing `addReaction` action in the store handles the toggle logic correctly.

Reactions are displayed as pills below the message content. Each pill shows emoji + count. A highlighted style (border + background tint in --purple) indicates the user has reacted (`reacted: true`).

Reply functionality: clicking the reply icon sets local state `replyingTo: Message | null`. A reply preview bar appears above the input. `sendMessage` is called with `replyTo = replyingTo.id`.

### Center Panel — Message Input

A `<textarea>` (auto-resizes up to 4 lines) with `onKeyDown`: Enter (without Shift) calls `sendMessage(value.trim())` and clears input; Shift+Enter inserts newline. When `replyingTo` is set, a dismiss button clears it.

### Right Sidebar — Member List

Display `mockOnlineMembers` sorted by status priority (studying > online > break > dnd > offline). Group into "ÇEVRİMİÇİ" and "ÇEVRİMDIŞI" sections. Each member row: status color dot, emoji, name. Current user (identified by matching `user.id`) gets "(Sen)" suffix.

### Store Changes

Add one field to the store root (not inside `user`):

```typescript
activeLobbyRoom: string | null;  // null = no lobby open; roomId = lobby is open
```

Add actions:
```typescript
openLobby: (roomId: string) => void;   // sets activeLobbyRoom = roomId, also calls joinRoom
closeLobby: () => void;                // sets activeLobbyRoom = null, calls leaveRoom
```

---

## Section 5: Avatar Lobby (2D Top-Down)

### Overview

When a user joins a voice room from Community, the Lobby view opens as a full-screen overlay inside `CommunityScreen.tsx`. It shows an 800×600 pixel art room (CSS background). The user controls their pixel art avatar with WASD or arrow keys. 5-6 mock other users are shown at fixed positions with subtle idle movement.

### LobbyRoom Component

Create `/src/components/screens/LobbyRoom.tsx`. In `CommunityScreen.tsx`, conditionally render `<LobbyRoom />` as a `position: fixed; inset: 0; z-index: 100` overlay when `activeLobbyRoom !== null`. The lobby does NOT render in `AppShell.tsx` — it is scoped to the Community screen.

### Mobile Responsiveness

The room is 800×600px. On screens narrower than 800px, apply a CSS `transform: scale()` to the room container so it fits within the viewport without overflow. The scale factor is calculated as `min(1, window.innerWidth / 800)`, updated on resize via a `useEffect` + `ResizeObserver`. This ensures the lobby is usable on mobile without a scrollbar.

### Room Background (CSS Pixel Art)

The room background is an 800×600 `<div>` with CSS rendering:
- Floor: dark teal grid using `repeating-linear-gradient` (4px squares) in the --s1 / --s2 palette
- Walls: top bar and side bars as dark rectangles (--bg color, 40px thick)
- Furniture elements: a few CSS `<div>` "objects" (desks, bookshelves) positioned absolutely, drawn as colored rectangles with cyberpunk colors

All visual elements are pure CSS — no image files.

### Player Movement

```typescript
// Key state — useRef, NOT useState (avoids re-renders on every keydown)
const keysRef: React.MutableRefObject<Set<string>>;

// Mutable position for rAF loop — also useRef
const posRef: React.MutableRefObject<{ x: number; y: number }>;

// React state (triggers re-render to update SVG position)
const [playerPos, setPlayerPos]: [{ x: number; y: number }, setter];
const [playerDir, setPlayerDir]: ['down'|'left'|'right'|'up', setter];
const [isWalking, setIsWalking]: [boolean, setter];
const [frameIndex, setFrameIndex]: [number, setter];  // 0-3 for walk animation
```

The movement loop runs in a `requestAnimationFrame` callback, started in a `useEffect` with empty deps (runs once on mount). Each frame:
1. Read `keysRef.current` for pressed keys (WASD + arrows)
2. Update `posRef.current.x` and `.y` by SPEED (3px/frame), clamped to map bounds minus player size
3. Call `setPlayerPos({ x, y })` — one React re-render per frame
4. Update `playerDir` and `isWalking` based on key state
5. Advance `frameIndex` every ~8 frames (via a frame counter ref) when walking

Map bounds: player x clamped to `[WALL_THICKNESS, MAP_W - WALL_THICKNESS - PLAYER_SIZE]`, y clamped to `[WALL_THICKNESS, MAP_H - WALL_THICKNESS - PLAYER_SIZE]`.

Prevent default on arrow keys in the keydown handler to stop page scrolling.

**Performance: memoization strategy.** The `setPlayerPos` call triggers a re-render of LobbyRoom every frame. To prevent cascading re-renders:
- Wrap the room background component with `React.memo` (it never changes)
- Wrap each mock player component with `React.memo` (they only change on idle movement)
- `PixelAvatar` is already wrapped in `React.memo`
- Mock player idle movement should NOT use React state — instead use a `ref` to update DOM position directly: `playerRef.current.style.transform = \`translate(${x}px, ${y}px)\``

### Walk Animation

The animation uses a frame counter ref:

```typescript
const frameCounterRef: React.MutableRefObject<number>;  // increments each rAF tick
```

`frameIndex = Math.floor(frameCounterRef.current / FRAMES_PER_STEP) % WALK_FRAME_COUNT` where `FRAMES_PER_STEP = 7` and `WALK_FRAME_COUNT = 4`. This advances the walk cycle at ~8.5 fps from a 60fps rAF loop.

When `isWalking` is false, `frameIndex` stays at 0 (idle frame).

### Rendering

The lobby room container is `position: relative; overflow: hidden; width: 800px; height: 600px` centered on the screen. Inside:

- Room background divs (floor, walls, furniture) — static, memoized, no state changes
- Mock players: each is `position: absolute` at their static starting position. They use `<PixelAvatar>` in lobby size with `direction: 'down'`. For subtle movement, each mock player updates its DOM position via ref + setInterval (NOT React state), as described above.
- The user's player: `position: absolute` at `playerPos.x, playerPos.y`. Uses `<PixelAvatar size="lobby" direction={playerDir} isWalking={isWalking} frameIndex={frameIndex} equippedItems={user.equippedItems} />`. A name label floats above.

### Exit Button

A fixed-position "Lobiden Çık" button (top-right corner of the lobby overlay) calls `store.closeLobby()`. The overlay disappears and Community view resumes.

### Mock Players Data

Define 5 mock players inline in the component (or in mock-data.ts):

```typescript
interface MockLobbyPlayer {
  id: string; name: string; emoji: string;
  x: number; y: number;
  equippedItems: StoreState['user']['equippedItems'];
}
```

Each mock player has a distinct starting position spread around the room. Their pixel avatars use simple equipped items (or null for bare base character).

---

## Section 6: Cross-Cutting Concerns

### File Structure After Implementation

```
/src/
  components/
    PixelAvatar.tsx             (NEW)
    RankBadge.tsx               (NEW)
    RankUpModal.tsx             (NEW)
    screens/
      CommunityScreen.tsx       (REWRITE)
      LobbyRoom.tsx             (NEW — rendered as overlay inside CommunityScreen)
      AvatarScreen.tsx          (UPDATE)
      MarketScreen.tsx          (UPDATE)
      DashboardScreen.tsx       (UPDATE)
      ProfileScreen.tsx         (UPDATE)
      LeaderboardScreen.tsx     (UPDATE)
  lib/
    avatar-layers.ts            (NEW)
    mock-data.ts                (UPDATE — 34+ new items, mockUser new fields)
    constants.ts                (UPDATE — rank constants, RANK_THRESHOLDS deprecated)
  store/
    index.ts                    (UPDATE — new fields + actions + Message.channel)
  app/
    AppShell.tsx                (UPDATE — RankUpModal only, NOT LobbyRoom)
```

### Implementation Order

Since `PixelAvatar` is a dependency for both AvatarScreen and LobbyRoom, implement in this order:

1. Store changes (rank fields + updated `equippedItems` slots + lobby state + Message.channel)
2. Constants updates (deprecate RANK_THRESHOLDS, add RANK_TIERS, LP_PER_MINUTE, etc.)
3. mock-data.ts updates (mockUser new fields, mockChatMessages channel ids)
4. avatar-layers.ts (base character + initial set of layer defs)
5. PixelAvatar component
6. RankBadge + RankUpModal components
7. Market mock data expansion
8. AvatarScreen update
9. MarketScreen update
10. Dashboard + Profile + Leaderboard rank UI
11. CommunityScreen rewrite
12. LobbyRoom component

### Styling Consistency

All new UI must follow the existing CSS variable palette. New components should use the same `.card`, `.btn-gradient`, `.badge`, `.section-label`, `.gradient-text` classes from globals.css where appropriate. Orbitron for headings, Rajdhani for body, Space Mono for numbers/labels.

Rank tier colors (`RANK_TIER_COLORS`) should match the cyberpunk palette as closely as possible — e.g., Elmas = `--cyan`, Usta = `--purple`, Altın = `--gold`.

### TypeScript

Add all new types to the store file (for store-related types) or to a `/src/lib/types.ts` file if they need to be shared across components. The `AvatarLayerDef` and related types belong in `avatar-layers.ts` since they are only used by `PixelAvatar` and market preview rendering.

No any-type usage. New fields on the store's `StoreState` interface must be fully typed.

---

## Out of Scope

- Real-time multiplayer (WebSocket, SSE, etc.)
- Backend API or database
- Image file sprites (all pixel art is inline SVG/CSS)
- External UI component libraries
- Unit or integration tests (no test framework present)
- Persistence to localStorage (store resets on page reload — existing behavior unchanged)
- Virtual joystick for mobile lobby (CSS scaling handles overflow)
- Queuing multiple RankUp modals (only final rank shown on multi-promotion)
