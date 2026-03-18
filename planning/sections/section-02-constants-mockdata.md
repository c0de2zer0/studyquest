Now I have all the information I need to write the section. Let me generate the complete, self-contained implementation section.

# section-02-constants-mockdata

## Overview

This section covers two file updates that provide foundational data for the rank system and community channel filtering. These updates depend on section-01-store being complete (the store must already have the new fields typed). Sections that depend on this section: section-03-avatar-layers, section-05-rank-components, and section-09-community.

Files to modify:
- `/home/behlul/studyquest/src/lib/constants.ts`
- `/home/behlul/studyquest/src/lib/mock-data.ts`

---

## Tests First

These checks apply before and after implementing this section. Since there is no test framework installed, verification is done via TypeScript compilation (`npm run build`) and manual browser console inspection.

### TypeScript Checks

- `RANK_TIERS` is typed as `string[]` (or `readonly string[]`), not `any[]`
- `RANK_TIER_COLORS` is typed as `Record<string, string>` with a key for every entry in `RANK_TIERS`
- `RANK_TIER_EMOJIS` is typed as `Record<string, string>` with a key for every entry in `RANK_TIERS`
- `LP_PER_MINUTE` is typed as `number`
- `mockUser.lp` is `number`, `mockUser.rankTier` is `string`, `mockUser.rankDivision` is `number`
- `mockUser.lpHistory` is `number[]`
- `mockUser.showRankUpModal` is `boolean`
- `mockUser.rankUpInfo` is `{ newTier: string; newDivision: number } | null` (not `undefined`, not optional)
- `mockUser.equippedItems` now includes `bottom`, `shoes`, and `hair` slots — all typed as `string | null`
- Every entry in `mockChatMessages` has a `channel: string` field matching an id from `mockChannels`
- `npm run build` passes with zero TypeScript errors after both files are updated

### Logic Checks (Manual Browser Console)

After the app loads, open the browser console and inspect the Zustand store:

```
// These should hold:
store.getState().user.lp === 45
store.getState().user.rankTier === 'Altın'
store.getState().user.rankDivision === 4
store.getState().user.lpHistory.length === 0
store.getState().user.showRankUpModal === false
store.getState().user.rankUpInfo === null
store.getState().user.equippedItems.bottom === null
store.getState().user.equippedItems.shoes === null
store.getState().user.equippedItems.hair === null
```

Verify channel ids in mock messages match channel ids in `mockChannels`:
```
// mockChannels ids: 'mat', 'fiz', 'kim', 'bio', 'eng', 'kpss', 'gen', 'mot', 'bas', 'soru'
// Every mockChatMessages[n].channel must be one of these ids
```

---

## Implementation: `/home/behlul/studyquest/src/lib/constants.ts`

### What to change

1. Mark `RANK_THRESHOLDS` as deprecated — do not remove it (other screens may still reference it), just add a comment above it.
2. Add the four new rank-related exports after the deprecated constant.

### Deprecation comment for RANK_THRESHOLDS

Add this comment directly above the existing `export const RANK_THRESHOLDS = [` line:

```typescript
/** @deprecated Use RANK_TIERS + RANK_TIER_COLORS instead. Left in place for legacy UI compatibility. */
```

### New constants to add

Add these after the `RANK_THRESHOLDS` block, before `XP_PER_MINUTE`:

```typescript
export const RANK_TIERS = ['Demir', 'Bronz', 'Gümüş', 'Altın', 'Platin', 'Elmas', 'Usta'] as const;

export const LP_PER_MINUTE = 2;

export const RANK_TIER_COLORS: Record<string, string> = {
  Demir:  '#7C7C7C',
  Bronz:  '#CD7F32',
  Gümüş:  '#C0C0C0',
  Altın:  '#FFD700',
  Platin: '#4DD8D3',
  Elmas:  '#B9F2FF',  // matches --cyan palette
  Usta:   '#8B5CF6',  // matches --purple palette
};

export const RANK_TIER_EMOJIS: Record<string, string> = {
  Demir:  '⛏️',
  Bronz:  '🥉',
  Gümüş:  '🥈',
  Altın:  '🥇',
  Platin: '💠',
  Elmas:  '💎',
  Usta:   '👑',
};
```

Note on `RANK_TIERS`: using `as const` gives TypeScript the narrowest tuple type. Downstream consumers that want the string union type can use `typeof RANK_TIERS[number]`.

### Final shape of constants.ts (structure only — keep existing content intact)

```
SUBJECTS        (unchanged)
TIMER_MODES     (unchanged)
AMBIENT_SOUNDS  (unchanged)
/** @deprecated */ RANK_THRESHOLDS   (unchanged content, deprecated comment added)
RANK_TIERS      (NEW)
LP_PER_MINUTE   (NEW)
RANK_TIER_COLORS (NEW)
RANK_TIER_EMOJIS (NEW)
XP_PER_MINUTE   (unchanged)
COINS_PER_HOUR  (unchanged)
POMODORO_COUNT  (unchanged)
TABS            (unchanged)
TabId           (unchanged)
```

---

## Implementation: `/home/behlul/studyquest/src/lib/mock-data.ts`

### What to change

1. Add new rank and lobby fields to `mockUser`.
2. Extend `mockUser.equippedItems` with three new slots.
3. Add `channel` field to every entry in `mockChatMessages`.

### mockUser changes

The current `mockUser` object (lines 2–48) must be updated in two places:

**1. Add rank fields directly after the existing `rankEmoji` field (currently line 14):**

```typescript
lp: 45,
rankTier: 'Altın',
rankDivision: 4,        // IV = 4 (highest division within a tier)
lpHistory: [] as number[],
showRankUpModal: false,
rankUpInfo: null as { newTier: string; newDivision: number } | null,
```

Explanation of initial values:
- `lp: 45` — user starts mid-progress within Altın IV
- `rankTier: 'Altın'` — mid-tier starting position, visually appealing
- `rankDivision: 4` — IV is the lowest division (most room to grow)
- `lpHistory: []` — no history yet, sparkline will be empty initially
- `showRankUpModal: false` — no modal on first load
- `rankUpInfo: null` — no pending rank-up info

The `as` casts are required because TypeScript infers `mockUser` as `typeof mockUser`, and without them `null` would infer as `null` type (not the union).

**2. Replace the `equippedItems` block (currently lines 34–39):**

```typescript
equippedItems: {
  hat: 'item-hat-2' as string | null,
  top: null as string | null,
  bottom: null as string | null,      // NEW slot
  shoes: null as string | null,       // NEW slot
  hair: null as string | null,        // NEW slot (was missing)
  accessory: 'item-acc-1' as string | null,
  background: null as string | null,
},
```

The `as string | null` casts on each field are necessary so TypeScript infers the field type as `string | null` rather than the narrower literal `'item-hat-2'` or `null`. Without these casts, `equipItem` would not compile when trying to assign a new `string` value to a field that TypeScript thinks is always `'item-hat-2'`.

### mockChatMessages changes

Every message object must gain a `channel` field. The channel id must match one of the `id` values in `mockChannels`:

```
mockChannels ids available: 'mat', 'fiz', 'kim', 'bio', 'eng', 'kpss', 'gen', 'mot', 'bas', 'soru'
```

The existing 8 messages are all general-conversation style, so they belong in the `'gen'` (genel-sohbet) channel. Add `channel: 'gen'` to each:

```typescript
export const mockChatMessages = [
  { id: 'm1', ..., channel: 'gen' },
  { id: 'm2', ..., channel: 'gen' },
  { id: 'm3', ..., channel: 'gen' },
  { id: 'm4', ..., channel: 'gen' },
  { id: 'm5', ..., channel: 'gen' },
  { id: 'm6', ..., channel: 'gen' },
  { id: 'm7', ..., channel: 'gen' },
  { id: 'm8', ..., channel: 'gen' },
];
```

Keep all other fields of each message exactly as they are. Only add `channel: 'gen'` to each object.

Note: The `Message` interface in the store (section-01-store) must already define `channel: string` as a required field. If `npm run build` fails with a type error on `mockChatMessages`, it means the store's `Message` interface was not updated in section-01.

Also note: The store's `sendMessage` action (updated in section-01) reads `get().activeChannel` and sets `channel: state.activeChannel` on new messages. The default `activeChannel` in the store initializes to `'gen'`. This means new messages sent from the UI will default to the genel-sohbet channel unless the user switches channels first, which is consistent with the mock data.

### No changes to other mock data

The following exports in `mock-data.ts` are NOT modified in this section:
- `mockTasks`
- `mockFriends`
- `mockLeaderboard`
- `mockMarketItems` (expanded in section-06-market-expansion)
- `mockChannels`
- `mockVoiceRooms`
- `mockOnlineMembers`
- `mockTournaments`
- `mockWeeklyCalendar`
- `mockNotifications`
- `mockBadges`
- `mockDailyHours`
- `mockHeatmapData`
- `mockSubjectDistribution`
- `mockEvolutionTree`

---

## Dependencies

This section depends on **section-01-store** being complete:
- The Zustand `StoreState` must already have `user.lp`, `user.rankTier`, `user.rankDivision`, `user.lpHistory`, `user.showRankUpModal`, `user.rankUpInfo` typed.
- The `Message` interface must already have `channel: string`.
- The `user.equippedItems` type in the store must already include `bottom`, `shoes`, and `hair` slots.

Since the store infers its `user` type from `typeof mockUser`, adding the new fields to `mockUser` here automatically satisfies the store's type requirements — no additional type annotation in the store file is needed (other than the `rankUpInfo` union type which requires the `as` cast to be visible to the inference engine).

---

## Summary Checklist

- [ ] `RANK_THRESHOLDS` in `constants.ts` has `@deprecated` JSDoc comment
- [ ] `RANK_TIERS` exported from `constants.ts` as `readonly` tuple
- [ ] `LP_PER_MINUTE = 2` exported from `constants.ts`
- [ ] `RANK_TIER_COLORS` exported with all 7 tier keys
- [ ] `RANK_TIER_EMOJIS` exported with all 7 tier keys
- [ ] `mockUser.lp = 45`
- [ ] `mockUser.rankTier = 'Altın'`
- [ ] `mockUser.rankDivision = 4`
- [ ] `mockUser.lpHistory = []` (typed as `number[]`)
- [ ] `mockUser.showRankUpModal = false`
- [ ] `mockUser.rankUpInfo = null` (typed as `{ newTier: string; newDivision: number } | null`)
- [ ] `mockUser.equippedItems` has `bottom`, `shoes`, `hair` slots (all `string | null`)
- [ ] All existing `equippedItems` slots use `as string | null` casts
- [ ] Every `mockChatMessages` entry has `channel: 'gen'`
- [ ] `npm run build` passes with zero TypeScript errors