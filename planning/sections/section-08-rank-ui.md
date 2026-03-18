Now I have all the context I need. Let me generate the section content.

## section-08-rank-ui

Update three screen components to display the new LoL-style rank system using the `RankBadge` component, and update `AppShell.tsx` to render the `RankUpModal`. This section assumes section-01-store, section-02-constants-mockdata, and section-05-rank-components are complete. The `RankBadge` and `RankUpModal` components already exist; this section wires them into the UI.

---

## Dependencies

This section requires the following sections to be complete before starting:

- **section-01-store**: Provides `user.lp`, `user.rankTier`, `user.rankDivision`, `user.lpHistory`, `showRankUpModal`, `dismissRankUp` action.
- **section-02-constants-mockdata**: Provides `RANK_TIER_COLORS`, `RANK_TIER_EMOJIS`, `RANK_TIERS` from `/src/lib/constants.ts`.
- **section-05-rank-components**: Provides `RankBadge` component at `/src/components/RankBadge.tsx` and `RankUpModal` at `/src/components/RankUpModal.tsx`.

---

## Tests (Verify Before and After Implementation)

No test framework is installed. Verification is TypeScript strict-mode compilation plus manual browser checks.

### TypeScript checks (run `npm run build`)

- `DashboardScreen.tsx` imports `RankBadge` with no type errors; all props (`tier`, `division`, `lp`, `size`) provided with correct types.
- `ProfileScreen.tsx` removes the `getRankFromHours` import (no longer used for rank display); `RANK_THRESHOLDS` import from `constants.ts` is also removed from the rank display area (it can still exist if referenced elsewhere in the file, but the rank hero card must use `RankBadge`).
- `LeaderboardScreen.tsx` removes the `RANK_THRESHOLDS` usage from the "RANK SİSTEMİ" section; replaces it with `RankBadge` per row.
- `AppShell.tsx` imports `RankUpModal` and reads `showRankUpModal: boolean` from the store without errors.
- LP sparkline in `ProfileScreen`: `user.lpHistory` is typed as `number[]`; array `.map()` over it compiles correctly.

### Manual browser verification

**DashboardScreen rank section:**
- A new rank section appears below the XP strip card (directly below the "AKTİF ZAMANLAYICI" card or after the existing stats row — see exact placement below).
- `RankBadge` renders with the correct color for the current tier (e.g., Altın = `#FFD700`).
- LP progress bar shows correct fill: `(lp / 100) * 100` percent.
- At Usta tier, LP bar is either hidden or shows unbounded count (no 100 LP cap indicator).

**ProfileScreen rank hero:**
- The `{rank.emoji} {rank.name.toUpperCase()}` badge in the hero card is replaced with `<RankBadge tier={user.rankTier} division={user.rankDivision} lp={user.lp} size="lg" />`.
- An LP history sparkline appears below the badge in the hero card showing the last 20 LP gain amounts as small colored bars.
- Sparkline bars use the tier color from `RANK_TIER_COLORS`.

**LeaderboardScreen rank list:**
- The "RANK SİSTEMİ" section no longer loops over `RANK_THRESHOLDS` with hours thresholds.
- Each tier row shows a `RankBadge` in `sm` size instead.
- Leaderboard list rows (positions 4+) each have a small `RankBadge` appended after the XP number.

**RankUpModal (via AppShell):**
- Setting `showRankUpModal: true` in the store (e.g., by manually calling `gainLP` with enough minutes in the browser console) causes the full-screen promotion overlay to appear.
- The modal is visible regardless of which tab is active.
- It auto-dismisses after 4 seconds.
- Clicking anywhere on the overlay dismisses it immediately.

---

## Files to Modify

| File | Change Type |
|------|-------------|
| `/src/components/AppShell.tsx` | UPDATE — add `RankUpModal` conditional render |
| `/src/components/screens/DashboardScreen.tsx` | UPDATE — add rank section below XP stats row |
| `/src/components/screens/ProfileScreen.tsx` | UPDATE — replace static rank badge with `RankBadge` + sparkline |
| `/src/components/screens/LeaderboardScreen.tsx` | UPDATE — replace `RANK_THRESHOLDS` loop + add badge per row |

---

## 1. AppShell.tsx — Add RankUpModal

File: `/src/components/AppShell.tsx`

Add the import at the top, read `showRankUpModal` from the store using a narrow selector, and conditionally render `<RankUpModal />` inside the root container but outside the main content div.

The `<RankUpModal />` must be rendered at the root of the `AppShell` return so it overlays all tabs. It is already `position: fixed; z-index: 9999` inside the component, so placement in the JSX tree only needs to ensure it is not inside an `overflow: hidden` container.

```typescript
// New import to add
import { RankUpModal } from './RankUpModal';

// Narrow selector — read only showRankUpModal to avoid full-store re-renders
const showRankUpModal = useStore(s => s.showRankUpModal);

// Conditional render inside the return, sibling to the inner content div:
{showRankUpModal && <RankUpModal />}
```

The `activeTab` selector already exists in this component; replace the current `const { activeTab } = useStore();` call with two separate narrow selectors, or simply add `showRankUpModal` to the same destructuring. Given that `AppShell` only re-renders when `activeTab` or `showRankUpModal` changes, a single combined selector is fine here:

```typescript
const { activeTab, showRankUpModal } = useStore(s => ({
  activeTab: s.activeTab,
  showRankUpModal: s.showRankUpModal,
}));
```

---

## 2. DashboardScreen.tsx — Add Rank Section

File: `/src/components/screens/DashboardScreen.tsx`

### Import change

Add the `RankBadge` import:

```typescript
import { RankBadge } from '@/components/RankBadge';
```

### Selector change

Add `lp`, `rankTier`, `rankDivision` to the store selector. The current selector destructures `user` as a whole object — this is fine since `DashboardScreen` already reads many user fields. Keep the existing pattern:

```typescript
// Already in the selector:
user: s.user,
// user.lp, user.rankTier, user.rankDivision are available once section-01 is done
```

### New rank section JSX

Insert a new card immediately after the 3-column stats grid (the `{/* 3-column stats */}` block) and before the task list:

```tsx
{/* Rank Section */}
<div className="card" style={{ border: '1px solid rgba(123,92,245,.15)', padding: 12 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontFamily: 'Orbitron', fontSize: 9, fontWeight: 700, color: 'var(--purple)', letterSpacing: 2, textTransform: 'uppercase' }}>
      RANK
    </span>
    <span style={{ fontFamily: 'Space Mono', fontSize: 9, color: 'var(--muted)' }}>
      {user.rankTier !== 'Usta' ? `${user.lp} LP / 100 LP` : `${user.lp} LP`}
    </span>
  </div>
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <RankBadge tier={user.rankTier} division={user.rankDivision} lp={user.lp} size="md" />
    <div style={{ flex: 1 }}>
      {/* LP progress bar — hidden at Usta since LP accumulates without cap */}
      {user.rankTier !== 'Usta' && (
        <div className="progress-track" style={{ height: 5, borderRadius: 3 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, user.lp)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--purple), var(--cyan))',
              borderRadius: 3,
              transition: 'width .4s ease',
            }}
          />
        </div>
      )}
      {user.rankTier === 'Usta' && (
        <div style={{ fontFamily: 'Space Mono', fontSize: 8, color: 'var(--muted)' }}>
          Maksimum rank — LP birikim devam ediyor
        </div>
      )}
    </div>
  </div>
</div>
```

---

## 3. ProfileScreen.tsx — Replace Static Rank with RankBadge + Sparkline

File: `/src/components/screens/ProfileScreen.tsx`

### Import changes

```typescript
// ADD:
import { RankBadge } from '@/components/RankBadge';
import { RANK_TIER_COLORS } from '@/lib/constants';

// REMOVE or stop using for rank display (the import can stay if used elsewhere, 
// but the rank display below no longer calls it):
// import { getRankFromHours } from '@/lib/utils';   — only remove if unused elsewhere
// import { RANK_THRESHOLDS } from '@/lib/constants'; — only remove if unused elsewhere
```

Check if `getRankFromHours` and `RANK_THRESHOLDS` are used anywhere else in the file. The current code on line 23 is `const rank = getRankFromHours(user.totalHours);`. After this change, `rank.emoji` and `rank.name` are no longer needed in the hero section. If they are not used anywhere else in the file, remove the import and the `rank` const declaration entirely to keep the build clean.

### Selector change

The current component uses `const { user, profileTab, setProfileTab, setActiveTab, showToast } = useStore();` — a broad selector subscribing to the whole store. This is acceptable since `ProfileScreen` is not performance-critical. No selector change is strictly needed; `user.rankTier`, `user.rankDivision`, `user.lp`, and `user.lpHistory` are already available via `user`.

### Hero card — replace rank badge

Currently the hero card contains:
```tsx
<Badge variant="purple" className="" pulse={false}>
  {rank.emoji} {rank.name.toUpperCase()}
</Badge>
```

Replace this with `RankBadge` (lg size). Keep the streak and level badges:

```tsx
<div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
  <RankBadge tier={user.rankTier} division={user.rankDivision} lp={user.lp} size="lg" />
  <Badge variant="amber">🔥 {user.streak} GÜN SERİ</Badge>
  <Badge variant="cyan">LV.{user.level}</Badge>
</div>
```

### LP history sparkline

Add a sparkline immediately below the badges row, still inside the hero card, before the stats row divider. The sparkline shows the last 20 LP gain amounts as small vertical bars:

```tsx
{user.lpHistory.length > 0 && (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, height: 24, marginBottom: 10 }}>
    {user.lpHistory.map((gain, i) => {
      const maxGain = Math.max(...user.lpHistory, 1);
      const barH = Math.max(3, Math.round((gain / maxGain) * 20));
      return (
        <div
          key={i}
          style={{
            width: 6,
            height: barH,
            borderRadius: 2,
            background: RANK_TIER_COLORS[user.rankTier] || 'var(--purple)',
            opacity: 0.6 + 0.4 * (i / Math.max(1, user.lpHistory.length - 1)),
          }}
        />
      );
    })}
  </div>
)}
```

This renders nothing when `lpHistory` is empty (initial state). Each bar scales in height relative to the largest gain in the history. Opacity increases left-to-right so the most recent gains are brightest.

---

## 4. LeaderboardScreen.tsx — Replace RANK_THRESHOLDS Section + Add Row Badges

File: `/src/components/screens/LeaderboardScreen.tsx`

### Import changes

```typescript
// ADD:
import { RankBadge } from '@/components/RankBadge';
import { RANK_TIERS, RANK_TIER_COLORS, RANK_TIER_EMOJIS } from '@/lib/constants';

// REMOVE (no longer used after replacing the rank system section):
// import { RANK_THRESHOLDS } from '@/lib/constants';
```

### Replace the "RANK SİSTEMİ" section

The current implementation (lines 138–164) loops over `RANK_THRESHOLDS` showing hours ranges. Replace it with a loop over `RANK_TIERS` showing tier badges:

```tsx
{/* Rank System */}
<div>
  <SectionLabel>RANK SİSTEMİ</SectionLabel>
  <div className="card">
    {RANK_TIERS.map((tier, i) => {
      const isCurrentTier = tier === user.rankTier;
      return (
        <div
          key={tier}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 0',
            borderBottom: i < RANK_TIERS.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none',
            background: isCurrentTier ? `${RANK_TIER_COLORS[tier]}0D` : 'transparent',
            borderRadius: isCurrentTier ? 6 : 0,
            paddingLeft: isCurrentTier ? 6 : 0,
            paddingRight: isCurrentTier ? 6 : 0,
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{RANK_TIER_EMOJIS[tier]}</span>
          <div style={{ flex: 1 }}>
            <RankBadge
              tier={tier}
              division={isCurrentTier ? user.rankDivision : 4}
              lp={isCurrentTier ? user.lp : 0}
              size="sm"
            />
          </div>
          {isCurrentTier && <Badge variant="purple">MEVCUT</Badge>}
        </div>
      );
    })}
  </div>
</div>
```

Note: For non-current tiers, `division={4}` and `lp={0}` are used as placeholder values. The `RankBadge` component renders tier color and name in all cases — the LP bar for non-current tiers is less relevant in this context. If `RankBadge` always shows an LP bar for non-current tiers, this still renders correctly (it just shows an empty bar at 0%).

### Add RankBadge to leaderboard list rows

The current list rows (positions 4 and below) end with the trend indicator. Add a `RankBadge` (sm) between the XP value and the trend indicator. Since leaderboard mock data (`mockLeaderboard`) does not include `rankTier`/`rankDivision` fields, use mock values derived from rank position or a static assignment.

Two valid approaches:

**Option A — derive tier from XP position (simpler):**
Assign tiers based on `entry.rank` (rank 1-2 = Elmas, 3-4 = Platin, 5-8 = Altın, 9-15 = Gümüş, rest = Bronz). Define a small helper:

```typescript
function mockTierForRank(rank: number): string {
  if (rank <= 2) return 'Elmas';
  if (rank <= 4) return 'Platin';
  if (rank <= 8) return 'Altın';
  if (rank <= 15) return 'Gümüş';
  return 'Bronz';
}
```

**Option B — for `isMe` entry, use actual store data; for others use static values:**
For `entry.isMe`, read `user.rankTier` and `user.rankDivision` from the store. For all others, use the mock tier from Option A.

Option B is preferred as it keeps the current user's real rank visible in the leaderboard.

Updated row render for positions 4+:

```tsx
<div key={entry.rank} className="card" style={{ ... }}>
  {/* existing: rank number, avatar, name/level line */}
  <span style={{ fontFamily: 'Space Mono', fontSize: 11, color: entry.isMe ? '#7B5CF5' : '#22D3EE', flexShrink: 0 }}>
    {entry.xp.toLocaleString()}
  </span>
  {/* NEW: small rank badge */}
  <div style={{ flexShrink: 0 }}>
    <RankBadge
      tier={entry.isMe ? user.rankTier : mockTierForRank(entry.rank)}
      division={entry.isMe ? user.rankDivision : 4}
      lp={entry.isMe ? user.lp : 0}
      size="sm"
    />
  </div>
  {/* existing: trend indicator */}
  <span style={{ ... }}>{...}</span>
</div>
```

The `user` object must be available in scope. The current `LeaderboardScreen` already reads `const { user } = useStore();` at the top — no additional selector needed.

---

## Styling Notes

- All new elements must use existing CSS custom properties: `var(--purple)`, `var(--cyan)`, `var(--s1)`, `var(--s2)`, `var(--dim)`, `var(--muted)`, `var(--text)`.
- Font families: Orbitron for labels/headings, Space Mono for numbers/stats, Rajdhani for body text.
- The LP progress bar in `DashboardScreen` reuses `.progress-track` and `.progress-fill` classes from `globals.css` (already used elsewhere in the codebase).
- No external libraries; no new CSS classes beyond those already in `globals.css`.

---

## Summary of Changes

| Location | What Changes |
|----------|-------------|
| `AppShell.tsx` | Import `RankUpModal`; read `showRankUpModal` from store; render `{showRankUpModal && <RankUpModal />}` |
| `DashboardScreen.tsx` | Import `RankBadge`; add rank card with `RankBadge` (md) + LP progress bar after stats grid |
| `ProfileScreen.tsx` | Import `RankBadge` + `RANK_TIER_COLORS`; replace `{rank.emoji} {rank.name}` badge with `<RankBadge size="lg" />`; add LP sparkline from `user.lpHistory`; remove unused `getRankFromHours` usage |
| `LeaderboardScreen.tsx` | Import `RankBadge` + `RANK_TIERS` + tier color/emoji maps; replace `RANK_THRESHOLDS` loop with `RANK_TIERS` loop using `RankBadge`; add `RankBadge` (sm) to each list row |