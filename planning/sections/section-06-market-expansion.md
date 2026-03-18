Now I have all the information I need to generate the section content. Let me compose the complete section.

# Section 06: Market Expansion

## Overview

This section expands `mockMarketItems` from 15 items to 50+ items across 7 categories (adding `bottom`, `shoes`, `hair`, and `costume` categories). Each equippable item also requires a corresponding entry in `AVATAR_LAYER_MAP` in `/src/lib/avatar-layers.ts`. The `MarketScreen.tsx` is updated to show small SVG pixel art previews alongside item emojis, and the category filter tabs are updated to include the new categories.

## Dependencies

This section depends on:
- **section-03-avatar-layers**: `AVATAR_LAYER_MAP`, `AnimatedLayerDef`, and `PixelRect` types must already exist in `/src/lib/avatar-layers.ts`.
- **section-04-pixel-avatar**: `PixelAvatar` component must be available for reference (though not directly used in market cards — only the raw SVG pixel preview is rendered inline here).
- **section-01-store**: The `equipItem` action must already support the new slots (`bottom`, `shoes`, `hair`) and the costume multi-slot logic. The `user.equippedItems` object must already include `bottom`, `shoes`, `hair` fields.

Do not duplicate store or avatar-layer type definitions here. Reference them by import.

## Files to Modify/Create

| File | Action |
|------|--------|
| `/src/lib/mock-data.ts` | Add ~35 new items to `mockMarketItems` |
| `/src/lib/avatar-layers.ts` | Add `AVATAR_LAYER_MAP` entries for all new items |
| `/src/components/screens/MarketScreen.tsx` | Update category tabs + add pixel preview to item cards |

---

## Tests First

From `claude-plan-tdd.md`, Section 3:

### TypeScript Checks (run `npm run build`)

Before adding new items to `mock-data.ts`:
- Each new `MarketItem` has all required fields: `id`, `name`, `category`, `rarity`, `price`, `emoji`. Note: `description` is mentioned in the TDD plan but does not appear in the existing item schema — do NOT add a `description` field unless it already exists in the store's `MarketItem` type.
- No duplicate `id` values in the `mockMarketItems` array. A quick way to verify: `new Set(mockMarketItems.map(i => i.id)).size === mockMarketItems.length`.
- All ids referenced as keys in `AVATAR_LAYER_MAP` that correspond to equippable items (non-background, non-costume) have a matching entry in `mockMarketItems`.

### Manual Verification

- New items appear in `MarketScreen` under the correct category filter tab.
- Rarity badge colors are correct: `common` (#64748B), `rare` (#22D3EE), `epic` (#A78BFA), `legendary` (#FFD700).
- Prices match rarity conventions: Common ≤ 50sa, Rare ≤ 150sa, Epic ≤ 400sa, Legendary ≤ 1000sa.

### Pixel Preview Manual Verification

- Item cards for equippable categories (`hat`, `top`, `bottom`, `shoes`, `hair`, `accessory`) show a small SVG preview.
- Background items show a color swatch (not a character-shaped SVG).
- Costume items show a combined preview or a full silhouette.
- Pixel preview aligns visually with the item emoji without overlapping text.

---

## Part 1: New Items in `mock-data.ts`

**File:** `/src/lib/mock-data.ts`

Extend the `mockMarketItems` array. The current array has 15 items (14 regular + 1 daily deal). Target: 50+ items total.

### Naming and Theming Convention

All items follow the existing cyberpunk/fantasy theme. Turkish names in the style of: "Neon Şapka", "Cyber Kask", "Hologram Başlık", "Ejderha Zırhı", "Lazer Gözlük".

### Pricing Convention

```
Common:    15–50 sa
Rare:      50–150 sa
Epic:      150–400 sa
Legendary: 500–1000 sa
```

Do not use prices outside these ranges for any given rarity tier.

### New Item Distribution

Add items to reach these per-category targets:

| Category | Slot | Turkish UI Label | Target Count | Existing Count |
|----------|------|-----------------|--------------|----------------|
| `hat` | hat | Baş/Şapka | 8 | 4 |
| `hair` | hair | Saç | 6 | 0 (NEW) |
| `top` | top | Üst Giysi | 8 | 4 (incl. 1 daily) |
| `bottom` | bottom | Alt Giysi | 6 | 0 (NEW) |
| `shoes` | shoes | Ayakkabı | 6 | 0 (NEW) |
| `accessory` | accessory | Aksesuar | 8 | 3 |
| `background` | background | Arka Plan | 8 | 2 |
| `costume` | hat+top+bottom+shoes | Kostüm | 6 | 0 (NEW) |

### Item Schema

Each item object must match the existing `MarketItem` shape inferred from the store. The existing shape is:

```typescript
{
  id: string;
  name: string;
  category: string;   // 'hat' | 'hair' | 'top' | 'bottom' | 'shoes' | 'accessory' | 'background' | 'costume'
  emoji: string;
  rarity: string;     // 'common' | 'rare' | 'epic' | 'legendary'
  price: number;
  owned: boolean;     // false for new items (user hasn't bought them)
  equipped: boolean;  // false for new items
}
```

Do not add new fields to the schema. The `isDaily`/`dailyPrice` fields on the existing special item are already handled in the store via `(item as any).isDaily` — do not replicate this pattern for new items.

### Costume Items — Special Field

Costume items need a way to communicate which slots they occupy. Add a `costumeSlots` field to costume items only:

```typescript
// Costume item example shape:
{
  id: 'item-costume-1',
  name: 'Ejderha Şövalye Seti',
  category: 'costume',
  emoji: '🐉',
  rarity: 'legendary',
  price: 800,
  owned: false,
  equipped: false,
  costumeSlots: {
    hat: 'item-hat-costume-1-hat',    // references a real hat item id, OR null
    top: 'item-hat-costume-1-top',
    bottom: 'item-hat-costume-1-bottom',
    shoes: 'item-hat-costume-1-shoes',
  }
}
```

The `costumeSlots` values are string ids of virtual sub-items. The `equipItem` action (implemented in section-01-store) reads these to set `user.equippedItems`. For TypeScript, the existing store infers types from `mockUser`, so `costumeSlots` will type-check as `any` — this is acceptable for this one special field. However, add a TypeScript type assertion comment above each costume item group.

### Suggested Items to Add

Below is a representative list. Implementers may use different names within the same theme, but should follow this distribution:

**Hat items (add 4 more to reach 8):**
```
item-hat-5  | Piksel Kask        | common    | 20sa
item-hat-6  | Ninja Bandanası    | rare      | 65sa
item-hat-7  | Zaman Tacı         | epic      | 200sa
item-hat-8  | Tanrı Halosu       | legendary | 750sa
```

**Hair items (6 new, NEW category):**
```
item-hair-1 | Kısa Saç           | common    | 15sa
item-hair-2 | Anime Saçı         | rare      | 55sa
item-hair-3 | Neon Örgü          | rare      | 70sa
item-hair-4 | Uzun Dalgalı       | epic      | 160sa
item-hair-5 | Hologram Peruk     | epic      | 220sa
item-hair-6 | Efsanevi Alev Saçı | legendary | 600sa
```

**Top items (add 4 more to reach 8, excluding the existing daily item):**
```
item-top-4  | Kodlayıcı Hoodie   | common    | 25sa
item-top-5  | Neon Zırh          | rare      | 90sa
item-top-6  | Kuantum Ceket      | epic      | 280sa
item-top-7  | Ejderha Zırhı      | legendary | 900sa
```

**Bottom items (6 new, NEW category):**
```
item-bottom-1 | Kargo Pantolon     | common    | 20sa
item-bottom-2 | Neon Tayt          | rare      | 60sa
item-bottom-3 | Siber Şort         | rare      | 75sa
item-bottom-4 | Zırh Etek          | epic      | 175sa
item-bottom-5 | Hologram Pantolon  | epic      | 250sa
item-bottom-6 | Ejderha Bacakları  | legendary | 650sa
```

**Shoes items (6 new, NEW category):**
```
item-shoes-1 | Spor Ayakkabı      | common    | 18sa
item-shoes-2 | Neon Koşucular     | rare      | 55sa
item-shoes-3 | Lazer Botlar       | rare      | 80sa
item-shoes-4 | Siber Çizmeler     | epic      | 190sa
item-shoes-5 | Uçuş Botları       | epic      | 320sa
item-shoes-6 | Tanrı Sandalet     | legendary | 700sa
```

**Accessory items (add 5 more to reach 8):**
```
item-acc-4  | Lazer Gözlük       | common    | 35sa
item-acc-5  | Hologram Küpe      | rare      | 70sa
item-acc-6  | Zaman Bilekliği    | rare      | 85sa
item-acc-7  | Kuantum Kalkan     | epic      | 220sa
item-acc-8  | Tanrı Eldivenler   | legendary | 850sa
```

**Background items (add 6 more to reach 8):**
```
item-bg-3   | Siber Orman        | common    | 30sa
item-bg-4   | Dijital Okyanus    | rare      | 90sa
item-bg-5   | Neon Dağlar        | rare      | 110sa
item-bg-6   | Uzay İstasyonu     | epic      | 260sa
item-bg-7   | Ejderha Şatosu     | epic      | 300sa
item-bg-8   | Matrix Boyutu      | legendary | 950sa
```

**Costume items (6 new, NEW category):**
```
item-costume-1 | Ejderha Şövalye Seti  | legendary | 800sa
item-costume-2 | Neon Savaşçı Seti     | epic      | 350sa
item-costume-3 | Cyber Punk Seti       | epic      | 380sa
item-costume-4 | Ninja Karanlık Seti   | rare      | 140sa
item-costume-5 | Uzay Gezgini Seti     | legendary | 950sa
item-costume-6 | Piksel Kahraman Seti  | common    | 45sa
```

---

## Part 2: Avatar Layer Map Entries in `avatar-layers.ts`

**File:** `/src/lib/avatar-layers.ts`

For every new equippable item (all categories except `background` and `costume`), add an entry to `AVATAR_LAYER_MAP`. The key is the item's `id` string.

Section-03-avatar-layers defines the types. Each entry is an `AnimatedLayerDef`:

```typescript
// Import structure expected from section-03:
import type { AnimatedLayerDef } from './avatar-layers';
// The AVATAR_LAYER_MAP is defined in avatar-layers.ts itself (not imported)
```

### Pixel Art Guidelines

The avatar SVG uses `viewBox="0 0 16 32"` — 16 units wide, 32 tall. Each pixel rect is defined in these grid units.

Slot positions within the 16×32 grid:
- `hat`: rows 0–3, centered horizontally (x: 3–12)
- `hair`: rows 1–6, wrapping head width (x: 2–13)
- `head/face`: rows 2–8 (handled by BASE_HEAD_LAYER from section-03)
- `top`: rows 9–18, torso (x: 2–13)
- `bottom`: rows 19–25, hips/legs (x: 3–12)
- `shoes`: rows 26–31, feet (x: 3–5 left, 10–12 right)
- `accessory`: overlaid — varies by item type

### Stub Format

Each `AVATAR_LAYER_MAP` entry is a stub that must be filled with actual `pixels` arrays. Example stub format for a hat:

```typescript
'item-hat-5': {
  id: 'item-hat-5',
  slot: 'hat',
  pixels: [
    // Piksel Kask - basic helmet covering rows 0-3
    { x: 4, y: 0, w: 8, h: 1, color: '#64748B' },   // top bar
    { x: 3, y: 1, w: 10, h: 2, color: '#475569' },  // main body
    { x: 3, y: 3, w: 10, h: 1, color: '#334155' },  // brim
  ],
},
```

For the `bottom` and `shoes` slots (directional avatars in lobby), include `directional` arrays only if the slot type visually changes by direction. For non-directional items (accessories, hats worn from above), only `pixels` is needed.

### Background Items

Background items do NOT get `AVATAR_LAYER_MAP` entries. They are rendered as color swatches in the market preview. Define a separate constant for background palettes:

```typescript
// In avatar-layers.ts or a new file:
export const BACKGROUND_PALETTES: Record<string, string[]> = {
  'item-bg-1': ['#0F0A2E', '#1A1040', '#2D1B69'],  // Galaksi
  'item-bg-2': ['#0D0D1A', '#1A1A2E', '#00FF9F'],  // Neon Şehir
  'item-bg-3': ['#0A1A0A', '#1A2E1A', '#22D3EE'],  // Siber Orman
  // ... one entry per background item
};
```

Export this from `avatar-layers.ts`.

### Costume Items

Costume items use a special layer type. They do not get their own `AVATAR_LAYER_MAP` entry — instead, their `costumeSlots` reference actual hat/top/bottom/shoes item ids that DO have entries. The `equipItem` action will set those four slot ids individually.

For example, `item-costume-1` (Ejderha Şövalye Seti) has `costumeSlots.hat = 'item-hat-costume-1-hat'`. That means `AVATAR_LAYER_MAP['item-hat-costume-1-hat']` must exist with `slot: 'hat'` and appropriate dragon knight pixels.

These "virtual" sub-item layer ids (e.g. `item-hat-costume-1-hat`) do NOT need corresponding `mockMarketItems` entries — they are only used internally in `AVATAR_LAYER_MAP` and referenced by `costumeSlots`.

---

## Part 3: MarketScreen Updates

**File:** `/src/components/screens/MarketScreen.tsx`

### 3a. Update Category Tabs

The current `CATEGORIES` and `CAT_KEYS` constants must be extended:

```typescript
// BEFORE:
const CATEGORIES = ['Tümü', '🎓 Şapka', '🧥 Üst Giysi', '💎 Aksesuar', '🌌 Arka Plan'];
const CAT_KEYS = ['all', 'hat', 'top', 'accessory', 'background'];

// AFTER:
const CATEGORIES = ['Tümü', '🎓 Şapka', '💇 Saç', '🧥 Üst', '👖 Alt', '👟 Ayakkabı', '💎 Aksesuar', '🌌 Arka Plan', '🎭 Kostüm'];
const CAT_KEYS =   ['all',  'hat',     'hair',    'top',   'bottom', 'shoes',       'accessory',   'background',   'costume'];
```

The category button active-state logic must also be updated. The current implementation has a fragile check using `cat.includes(...)` — replace with a clean comparison:

```typescript
// Replace the active check in the button style with:
const isActive = CAT_KEYS[i] === marketCategory || (cat === 'Tümü' && marketCategory === 'all');
```

### 3b. Add Pixel Art Preview to Item Cards

Import `AVATAR_LAYER_MAP` and `BACKGROUND_PALETTES` from `@/lib/avatar-layers`.

Inside the item grid render loop, after the existing emoji `<div>`, add a pixel preview SVG for equippable items:

```typescript
// Stub: pixel preview renderer function
function ItemPixelPreview({ item }: { item: typeof filteredItems[number] }) {
  /**
   * Renders a miniature SVG pixel art preview for a market item.
   * - For hat, hair, top, bottom, shoes, accessory: looks up item.id in AVATAR_LAYER_MAP
   *   and renders a tiny SVG (viewBox based on slot type).
   * - For background: renders a 3-stop gradient swatch from BACKGROUND_PALETTES[item.id].
   * - For costume: renders a simplified full-body silhouette or costume icon.
   * - Returns null if no preview data is available.
   */
}
```

The preview SVG sizing by slot:
- `hat`, `hair`: `viewBox="0 0 16 8"`, rendered at `width: 20px, height: 10px`
- `top`: `viewBox="0 0 16 12"`, rendered at `width: 20px, height: 15px`
- `bottom`, `shoes`: `viewBox="0 0 16 14"`, rendered at `width: 20px, height: 17px`
- `accessory`: `viewBox="0 0 16 32"`, rendered at `width: 12px, height: 24px`
- `background`: color swatch, `width: 28px, height: 18px`

Position the pixel preview in the item card at the bottom-right corner of the emoji area, using `position: absolute` or by placing it alongside the emoji in a flex row. Ensure it does not overlap the rarity label or name text.

Style: `imageRendering: 'pixelated'`, `border: '1px solid rgba(255,255,255,.08)'`, `borderRadius: 2`.

### 3c. Category Button Active State Fix

The existing category button active state check is broken for the new categories (it uses string includes). Replace it as described in 3a above.

---

## Implementation Checklist

1. **`/src/lib/mock-data.ts`**: Add ~35 new items to `mockMarketItems`. Verify no duplicate IDs. Costume items include `costumeSlots` field.
2. **`/src/lib/avatar-layers.ts`**: Add `AVATAR_LAYER_MAP` entries for all new equippable non-background, non-costume items. Add virtual sub-item entries for costume slot overrides. Export `BACKGROUND_PALETTES` with color arrays for all 8 background items.
3. **`/src/components/screens/MarketScreen.tsx`**: Update `CATEGORIES`/`CAT_KEYS` arrays. Fix active-state logic. Add `ItemPixelPreview` component or inline SVG preview logic to item cards. Import `AVATAR_LAYER_MAP` and `BACKGROUND_PALETTES` from `@/lib/avatar-layers`.
4. Run `npm run build` and confirm zero TypeScript errors.
5. Manually verify in browser: new categories appear, items are filterable, pixel previews render, background swatches show colors.

---

## TypeScript Notes

- The `MarketItem` type is inferred from `mockMarketItems` in the store. Adding new items to the array automatically widens the inferred union. `costumeSlots` on costume items will be typed as `{ hat: string; top: string; bottom: string; shoes: string } | undefined` depending on inference — access via optional chaining or a type guard.
- `AVATAR_LAYER_MAP` is typed as `Record<string, AnimatedLayerDef>` (defined in section-03). Accessing a missing key returns `undefined` at runtime even though TypeScript says it returns `AnimatedLayerDef`. Always null-check: `const layerDef = AVATAR_LAYER_MAP[item.id]; if (!layerDef) return null;`.
- Do not use `any` for the `BACKGROUND_PALETTES` lookup. Type it as `Record<string, string[]>` and check for `?? []` when reading.
- The `setMarketCategory` action accepts the raw key string. Passing `CAT_KEYS[i]` directly (e.g. `'hair'`, `'bottom'`) is correct — no change to the store action signature needed.