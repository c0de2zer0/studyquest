I now have all the information I need to write the section-01-store content. Let me compose it.

# section-01-store

## Overview

This is the foundation section. All other sections depend on the changes made here. The implementer must complete this section before any other section begins.

**File to modify:** `/home/behlul/studyquest/src/store/index.ts`

**Secondary file to prepare (read-only in this section):** `/home/behlul/studyquest/src/lib/mock-data.ts` — field additions to `mockUser` are handled in section-02-constants-mockdata, but you must understand the current `mockUser` shape (reproduced below) to understand the store's inferred typing.

---

## Background

The Zustand store at `/home/behlul/studyquest/src/store/index.ts` is a flat single-store (~466 lines). The `user` field is typed as `typeof mockUser`, so any new fields on `mockUser` automatically extend the inferred `StoreState['user']` type. All mutations use `set(state => ({ ... }))` or direct callback form. `get()` is available inside action closures for reading current state.

**Current `mockUser.equippedItems` shape (line 34–39 of mock-data.ts):**
```typescript
equippedItems: {
  hat: 'item-hat-2',
  top: null,
  accessory: 'item-acc-1',
  background: null,
}
```

This shape is missing `bottom`, `shoes`, and `hair` slots. These must be added.

**Current `Message` interface (lines 49–60 of store/index.ts):**
```typescript
export interface Message {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  userColor: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; reacted?: boolean }[];
  isSystem?: boolean;
  replyTo?: string;
}
```

The `channel` field is missing — messages are currently not associated with any channel.

---

## Tests (Verify Before Implementing)

These are TypeScript and logic checks from the TDD plan. No test framework is required — use `npm run build` for type checks and the browser console for logic checks after implementation.

### TypeScript checks

- `gainLP(minutesStudied: number): void` compiles with no `any`
- `rankUpInfo` field type must be `{ newTier: string; newDivision: number } | null` (not optional, not `undefined`)
- `lpHistory` is `number[]` — add a comment that it is capped at 20 entries (not enforced by TS)
- `dismissRankUp: () => void` compiles
- `openLobby: (roomId: string) => void` compiles
- `closeLobby: () => void` compiles
- `activeLobbyRoom: string | null` initializes as `null`
- `Message.channel: string` — NOT optional; every message must have it
- `equipItem` signature unchanged from callers' perspective (still `(id: string) => void`)
- No `any` types introduced anywhere

### Logic verification (browser console or vitest)

```
// gainLP scenarios:
gainLP(5)  from {lp:90, rankTier:'Bronz', rankDivision:2}
  → {lp:0, rankTier:'Bronz', rankDivision:1, showRankUpModal:true}

gainLP(15) from {lp:90, rankTier:'Bronz', rankDivision:1}
  → promotes to Gümüş IV, lp:20, showRankUpModal:true

gainLP(200) from {lp:0, rankTier:'Demir', rankDivision:3}
  → correct final rank via while loop; no LP loss; showRankUpModal:true

gainLP(0)
  → no state change; showRankUpModal stays false

gainLP(60) at Usta tier
  → lp accumulates beyond 100; no tier change; showRankUpModal:false

lpHistory after 21 calls to gainLP
  → length capped at 20 (oldest entry dropped)

dismissRankUp()
  → {showRankUpModal:false, rankUpInfo:null}

// equipItem scenarios:
equipItem(hatItem)       → user.equippedItems.hat === hatItem.id
equipItem(hatItem) x2   → user.equippedItems.hat === null  (toggle)
equipItem(costumeItem)  → all 4 slots (hat, top, bottom, shoes) set
equipItem(hatItem) while costume equipped → costume cleared; only hat slot set
equipItem(bottomItem)   → user.equippedItems.bottom === bottomItem.id
equipItem(hairItem)     → user.equippedItems.hair === hairItem.id

// sendMessage channel:
sendMessage("hello") when activeChannel === 'genel-sohbet'
  → new message has channel: 'genel-sohbet'
```

---

## What To Implement

### 1. Extend `Message` interface

Add `channel: string` (required, not optional) to the `Message` interface. This must be a non-optional field — every message must have a channel association.

```typescript
export interface Message {
  // ... existing fields ...
  channel: string;  // ADD THIS — matches activeChannel values from mockChannels
  // ...
}
```

Note: After adding this field, `mockChatMessages` in `mock-data.ts` will produce TypeScript errors until section-02-constants-mockdata adds `channel` to each mock message. To avoid blocking `npm run build`, you may temporarily initialize the messages in the store using a cast, or proceed with section-02 immediately after this section.

### 2. Extend `StoreState` interface

Add the following to the `StoreState` interface:

**Under the Chat section (alongside `activeLobbyRoom` and new actions):**
```typescript
activeLobbyRoom: string | null;
openLobby: (roomId: string) => void;
closeLobby: () => void;
```

**Under the Rank section (new group, add near user-related fields or as their own group):**
```typescript
gainLP: (minutesStudied: number) => void;
dismissRankUp: () => void;
```

Note: The rank fields themselves (`lp`, `rankTier`, `rankDivision`, `lpHistory`, `showRankUpModal`, `rankUpInfo`) live on `user` and are inferred from `mockUser`. They do NOT need to be explicitly declared in `StoreState` — they are covered by `user: typeof mockUser`. However, `mockUser` must be updated in section-02 first. If you want to implement gainLP now before section-02, you can temporarily add the fields directly to `mockUser` in `mock-data.ts` (section-02 will reconcile).

### 3. Add `activeLobbyRoom` state and actions

In the store implementation (`create<StoreState>((set, get) => ({...}))`), add:

```typescript
activeLobbyRoom: null,
openLobby: (roomId) => {
  get().joinRoom(roomId);
  set({ activeLobbyRoom: roomId });
},
closeLobby: () => {
  const { activeLobbyRoom } = get();
  if (activeLobbyRoom) get().leaveRoom(activeLobbyRoom);
  set({ activeLobbyRoom: null });
},
```

### 4. Implement `gainLP` action

The `gainLP` action is the most complex new action. Key requirements:

- Calculates `lpGain = Math.round(minutesStudied * LP_PER_MINUTE)` where `LP_PER_MINUTE = 2` (defined in constants, import or inline for now)
- If `lpGain === 0`, return early — no state change, no modal
- Uses a **while loop** to handle multiple promotions in one call
- Division ordering: IV=4, III=3, II=2, I=1. Promotion decrements division (4→3→2→1), then moves to next tier at division=0 (reset division to 4)
- Tier ordering: `['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta']`
- At `Usta` tier: LP accumulates beyond 100, no tier or division change, while loop exits
- After loop: if any promotion occurred, set `showRankUpModal: true` and `rankUpInfo: { newTier, newDivision }`
- Appends the **original `lpGain`** amount (not the remainder after promotions) to `lpHistory`, keep last 20
- Also updates `user.rank` and `user.rankEmoji` strings to stay in sync with the new tier/division (format: `"Altın IV"`, `"Usta"` for Usta tier)

Stub signature and docstring:

```typescript
gainLP: (minutesStudied: number) => void;
// Calculates LP gain from minutesStudied * LP_PER_MINUTE.
// Promotes through divisions (IV→III→II→I) then tiers via while loop.
// At Usta: LP accumulates uncapped.
// Sets showRankUpModal + rankUpInfo if any promotion occurred.
// Appends lpGain to lpHistory (keep last 20 entries).
// Updates user.rank string for backward compat.
```

### 5. Implement `dismissRankUp` action

```typescript
dismissRankUp: () => set(s => ({
  user: { ...s.user, showRankUpModal: false, rankUpInfo: null }
})),
```

### 6. Update `sendMessage` action

The existing `sendMessage` action must attach the current channel to each new message:

```typescript
sendMessage: (text, replyTo) => {
  if (!text.trim()) return;
  // ... existing timestamp logic ...
  set(s => ({
    messages: [...s.messages, {
      // ... existing fields ...
      channel: get().activeChannel,  // ADD THIS LINE
      // ...
    }]
  }));
},
```

The `get()` call inside `set()` callback reads the current `activeChannel` at the time the message is sent. This follows the existing Zustand pattern used elsewhere in the store (e.g., `completeRando` already uses `get()` at line 401).

### 7. Update `equipItem` action

The existing `equipItem` (lines 319–329) only toggles `equipped: boolean` on `MarketItem` entries. It does NOT update `user.equippedItems`. This must be fixed. The updated action must:

1. Toggle `equipped` on the `items` array (existing behavior)
2. Sync `user.equippedItems[slot]` to reflect the equipped item id (or `null` if unequipped)
3. Handle the **costume** category: equipping a costume sets `hat`, `top`, `bottom`, and `shoes` simultaneously
4. Handle costume clearing: if equipping a `hat`, `top`, `bottom`, or `shoes` item while any of those four slots currently holds a costume id, clear all four slots first

**Costume detection logic:** A costume item has `category === 'costume'` in the `MarketItem` type. When checking if an existing equipped item is a costume, look up the item id from the slot in `get().items` and check its category.

**Stub with docstring:**

```typescript
equipItem: (id) => {
  // Looks up item by id; returns if not owned.
  // Determines if toggling off (item already equipped) or on.
  // If toggling off: sets items[id].equipped = false,
  //   sets user.equippedItems[item.category] = null.
  //   If costume: also nulls hat, top, bottom, shoes slots.
  // If toggling on:
  //   If item category is hat/top/bottom/shoes and a costume is
  //   currently in any of those slots: clear all 4 slots + mark
  //   the costume item as equipped=false.
  //   Set items[id].equipped = true, unequip previous same-category item.
  //   Set user.equippedItems[item.category] = id.
  //   If costume: set hat/top/bottom/shoes to costume's sub-ids (from
  //   AVATAR_LAYER_MAP costumeSlots or a costumeSlots field on MarketItem).
},
```

Note: Costume sub-slot ids (which specific hat/top/bottom/shoes layer a costume sets) are defined in `avatar-layers.ts` (created in section-03). For now, costumes can be stubbed to set all four slots to the costume's own id as a placeholder. Section-06 (market expansion) will add actual costume items with proper slot definitions.

### 8. Update `tickTimer` to call `gainLP`

In the `tickTimer` action (lines 239–266), inside the work-phase completion block (currently around line 246), add a call to `gainLP` after the `set(...)` call:

```typescript
// After existing set(...) in the timerPhase === 'work' branch:
get().gainLP(Math.round(duration / 60));
```

### 9. Update `stopTimer` to call `gainLP`

In the `stopTimer` action (lines 209–232), after the `set(s => ({...}))` block (currently around line 217), add:

```typescript
get().gainLP(Math.round(elapsed / 60));
```

This goes after the `set(...)` call that already awards XP and coins. If `elapsed < 5` the early return at line 211 prevents this from running for trivial sessions (but `Math.round(elapsed/60)` would return 0 anyway for short sessions).

### 10. Update `completeRando` to call `gainLP`

In the `completeRando` action (lines 400–412), after the `set(s => ({...}))` block, add:

```typescript
get().gainLP(Math.round(randoElapsed / 60));
```

The `randoElapsed` variable is already destructured from `get()` at line 401.

---

## New Imports Required

The `gainLP` action uses `LP_PER_MINUTE` and `RANK_TIERS` constants. These will be defined in section-02 in `/src/lib/constants.ts`. Add them to the existing import line at the top of the store file:

```typescript
import { TIMER_MODES, POMODORO_COUNT, XP_PER_MINUTE, LP_PER_MINUTE, RANK_TIERS } from '@/lib/constants';
```

If implementing this section before section-02, temporarily inline `const LP_PER_MINUTE = 2` and `const RANK_TIERS = ['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta']` inside the `gainLP` body, then remove the inline definitions once section-02 is complete and the import is updated.

---

## Dependencies

- **Depends on:** Nothing (this is the foundation section)
- **Blocks:** All other sections

## After This Section

Run `npm run build`. Expected: TypeScript errors on `mockChatMessages` because `channel` is now required on `Message` but mock messages don't have it yet. This is expected — proceed to section-02 immediately to fix it. All other TypeScript should be clean.