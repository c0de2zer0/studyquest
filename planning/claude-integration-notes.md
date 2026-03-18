# Integration Notes — Opus Review Feedback

## Integrating (All Critical/Major/Meaningful Issues)

### 1. [Critical] `equipItem` must explicitly update `user.equippedItems`
**Integrating.** The plan incorrectly assumed `equipItem` already syncs `user.equippedItems`. The plan now explicitly states that `equipItem` must be updated to: (a) set `user.equippedItems[item.category] = item.id` when equipping, and (b) clear `user.equippedItems[item.category] = null` when unequipping. Without this, PixelAvatar would never reflect changes.

### 2. [Critical] Dual rank system conflict with `RANK_THRESHOLDS`
**Integrating.** The plan now explicitly deprecates `RANK_THRESHOLDS` and adds a task to audit/replace all UI referencing `user.rank`, `user.rankEmoji`, and `RANK_THRESHOLDS`. The new LoL-style system fully replaces the old hours-based one.

### 3. [Major] `gainLP` integration points — named exact functions
**Integrating.** Replace the vague "completeSession" reference with explicit calls in:
- `tickTimer` (natural session completion)
- `stopTimer` (manual stop during work phase)
- `completeRando` (Rando session completion — new addition)

### 4. [Major] Costume category equip/unequip logic
**Integrating.** Add explicit logic: equipping a costume sets `hat`, `top`, `bottom`, and `shoes` slots simultaneously. Unequipping a costume clears all 4. Equipping a single hat while a costume is active unequips the costume and sets only the hat slot.

### 5. [Major] `Message` interface needs `channel` field
**Integrating.** Add `channel: string` to the `Message` interface. `sendMessage` reads `activeChannel` from state and attaches it. `mockChatMessages` will be updated to include channel ids matching `mockChannels` id values.

### 6. [Major] Store selectors — memoization strategy
**Integrating (as advisory).** Add guidance that new components should use `useStore(state => state.specificField)` shallow selection pattern. Specifically, LobbyRoom's rAF loop components should use React.memo.

### 7. [Performance] LobbyRoom rAF + React state
**Integrating.** Add explicit call-out:
- `React.memo` on mock player components and PixelAvatar to prevent unnecessary re-renders
- Mock player idle movement via `setInterval` should also be ref-driven, not state-driven
- CSS `transform: translate(x, y)` via ref for player position is noted as a preferred alternative if performance issues arise

### 8. [Edge Case] LP overflow on multiple promotions
**Integrating.** `gainLP` must use a `while (lp >= 100 && tier !== 'Usta')` loop. The `rankUpInfo` stores the final rank reached; only one RankUpModal fires showing the ultimate promotion result.

### 9. [Missing] `mockUser` initial values for new fields
**Integrating.** The plan now explicitly lists the initial values to add to `mockUser` in mock-data.ts.

### 10. [Missing] Mobile responsiveness for LobbyRoom
**Integrating (lightweight).** Add note: the 800×600 room uses CSS `transform: scale()` to fit within the viewport on screens narrower than 800px. Virtual joystick is out of scope for now but the scaling should prevent overflow.

### 11. [Missing] Category name mismatch — "ders"/"genel" vs "lessons"/"general"
**Integrating.** The plan now explicitly aligns with existing mock data: use `"lessons"` and `"general"` as category values, matching what's already in `mockChannels`. The display labels in Turkish remain "Ders Kanalları" and "Genel".

### 12. [Missing] `hair` slot missing from `equippedItems`
**Integrating.** Add `hair: string | null` to the `equippedItems` type. This resolves the inconsistency between `AvatarSlot` type and the actual equipped items object.

### 13. [Minor] RankUpModal setTimeout cleanup
**Integrating.** Plan explicitly notes that the `useEffect` for auto-dismiss must return a cleanup function that calls `clearTimeout`.

### 14. [Minor] Market pricing inconsistency
**Integrating.** Pricing will match existing item conventions: Common: 15–50 sa, Rare: 50–150 sa, Epic: 150–400 sa, Legendary: 500–1000 sa. Existing items stay at their current prices (no rebalance needed since new items align).

### 15. [Ambiguous] LobbyRoom placement: CommunityScreen vs AppShell
**Integrating.** Resolving the contradiction: LobbyRoom renders as a `position: fixed` full-screen overlay inside `CommunityScreen.tsx`. AppShell renders only the `RankUpModal`. The file structure list in Section 6 will be corrected.

## Not Integrating

### Store slicing / restructuring
**Not integrating.** The plan explicitly follows the existing flat store pattern per project conventions. While the store is growing, restructuring would diverge from the codebase pattern and introduce risks. This is acknowledged as a tradeoff in the plan.

### Virtual joystick for mobile lobby
**Not integrating.** Out of scope per the spec. CSS scaling handles overflow; touch controls can be added in a future iteration.

### Queuing multiple RankUp modals
**Not integrating.** When multiple promotions happen, showing the final rank reached is sufficient UX. Queuing modals adds unnecessary complexity.
