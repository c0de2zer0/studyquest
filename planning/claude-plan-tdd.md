# StudyQuest — TDD Plan

**Context:** No testing framework is installed. TypeScript strict mode (`"strict": true`) is the primary correctness check. This TDD plan defines verification stubs that can be done with TypeScript type checking + manual browser verification, with optional vitest for the most complex pure-logic functions.

**Recommended (optional) test setup:** Add `vitest` for the pure store logic (rank calculations, LP promotions). These functions have no DOM/React dependencies and are trivially testable.

```bash
npm install -D vitest
# Add to package.json scripts: "test": "vitest run"
```

Pure logic functions that benefit from unit tests: `gainLP`, `equipItem` (costume branch), channel filtering.

---

## Section 1: Rank System (LoL-Style)

### Before implementing `gainLP` action:

**TypeScript checks:**
- Type: `gainLP(minutesStudied: number): void` compiles with no `any`
- Type: `rankUpInfo` is `{ newTier: string; newDivision: number } | null` (not optional field)
- Type: `lpHistory` is `number[]` with max 20 elements (document in comment, not enforced by TS)

**Logic stubs (vitest or manual browser console):**
- Test: `gainLP(5)` with `{lp: 90, rankTier: 'Bronz', rankDivision: 2}` → `{lp: 0, rankTier: 'Bronz', rankDivision: 1, showRankUpModal: true}`
- Test: `gainLP(15)` with `{lp: 90, rankTier: 'Bronz', rankDivision: 1}` → promotes to Gümüş IV, `lp: 20`, `showRankUpModal: true`
- Test: Multiple promotions in one call (e.g., `gainLP(200)` from Demir III) → correct final rank via while loop, no LP loss
- Test: `gainLP(0)` → no state change, `showRankUpModal` stays false
- Test: `gainLP(60)` at Usta tier → `lp` accumulates beyond 100, no tier change
- Test: `lpHistory` length is capped at 20 (oldest entry removed when adding 21st)

**Before implementing `dismissRankUp`:**
- Test: `dismissRankUp()` → `showRankUpModal: false, rankUpInfo: null`

### Before implementing RankBadge component:

**TypeScript checks:**
- Props interface fully typed, no optional props with unknown fallback
- Division displayed as Roman numerals: 4→"IV", 3→"III", 2→"II", 1→"I", 0→"" (Usta)

**Manual verification:**
- RankBadge renders correctly for all 7 tiers with correct color from RANK_TIER_COLORS
- LP progress bar shows correct fill percentage (lp / 100)
- At Usta tier, LP bar is hidden or shows unbounded display

### Before implementing RankUpModal:

**Manual verification:**
- Modal shows on `showRankUpModal: true` in store
- setTimeout cleanup: forcibly unmount component before 4s and confirm no console errors
- Clicking anywhere dismisses and calls `dismissRankUp`

### Before integrating `gainLP` into timer actions:

**Manual verification:**
- Complete a timed study session (via DashboardScreen or TimerScreen) → LP increases in store
- Manually stop a timer mid-session → LP increases proportionally
- Complete a Rando session → LP increases

---

## Section 2: Pixel Art Avatar System

### Before implementing avatar-layers.ts:

**TypeScript checks:**
- `PixelRect` interface: all fields are `number` except `color: string`
- `AvatarLayerDef.slot` is `AvatarSlot` type (not `string`)
- `AVATAR_LAYER_MAP` keys are strings; verify at least 5 item ids are present before rendering

### Before implementing PixelAvatar component:

**TypeScript checks:**
- Props interface: `equippedItems` must match `StoreState['user']['equippedItems']` exactly
- `size` prop is `'preview' | 'lobby'` (literal union, not string)
- Component is wrapped in `React.memo`

**Manual verification:**
- Base character (no items equipped) renders as valid SVG with visible body/head pixels
- Equipping a hat: hat layer appears above head layer in z-order
- Equipping bottom: bottom layer appears below top layer
- `imageRendering: 'pixelated'` applied to SVG prevents blurring at small sizes
- In `lobby` size (48px), avatar is noticeably smaller than `preview` size (96px)

### Before updating `equipItem` in store:

**TypeScript checks:**
- `equipItem` signature unchanged from external callers
- No `any` casts added

**Logic stubs:**
- Test: `equipItem(hatItem)` → `user.equippedItems.hat === hatItem.id`
- Test: `equipItem(hatItem)` called twice (toggle) → `user.equippedItems.hat === null`
- Test: `equipItem(costumeItem)` → all 4 slots (hat, top, bottom, shoes) set
- Test: `equipItem(hatItem)` while costume is equipped → costume cleared, only hat slot set
- Test: `equipItem(bottomItem)` → `user.equippedItems.bottom === bottomItem.id`
- Test: `equipItem(hairItem)` → `user.equippedItems.hair === hairItem.id`

### Before updating AvatarScreen:

**Manual verification:**
- AvatarScreen renders PixelAvatar (not emoji) for base character
- Tapping "GİY" on a wardrobe item → PixelAvatar updates immediately (no page reload needed)
- Tapping "GİY" again on same item (unequip) → item layer disappears from PixelAvatar

---

## Section 3: Market Expansion

### Before adding new items to mock-data.ts:

**TypeScript checks:**
- Each new MarketItem has all required fields: `id`, `name`, `category`, `rarity`, `price`, `emoji`, `description`
- No duplicate `id` values in mockMarketItems array
- All ids referenced in `AVATAR_LAYER_MAP` match an existing mockMarketItems entry

**Manual verification:**
- New items appear in MarketScreen under correct category filter
- Rarity badge color matches (Common, Rare, Epic, Legendary)
- Prices match conventions: Common ≤ 50sa, Legendary ≤ 1000sa

### Before implementing MarketItem pixel preview:

**Manual verification:**
- Item card shows small SVG preview for equippable categories (hat, top, bottom, shoes, hair, accessory)
- Background items show color swatch (not a character-shaped SVG)
- Pixel preview aligns visually with item emoji without overlapping

---

## Section 4: Community Page Rewrite

### Before adding `channel` field to Message interface:

**TypeScript checks:**
- `Message.channel: string` added (not optional — all messages must have a channel)
- `mockChatMessages` type-checks with the new field (every message has `channel` set)
- `sendMessage` action: verify `get().activeChannel` is the correct Zustand pattern for reading state inside an action

**Logic stubs:**
- Test: `sendMessage("hello")` when `activeChannel === 'genel-sohbet'` → new message has `channel: 'genel-sohbet'`
- Test: Switching channels (setActiveChannel) → filtered message list shows only messages for that channel

### Before implementing CommunityScreen three-panel layout:

**Manual verification (desktop):**
- All three panels visible simultaneously at 1200px viewport width
- Left sidebar scrolls independently (overflow-y: auto) when channels list is long
- Right sidebar scrolls independently
- Channel switching: clicking a channel updates `activeChannel` in store and re-filters messages

**Manual verification (mobile, ~375px):**
- Three-tab layout appears at < 700px viewport
- Each tab shows correct panel (Kanallar / Sohbet / Üyeler)
- No horizontal overflow

### Before implementing reactions:

**TypeScript checks:**
- `addReaction(msgId: string, emoji: string)` signature unchanged
- `Reaction` type has `emoji: string`, `count: number`, `reacted: boolean`

**Manual verification:**
- Hovering a message shows reaction bar
- Clicking emoji adds reaction pill (count = 1, `reacted: true`)
- Clicking same emoji again removes reaction (count = 0, pill hidden)
- Clicking emoji already added by another user → increments count, marks `reacted: true`

### Before implementing voice room "Katıl" button:

**TypeScript checks:**
- `openLobby: (roomId: string) => void` compiles
- `activeLobbyRoom: string | null` initializes as `null` in mockStore

**Manual verification:**
- Clicking "Katıl" sets `activeLobbyRoom` to room id in store
- LobbyRoom overlay appears (see Section 5 tests)

---

## Section 5: Avatar Lobby

### Before implementing player movement:

**TypeScript checks:**
- `keysRef` is `React.MutableRefObject<Set<string>>` (not `useState`)
- `posRef` is `React.MutableRefObject<{x: number; y: number}>` (not `useState`)
- `setPlayerPos` only called inside rAF callback (not in event handlers)

**Manual verification (movement logic):**
- WASD keys move the player in correct directions
- Arrow keys also move the player (both bindings work)
- Player cannot move outside room bounds (clamping works)
- Arrow keys do not scroll the page (preventDefault called)
- Walk animation plays while keys held; stops (frameIndex=0) when keys released

### Before implementing mock players:

**TypeScript checks:**
- `MockLobbyPlayer` interface fully typed
- `React.memo` wrapping verified on mock player components

**Manual verification:**
- 5 mock players visible at distinct positions
- Mock players do NOT trigger React re-renders on every rAF tick (check React DevTools Profiler: only the user player div should highlight on frame updates)
- Mock player idle movement: positions change slightly every 2-3s without affecting user movement smoothness

### Before testing mobile scaling:

**Manual verification:**
- Resize browser to 375px width → lobby room scales down (no horizontal scrollbar)
- Scale factor calculated correctly: `min(1, viewport / 800)`
- Exit button remains accessible after scaling

### Before implementing exit button:

**Manual verification:**
- "Lobiden Çık" button calls `closeLobby()` → `activeLobbyRoom: null`
- LobbyRoom overlay unmounts
- CommunityScreen returns to normal view
- rAF loop is cancelled in useEffect cleanup (no memory leak)
- keydown listener is removed in useEffect cleanup

---

## Section 6: Cross-Cutting TypeScript Checks

**Before any section is merged:**
- `npm run build` passes with zero TypeScript errors
- No `any` types introduced (verify with `grep -r "any" src/` — document intentional `any` uses)
- `npm run lint` passes

**Store integrity checks:**
- `StoreState` interface includes all new fields with correct types
- All new actions compile with correct parameter and return types
- `get()` calls within actions follow existing Zustand patterns
