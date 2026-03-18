Now I have all the context I need. Let me generate the section content.

# section-07-avatar-screen

## Overview

This section updates `/src/components/screens/AvatarScreen.tsx` to replace the large emoji display with the pixel art `PixelAvatar` component, and ensures the wardrobe category filters cover the new item slots introduced in prior sections.

**Dependencies (must be completed before this section):**

- **section-01-store**: `user.equippedItems` extended with `bottom`, `shoes`, `hair` slots; `equipItem` action updated to sync `user.equippedItems`; `unequipItem` action updated similarly
- **section-02-constants-mockdata**: `mockUser` has new fields; market items have new categories
- **section-03-avatar-layers**: `AVATAR_LAYER_MAP` and base layer definitions exported from `/src/lib/avatar-layers.ts`
- **section-04-pixel-avatar**: `PixelAvatar` component exists at `/src/components/PixelAvatar.tsx`

Do not duplicate content from those sections here. This section only concerns the changes to `AvatarScreen.tsx` itself.

---

## Tests First

No dedicated test framework is present. Verification is via TypeScript compilation (`npm run build`) and manual browser inspection.

### TypeScript Checks (pre-implementation)

Before making changes:

- Confirm `PixelAvatar` exists and exports a default or named export that accepts `equippedItems`, `size`, `direction` props
- Confirm `user.equippedItems` in the store now includes `bottom`, `shoes`, and `hair` (all `string | null`) — if `npm run build` fails after this section, it is likely because the store type was not extended in section-01

After implementing changes:

- `npm run build` must pass with zero TypeScript errors
- No `any` casts may be introduced in `AvatarScreen.tsx`
- The `ITEM_CATEGORIES` and `CAT_KEYS` arrays must remain in sync (same length, same index ordering)

### Manual Browser Verification

**Avatar display:**
- AvatarScreen renders the `PixelAvatar` SVG component where the large emoji (`{user.emoji}` with `fontSize: 72`) was previously shown
- The pixel avatar displays the base character (body + head) even when no items are equipped
- The pixel avatar is rendered at `size="preview"` (96px wide) and `direction="down"`
- The glow orb below the avatar should still appear (keep the existing glow `<div>` beneath the avatar element)

**Wardrobe equip cycle:**
- The wardrobe now includes filter tabs for the new categories: "💇 Saç", "👖 Alt", "👟 Ayak"
- Tapping "GİY" on an owned wardrobe item causes the `PixelAvatar` to update immediately — the new layer appears without any page reload
- Tapping "ÇIKAR" (or "GİY" again if using the toggle pattern) removes the item's layer from `PixelAvatar`
- Equipped items slot display at the top of the wardrobe section shows the new `bottom`, `shoes`, `hair` slots (6 slots total, not 4)
- If a costume is equipped (from section-01 costume logic), all four slots (hat, top, bottom, shoes) reflect the costume

---

## Implementation Details

### File to Modify

`/src/components/screens/AvatarScreen.tsx`

### What Changes

#### 1. Add PixelAvatar import

At the top of the file, add:

```typescript
import { PixelAvatar } from '@/components/PixelAvatar';
```

The existing imports (`SectionLabel`, `Badge`, `ProgressBar`, `mockEvolutionTree`, `mockBadges`) remain unchanged.

#### 2. Extend ITEM_CATEGORIES and CAT_KEYS

The current arrays cover `hat`, `top`, `accessory`, `background`, `costume`. Extend them to include the three new equippable categories introduced in section-06-market-expansion:

```typescript
// Before (5 categories):
const ITEM_CATEGORIES = ['🎓 Şapka', '🧥 Üst', '💎 Aksesuar', '🌌 Arka Plan', '🦸 Kostüm'] as const;
const CAT_KEYS = ['hat', 'top', 'accessory', 'background', 'costume'];

// After (8 categories):
const ITEM_CATEGORIES = ['🎓 Şapka', '💇 Saç', '🧥 Üst', '👖 Alt', '👟 Ayak', '💎 Aksesuar', '🌌 Arka Plan', '🦸 Kostüm'] as const;
const CAT_KEYS = ['hat', 'hair', 'top', 'bottom', 'shoes', 'accessory', 'background', 'costume'];
```

The `filteredItems` logic already uses `CAT_KEYS[wardrobeCat]` for filtering, so no changes are needed there beyond this array update.

#### 3. Extend SLOT_LABELS and SLOT_KEYS

The "GİYİLİ EŞYALAR" section currently shows 4 slots in a 4-column grid. Extend to show all 7 equippable slots (excluding `background`, which is not character-body equipment and already handled differently):

```typescript
// Before:
const SLOT_LABELS = ['Şapka', 'Üst', 'Aksesuar', 'Arka Plan'];
const SLOT_KEYS = ['hat', 'top', 'accessory', 'background'];

// After (7 slots):
const SLOT_LABELS = ['Şapka', 'Saç', 'Üst', 'Alt', 'Ayak', 'Aksesuar', 'Arka Plan'];
const SLOT_KEYS = ['hat', 'hair', 'top', 'bottom', 'shoes', 'accessory', 'background'];
```

Update the grid `gridTemplateColumns` to `'repeat(4, 1fr)'` still works (7 items wraps across 2 rows naturally), or use `'repeat(4, 1fr)'` to keep visual consistency with the card layout — either is acceptable. A 4-column grid is recommended so the cards do not become too small.

#### 4. Replace the emoji display with PixelAvatar

In the "Avatar Stage" `<div className="card">` block, locate the existing emoji display:

```tsx
// REMOVE THIS:
<div
  style={{ fontSize: 72, animation: 'float 3s ease-in-out infinite', cursor: 'pointer', display: 'inline-block' }}
  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.05)'; }}
  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
>{user.emoji}</div>
```

Replace with:

```tsx
// ADD THIS:
<div style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block', cursor: 'pointer' }}>
  <PixelAvatar
    equippedItems={user.equippedItems}
    size="preview"
    direction="down"
  />
</div>
```

The `float` animation wrapper div and the glow `<div>` beneath it remain unchanged. Only the inner emoji `<div>` is replaced with `<PixelAvatar>`.

#### 5. Wardrobe equip button uses store's equipItem for toggling

The existing wardrobe buttons call `equipItem(item.id)` and `unequipItem(item.id)` separately via `item.equipped`. After section-01's store update, `equipItem` handles toggle (equip if unequipped, unequip if already equipped). However, to avoid breaking changes, keep the current two-button pattern (`GİY` / `ÇIKAR`) — the section-01 store update makes both actions correctly sync `user.equippedItems`, which is all that's needed for `PixelAvatar` to reflect changes.

No changes needed to the button logic itself — the fix is in the store (section-01), and this section only verifies that the re-render path works end to end.

#### 6. Remove or suppress unused `user.emoji` reference in avatar stage

After replacing the emoji display, `user.emoji` is no longer referenced in the avatar stage block. Verify whether it is used elsewhere in the file (it may also appear in badge or stats sections — if not, the variable is accessed only via the removed `{user.emoji}` JSX). TypeScript will not complain about reading a store field that still exists, so no action is required unless `user.emoji` is entirely removed from the store (which is out of scope for this project).

---

## Equipped Items Display — Reading from `user.equippedItems`

The "GİYİLİ EŞYALAR" section currently finds equipped items by searching `items.find(item => item.equipped && item.category === slot)`. After section-01, `user.equippedItems` is the authoritative source. The existing approach (reading `item.equipped` boolean from the items array) still compiles and works if section-01 keeps both the `equipped` boolean and `user.equippedItems` in sync. If section-01 removes the `equipped` boolean, the lookup must change to:

```typescript
// Fallback if item.equipped boolean is removed from MarketItem:
const equippedId = user.equippedItems[slot as keyof typeof user.equippedItems];
const equipped = equippedId ? items.find(item => item.id === equippedId) : undefined;
```

Check the section-01 implementation to determine which approach is needed. If `item.equipped` boolean is preserved, the existing lookup works without change.

---

## Store Selector Note

`AvatarScreen` already subscribes to the full store destructure:

```typescript
const { user, items, equipItem, unequipItem, setActiveTab, showToast } = useStore();
```

This is acceptable for `AvatarScreen` — it is not a high-frequency re-render component (not in a rAF loop), so the broad subscription does not cause performance problems. No change needed.

---

## Summary of Changes

| Location | Change Type | Description |
|---|---|---|
| `/src/components/screens/AvatarScreen.tsx` | Import added | `import { PixelAvatar } from '@/components/PixelAvatar'` |
| `ITEM_CATEGORIES` constant | Extended | Add Saç, Alt, Ayak tabs (8 total) |
| `CAT_KEYS` constant | Extended | Add `'hair'`, `'bottom'`, `'shoes'` keys |
| `SLOT_LABELS` constant | Extended | Add Saç, Alt, Ayak, Aksesuar labels (7 total) |
| `SLOT_KEYS` constant | Extended | Add `'hair'`, `'bottom'`, `'shoes'` keys |
| Avatar Stage JSX | Replaced | Emoji `<div>` replaced with `<PixelAvatar size="preview" direction="down" />` |

No new files are created by this section. The only file modified is `AvatarScreen.tsx`.