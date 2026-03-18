# StudyQuest — Research Findings

Generated for deep-plan workflow. Covers codebase analysis and web research for 4 key topics.

---

## Part 1: Codebase Analysis

### Project Structure

```
/home/behlul/studyquest/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── layout.tsx, page.tsx, globals.css
│   ├── components/
│   │   ├── AppShell.tsx, AppHeader.tsx, TabBar.tsx, XPStrip.tsx
│   │   ├── atoms/                    # Badge, SectionLabel, ProgressBar, StatCard, Toast
│   │   └── screens/                  # 11 screen components (Dashboard, Timer, Plan, Avatar, Market, Community, Tournament, Rando, Leaderboard, Analytics, Profile)
│   ├── store/index.ts                 # Single Zustand store (~600 lines, ~170 actions)
│   ├── lib/mock-data.ts, constants.ts, utils.ts
│   └── hooks/useTimer.ts, useCountdown.ts, useRandoMatcher.ts
```

### Zustand Store — Current State Shape

```typescript
// User state (relevant fields)
user: {
  level: number, xp: number, xpMax: number, balance: number,
  rank: string, rankEmoji: string,
  totalHours: number, weeklyXp: number,
  equippedItems: {
    hat: string | null,
    top: string | null,
    accessory: string | null,
    background: string | null
  },
  // NOTE: missing: lp, division, rankHistory, bottom, shoes
}

// Market state
items: MarketItem[]  // 16 items in mock data
// MarketItem: { id, name, category, emoji, rarity, price, owned, equipped, isDaily?, dailyPrice? }
// Categories: 'hat' | 'top' | 'accessory' | 'background' | 'costume'
// Rarities: 'common' | 'rare' | 'epic' | 'legendary'

// Community state
messages: Message[]
activeChannel: string
joinedRooms: string[]
voiceRooms: VoiceRoom[]
userStatus: UserStatus

// Message: { id, userId, userName, userEmoji, userColor, content, timestamp, reactions, isSystem?, replyTo? }
// Reaction: { emoji: string, count: number, reacted?: boolean }
// NOTE: reactions don't have userIds array — only a boolean `reacted`. Needs upgrade for proper toggle.
```

### Existing Actions in Store

- `buyItem(id)` — checks balance, deducts, sets owned
- `equipItem(id)` — unequips same-category item, equips new one (updates `user.equippedItems`)
- `sendMessage(text, replyTo?)` — adds to messages with timestamp
- `addReaction(msgId, emoji)` — toggles: if reacted, decrements; if count→0, removes; else increments
- `joinRoom(roomId)` / `leaveRoom(roomId)`
- All timer, tasks, tournament, notification actions

### Constants

```typescript
// From constants.ts
RANK_THRESHOLDS  // 6 tiers based on hours (not LoL-style yet)
XP_PER_MINUTE = 3
COINS_PER_HOUR = 1
```

### Styling System

- **CSS variables**: `--bg: #07080F`, `--s1: #0D0E1A`, `--s2: #121424`, `--purple: #7B5CF5`, `--cyan: #22D3EE`, `--amber: #F59E0B`, `--green: #10B981`, `--red: #EF4444`, `--pink: #EC4899`, `--gold: #FFD700`, `--text: #E2E8F0`, `--muted: #94A3B8`
- **Rarity colors**: `common: '#64748B'`, `rare: '#22D3EE'`, `epic: '#7B5CF5'`, `legendary: '#FFD700'`
- **Reusable CSS classes**: `.card`, `.btn-gradient`, `.badge` (7 variants), `.section-label`, `.progress-track/.progress-fill`, `.gradient-text`, `.no-scrollbar`
- **Fonts**: Orbitron (headers), Space Mono (badges/codes), Rajdhani (body)
- **Animations**: `float` (3s vertical), `pulse-glow` (1s opacity), `confetti-fall`, `slideInRight/toastProgress`

### Testing Setup

**No testing framework installed.** No jest, vitest, playwright, or testing-library in package.json. This is a pure frontend simulation app with no API layer, so we will skip unit tests for UI components and focus on TypeScript types as the primary correctness check.

### Key Dependencies

```json
"next": "16.1.7",
"react": "19.2.3",
"zustand": "^5.0.12",
"framer-motion": "^12.38.0",
"lucide-react": "^0.577.0",
"tailwindcss": "^4"
```

### Current Gaps (per HANDOFF.md)

1. Community needs proper 3-pane Discord layout (partially done)
2. Avatar pixel art system — avatars use emojis, not sprite layers
3. Voice room avatar lobby — no 2D system
4. Rank system — only level/XP, no LoL-style LP/division
5. Market items — only 16 items, needs 40+

---

## Part 2: Web Research — Pixel Art Layered Avatar System

### Core CSS Rule

```css
.sprite {
  image-rendering: pixelated;      /* Chrome, Edge, Opera */
  image-rendering: crisp-edges;    /* Firefox fallback */
}
```

**Critical constraint:** Only use integer scale factors. Non-integer scaling causes blur that `pixelated` cannot fix.

### Paper-Doll Pattern

All layers share the same frame grid layout. Stack with `position: absolute` + `z-index`.

```
LAYER_Z_INDEX = { body: 1, pants: 2, shirt: 3, armor: 4, hair: 5, hat: 6, accessory: 7 }
```

```tsx
// Container: position relative, fixed W×H
// Each layer: position absolute, inset 0
// background-image: url(/sprites/layer.png)
// background-position: -frame*W px  -directionRow*H px
// image-rendering: pixelated
```

Every sprite sheet MUST have the same frame dimensions and row order:
- Row 0: down, Row 1: left, Row 2: right, Row 3: up (top-down RPG convention)

### Sprite Sheet Animation with CSS steps()

```css
.sprite-frame {
  animation: walk 0.5s steps(8) infinite; /* steps = frame count */
}
@keyframes walk {
  from { background-position: 0 0; }
  to   { background-position: -384px 0; } /* 8 frames × 48px */
}
```

`steps()` is required — never use `ease` or `linear` for pixel art animation.

### Animation Hook

```typescript
function useSpriteAnimation(frameCount: number, fps: number = 8) {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => (f + 1) % frameCount), 1000 / fps);
    return () => clearInterval(id);
  }, [frameCount, fps]);
  return frame;
}
```

For idle state: stop animation, hold frame 0.

### SVG Alternative

For static display (profile, preview) without sprite sheets:

```tsx
<svg viewBox="0 0 32 32" style={{ imageRendering: 'pixelated' }}>
  <image href="/layers/body.png" width="32" height="32" />
  <image href="/layers/hair_brown.png" width="32" height="32" />
  <image href="/layers/shirt_blue.png" width="32" height="32" />
</svg>
```

---

## Part 3: Web Research — Discord-Like Chat UI

### Layout Structure

3-pane layout with Flexbox, full-height:

```
[Channel Sidebar 240px] [Main Chat flex-1] [Members Sidebar 240px]
```

- Channel sidebar: category groups with collapsible disclosure, `#` icon for text, `🔊` for voice
- Main chat: sticky header, scrollable message list (`flex-1 overflow-y-auto`), sticky input
- Members sidebar: grouped by status (online/offline)

### Auto-Scroll Pattern

```tsx
const bottomRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
}, [messages.length]); // Depend on LENGTH not array reference
```

### Message Grouping

Consecutive messages from same author: skip avatar + username repeat. Check `messages[i-1].userId === msg.userId`.

### Emoji Reaction Toggle Logic

Current store uses `{ emoji, count, reacted?: boolean }`. This is fine for single-user simulation. The toggle:
1. If reaction with `emoji` exists AND `reacted: true` → decrement count, set `reacted: false`, remove if count → 0
2. If reaction exists AND `reacted: false` → increment count, set `reacted: true`
3. If reaction doesn't exist → add `{ emoji, count: 1, reacted: true }`

The existing `addReaction` action already handles this correctly.

### Quick Reaction Picker

Show 6-8 preset emojis on message hover: `['👍', '❤️', '😂', '😮', '😢', '🔥', '💯', '🎯']`

---

## Part 4: Web Research — 2D Top-Down Lobby

### Architecture Decision: CSS DOM over Canvas

For this simulation (no tile collision, no per-frame physics), CSS `position: absolute` is preferred:
- React state + JSX work naturally
- Inspectable in DevTools
- No manual redraw loop

### Movement Pattern: Keys in Ref + rAF

```typescript
const keysRef = useRef<Set<string>>(new Set());
const posRef = useRef({ x: 200, y: 200 }); // mutable copy for rAF
const rafRef = useRef<number>(0);

// In useEffect:
const loop = () => {
  const keys = keysRef.current;
  let { x, y } = posRef.current;
  // Update position based on keys
  // Clamp to bounds: Math.max(0, Math.min(MAP_W - PLAYER_SIZE, x))
  posRef.current = { x, y };
  setPlayerPos({ x, y }); // one React re-render per rAF tick
  rafRef.current = requestAnimationFrame(loop);
};
rafRef.current = requestAnimationFrame(loop);
```

**Why refs, not state for keys:** `useState` would trigger re-renders on every keydown/keyup (60+ times/second), causing lag.

### Performance Notes

- `requestAnimationFrame` auto-pauses when tab is hidden
- Do NOT use `setInterval` for movement
- WASD + arrow keys both supported; prevent default on arrow keys to stop page scroll

### Mock Players

Store as static array of `{ id, name, x, y, direction }`. Optionally add idle animation (slowly drift position in a small range using `useEffect` + `setInterval` for natural feel).

---

## Part 5: Web Research — Zustand 5 Complex State

### Key v5 Breaking Changes

- **Named imports only** (no default export)
- **`useShallow` required** for multi-field object selectors (prevents infinite loops)
- **ES5 dropped**, React 18+ required
- **`persist` no longer auto-stores initial state**

### Critical: useShallow

```typescript
import { useShallow } from 'zustand/react/shallow';

// WRONG in v5 — may cause infinite loop
const { rank, lp } = useStore(s => ({ rank: s.rank, lp: s.lp }));

// CORRECT in v5
const { rank, lp } = useStore(useShallow(s => ({ rank: s.rank, lp: s.lp })));
```

### Recommended Middleware Order

```
devtools(     ← outermost — sees all mutations
  persist(
    immer(    ← innermost — enables draft mutation in set()
      slices
    )
  )
)
```

### Slice Pattern

```typescript
type SliceCreator<T> = StateCreator<RootStore, Mutators, [], T>;

export const createRankSlice: SliceCreator<RankSlice> = (set) => ({
  rank: 'Iron', division: 4, lp: 0, lpHistory: [],
  gainLP: (amount) => set(draft => {
    draft.lp += amount;
    if (draft.lp >= 100) { /* promote */ }
  }),
});
```

### Persist partialize

Only persist what survives page reload. Exclude functions and derived state:

```typescript
partialize: (state) => ({
  rank: state.rank, division: state.division, lp: state.lp,
  equippedItems: state.equippedItems, ownedItems: state.ownedItems,
})
```

### Note on Current Codebase

The current store does NOT use slices, immer, devtools, or persist middleware. Adding them would require a store refactor. Given the spec does not require persistence, we should NOT introduce these middlewares — instead, extend the existing flat single-store pattern to stay consistent with the codebase.

---

## Part 6: Tailwind CSS 4 Notes

- **CSS-first config**: theme customization via `@theme` in CSS, not `tailwind.config.js`
- **Dynamic values**: arbitrary values like `w-103` work without config
- **Breaking**: many utility names changed from v3

---

## Summary of Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Avatar rendering | CSS absolute positioning with `image-rendering: pixelated` | No external libs, consistent with codebase |
| Avatar assets | SVG pixel art drawn programmatically (colored `<rect>` elements) | No image files needed, pure code |
| Chat layout | Extend existing CommunityScreen with proper 3-pane CSS layout | Less disruptive than rewrite |
| Movement in lobby | `requestAnimationFrame` + refs for keys, CSS absolute for position | Best performance, no Canvas needed |
| Zustand | Extend existing flat store (no slices/immer) | Consistency with codebase |
| Rank system | New fields in `user` object: `lp`, `division`, `rankTier`, `lpHistory` | Minimal store changes |
| Market expansion | Add 30+ items to `mockMarketItems` in mock-data.ts | Simple data extension |
| Testing | TypeScript types only (no test framework) | No testing infra exists |
