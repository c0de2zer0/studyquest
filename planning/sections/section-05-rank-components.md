Now I have all the context I need. Let me write the section content for `section-05-rank-components`.

---

# Section 05: Rank Components

## Overview

This section creates two new display components (`RankBadge` and `RankUpModal`) and updates `AppShell.tsx` to conditionally render the modal. These components depend on rank state fields and constants that are established in prior sections (section-01-store and section-02-constants-mockdata).

**Dependencies (must be complete before this section):**
- `section-01-store`: Provides `lp`, `rankTier`, `rankDivision`, `showRankUpModal`, `rankUpInfo`, and `dismissRankUp()` action on the Zustand store.
- `section-02-constants-mockdata`: Provides `RANK_TIERS`, `RANK_TIER_COLORS`, `RANK_TIER_EMOJIS` from `/src/lib/constants.ts` and initial `mockUser` rank fields in `/src/lib/mock-data.ts`.

**This section blocks:**
- `section-08-rank-ui`: Uses `RankBadge` in Dashboard, Profile, and Leaderboard screens.

---

## Tests (Verification Stubs)

No test framework is installed. TypeScript strict mode (`"strict": true`) is the primary correctness check. The following checks must pass before this section is considered complete.

### RankBadge — TypeScript Checks

- Props interface is fully typed with no optional props that have an `unknown` fallback.
- `size` prop is the literal union `'sm' | 'md' | 'lg'` (not just `string`).
- Division is converted to Roman numerals via a pure function or inline map: `4 → "IV"`, `3 → "III"`, `2 → "II"`, `1 → "I"`, `0 → ""` (used for Usta tier which has no division).
- No `any` types introduced.

### RankBadge — Manual Browser Verification

- `RankBadge` renders correctly for all 7 tiers (`Demir`, `Bronz`, `Gümüş`, `Altın`, `Platin`, `Elmas`, `Usta`) with the correct color from `RANK_TIER_COLORS`.
- The LP progress bar fill percentage correctly reflects `lp / 100`.
- At Usta tier (`division === 0`), the LP progress bar is hidden or shows an unbounded display (no 100 LP cap shown).
- The `size` prop visually changes the badge scale: `sm` is smallest (used in Leaderboard rows), `lg` is largest (used in Profile).

### RankUpModal — TypeScript Checks

- `useEffect` cleanup function returns `() => clearTimeout(timer)` — verified by TypeScript if the timeout id is typed as `ReturnType<typeof setTimeout>`.
- No `any` types introduced.

### RankUpModal — Manual Browser Verification

- Modal appears when `showRankUpModal: true` is set in the store.
- Clicking anywhere on the modal calls `dismissRankUp()` and the modal disappears.
- Forcibly unmounting the component before 4 seconds (e.g., by switching tabs before the timer fires) must produce no console errors (confirms `clearTimeout` cleanup works).
- Auto-dismisses after 4 seconds without user interaction.
- Confetti `.confetti-dot` elements animate using the existing `confetti-fall` CSS keyframe.

### AppShell — TypeScript Checks

- `showRankUpModal` is read from the store with a narrow selector: `useStore(state => state.user.showRankUpModal)`.
- `<RankUpModal />` has no required props (it reads store state internally).

---

## Implementation

### File: `/src/components/RankBadge.tsx` (NEW)

A compact display component for the player's current rank tier, division, and LP. Used in three contexts:

| Usage Context | `size` Prop | Notes |
|---|---|---|
| DashboardScreen rank section | `'md'` | Below XP strip |
| ProfileScreen rank display | `'lg'` | Main rank display area |
| LeaderboardScreen row | `'sm'` | Appended after existing stats |

**Props interface:**

```typescript
interface RankBadgeProps {
  tier: string;       // e.g. 'Altın', 'Elmas', 'Usta'
  division: number;   // 1–4 (I–IV); 0 for Usta (no division)
  lp: number;         // current LP value
  size: 'sm' | 'md' | 'lg';
}
```

**Implementation notes:**

- Import `RANK_TIER_COLORS` and `RANK_TIER_EMOJIS` from `@/lib/constants`.
- The color for the tier is `RANK_TIER_COLORS[tier]`. Use this as a CSS color on the tier name label and as the LP bar fill color (instead of the default purple gradient).
- Division label: convert the `division` number to a Roman numeral string. Division `0` maps to an empty string (Usta has no divisions).
- The Roman numeral conversion can be done with a lookup object: `{ 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 0: '' }`.
- LP progress bar: `width: ${Math.min(lp / 100, 1) * 100}%`. At Usta tier, either hide the bar entirely or show it without the "/ 100 LP" cap label.
- Size variants control the container dimensions. Recommended pixel scales:
  - `sm`: tier name 9px font, badge ~80px wide, no LP bar (just tier + division text).
  - `md`: tier name 13px font, includes LP bar with label.
  - `lg`: tier name 16px font, includes LP bar + numeric LP display.
- Use `var(--s2)` as background, `var(--text)` for text, and inline `style` attributes to apply the tier color dynamically (since Tailwind cannot handle dynamic color values at runtime).
- Use the `badge` CSS class from `globals.css` for the division pill if appropriate.

**Stub signature:**

```typescript
export function RankBadge({ tier, division, lp, size }: RankBadgeProps): JSX.Element {
  // Converts division number to Roman numeral string
  // Looks up tier color from RANK_TIER_COLORS
  // Renders: tier emoji + tier name + division pill + LP bar (md/lg only)
}
```

---

### File: `/src/components/RankUpModal.tsx` (NEW)

A full-screen overlay modal that appears when the player promotes to a new rank. It is a celebration screen.

**No props** — reads from the Zustand store directly.

**Store reads (use narrow selectors):**

```typescript
const rankUpInfo = useStore(state => state.user.rankUpInfo);
const dismissRankUp = useStore(state => state.dismissRankUp);
```

**Layout:**
- Outer container: `position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center`.
- Semi-transparent dark backdrop: `background: rgba(0, 0, 0, 0.85)`. Clicking the backdrop calls `dismissRankUp()`.
- Inner card: centered, `background: var(--s2)`, `border: 1px solid rgba(123, 92, 245, 0.4)`, `border-radius: 16px`, `padding: 40px`, `text-align: center`.
- Heading: "RANK UP!" in Orbitron font, large size, using `gradient-text` CSS class from `globals.css`.
- Subtext: display the new tier and division (e.g., "Altın III"). Use `RankBadge` in `'lg'` size.
- Confetti: render 10–15 `.confetti-dot` `<div>` elements absolutely positioned at random x positions across the top of the modal. Each dot has a random background color from the cyberpunk palette. The existing `confetti-fall` CSS keyframe handles the animation.

**Auto-dismiss logic (critical — must use cleanup):**

```typescript
useEffect(() => {
  const timer = setTimeout(() => dismissRankUp(), 4000);
  return () => clearTimeout(timer);  // prevents state update on unmounted component
}, []);
```

The dependency array is intentionally empty `[]` — the timer is set once on mount. `dismissRankUp` is a stable Zustand action reference and does not need to be in the deps array (it never changes).

**Confetti implementation note:** The `.confetti-dot` elements need varying animation delays to look natural. Apply `animationDelay: \`${Math.random() * 0.4}s\`` inline. Since this is rendered once and the positions are random, using `useMemo` or a constant array defined outside the component avoids re-generating positions on every render:

```typescript
// Defined outside the component function so it is stable:
const CONFETTI_DOTS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i / 12) * 100}%`,
  background: ['#7B5CF5', '#22D3EE', '#FFD700', '#EC4899', '#10B981'][i % 5],
  animationDelay: `${(i * 0.05).toFixed(2)}s`,
}));
```

**Stub signature:**

```typescript
export function RankUpModal(): JSX.Element | null {
  // Reads rankUpInfo and dismissRankUp from store
  // Returns null if rankUpInfo is null (safety guard)
  // Sets up 4s auto-dismiss useEffect with cleanup
  // Renders: fixed overlay + card + "RANK UP!" heading + RankBadge (lg) + confetti dots
}
```

If `rankUpInfo` is `null` (edge case), the component returns `null`. The parent (`AppShell`) already gates rendering on `showRankUpModal`, but this guard prevents a TypeScript null-access error.

---

### File: `/src/components/AppShell.tsx` (UPDATE)

Add `RankUpModal` to `AppShell` so it can appear regardless of which tab is active.

**Changes:**

1. Import `RankUpModal` from `'@/components/RankUpModal'`.
2. Read `showRankUpModal` from the store with a narrow selector:
   ```typescript
   const showRankUpModal = useStore(state => state.user.showRankUpModal);
   ```
3. Conditionally render `<RankUpModal />` inside the return JSX, after `<ToastContainer />`:
   ```typescript
   {showRankUpModal && <RankUpModal />}
   ```

**Important:** `LobbyRoom` is NOT rendered here. It is scoped to `CommunityScreen` (see section-09-community). Only `RankUpModal` is added to `AppShell`.

**The updated return JSX structure:**

```tsx
return (
  <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
    <AmbientBackground />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <AppHeader />
      <XPStrip />
      <TabBar />
      <main style={{ padding: '12px 12px 80px' }}>
        {screenMap[activeTab]}
      </main>
    </div>
    <ToastContainer />
    {showRankUpModal && <RankUpModal />}
  </div>
);
```

Note that `RankUpModal` uses `z-index: 9999` which places it above the `body::after` scanline overlay also at `z-index: 9999` in globals.css. Both can coexist since the scanline overlay uses `pointer-events: none`.

---

## Styling Conventions

All new components must follow the project's established CSS patterns:

- **Fonts:** Orbitron (`font-family: 'Orbitron', sans-serif`) for headings/labels, Space Mono for numeric values like LP, Rajdhani for body text.
- **Colors:** Use CSS custom properties (`var(--bg)`, `var(--s1)`, `var(--s2)`, `var(--purple)`, `var(--cyan)`, `var(--text)`, `var(--muted)`) for all standard colors. Tier-specific colors come from `RANK_TIER_COLORS` and must be applied via inline `style` attributes.
- **Reuse globals.css classes:** `.badge`, `.badge-gold`, `.badge-purple`, `.badge-cyan` for pills; `.progress-track` + `.progress-fill` for LP bars; `.section-label` for section headings; `.card` for containers; `.gradient-text` for the "RANK UP!" heading.
- **No hardcoded colors** outside of `RANK_TIER_COLORS` values.

## TypeScript Notes

- All new types (e.g., `RankBadgeProps`) are defined in the component file itself. They are only used by that component and do not need to be exported or placed in a shared types file.
- The `RANK_TIER_COLORS` type is `Record<string, string>` — indexing with `tier: string` is safe with no TypeScript error.
- `rankUpInfo` from the store is typed as `{ newTier: string; newDivision: number } | null`. Access the fields only after a null-check (or the `return null` guard in `RankUpModal`).