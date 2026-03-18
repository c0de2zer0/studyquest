Now I have all the context I need to write section-03-avatar-layers. Let me produce the complete section content.

# section-03-avatar-layers: Avatar Layer Definitions

## Overview

This section creates `/src/lib/avatar-layers.ts`, the central data file that defines all pixel art layer shapes for every equippable market item. This file is a pure data/type module — no React, no store imports. It is consumed by `PixelAvatar.tsx` (section-04) and by the market pixel preview rendering (section-06).

**Dependencies:**
- section-01-store must be complete so that `StoreState['user']['equippedItems']` includes the new slots (`bottom`, `shoes`, `hair`).
- section-02-constants-mockdata must be complete so that `mockMarketItems` has the correct item `id` values this file references.

**Blocks:**
- section-04-pixel-avatar depends on the exported types and data from this file.
- section-06-market-expansion adds more items and must add corresponding entries to `AVATAR_LAYER_MAP`.

---

## Tests / Verification

These checks come from `claude-plan-tdd.md`, Section 2.

### TypeScript Checks (enforced by `npm run build`)

- `PixelRect` interface: all coordinate fields are `number`; `color` is `string`. No `any`.
- `AvatarLayerDef.slot` is typed as `AvatarSlot` (literal union), NOT `string`.
- `AnimatedLayerDef` extends `AvatarLayerDef` — no duplicate field definitions.
- `AVATAR_LAYER_MAP` is typed as `Record<string, AnimatedLayerDef>`.
- At least 5 item ids are present in `AVATAR_LAYER_MAP` before this section is considered complete.
- All keys in `AVATAR_LAYER_MAP` match an existing `id` in `mockMarketItems` (manual cross-check; not enforced by TS).

### Manual Verification (after section-04 is implemented)

- Base character (no items equipped) renders as valid SVG with visible body and head pixels.
- Equipping a hat causes the hat layer to appear above the head layer in z-order.
- Equipping a bottom item causes the bottom layer to render below the top layer.
- All layer pixel coordinates stay within the `0 0 16 32` viewBox; no pixel extends beyond x=15 or y=31.

---

## File to Create

**`/src/lib/avatar-layers.ts`**

This file is standalone TypeScript — no imports from the store or React. It may eventually import from `/src/lib/constants.ts` if color constants are needed, but color values can also be inline hex strings for simplicity.

---

## Types

Define the following types at the top of the file. These types are also used by `PixelAvatar.tsx` (import them from this file).

```typescript
export type AvatarSlot = 'body' | 'head' | 'hair' | 'top' | 'bottom' | 'shoes' | 'hat' | 'accessory';

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface AvatarLayerDef {
  id: string;       // matches MarketItem.id (or 'base-body' / 'base-head' for built-ins)
  slot: AvatarSlot;
  pixels: PixelRect[];
}

export interface AnimatedLayerDef extends AvatarLayerDef {
  directional?: {
    down: PixelRect[];
    left: PixelRect[];
    right: PixelRect[];
    up: PixelRect[];
  };
  walkFrames?: PixelRect[][];  // frames[0] = idle, frames[1..3] = walk cycle
}
```

The `directional` and `walkFrames` fields are optional — for the Avatar Screen (static preview) only `pixels` is used. For the Lobby (section-10) these are consulted if present, falling back to `pixels` when absent.

---

## Coordinate System

The SVG `viewBox` is `"0 0 16 32"` — 16 units wide, 32 units tall. Each unit corresponds to one "pixel" of the character. At `size="preview"` (96px wide CSS), the scale factor is 6× (96/16). At `size="lobby"` (48px wide CSS), the scale factor is 3×.

Anatomy reference for pixel placement:

```
y=0..1   → hat brim / top of head
y=2..7   → head / face (eyes at y=4, mouth at y=6)
y=8..9   → neck
y=10..20 → torso (top clothing goes here)
y=21..24 → hips / belt (bottom clothing starts here)
y=25..29 → legs (bottom clothing)
y=30..31 → feet / shoes
```

x center is at 8. The character is 16px wide. Arms extend to x=0..2 (left) and x=13..15 (right).

---

## Layer Z-Order

When `PixelAvatar` renders layers, it stacks them in this order (bottom to top):

1. `body` (base skin — always rendered)
2. `bottom` (trousers/skirt)
3. `shoes`
4. `top` (shirt/jacket)
5. `hair`
6. `head` (face — always rendered, drawn over hair so eyes/mouth are visible)
7. `hat`
8. `accessory`

The `body` and `head` layers are built-in and not part of `AVATAR_LAYER_MAP`. They are exported as `BASE_BODY_LAYER` and `BASE_HEAD_LAYER`.

---

## Base Character Layers

### `BASE_BODY_LAYER`

The base body is the default skin-tone character silhouette. It covers torso, arms, and legs. Suggested skin color: `'#F5C09A'` (warm tan). You must define `pixels` as an array of `PixelRect` entries covering:

- Torso: a block from approximately x=4..11, y=10..20
- Left arm: x=1..3, y=10..18
- Right arm: x=12..14, y=10..18
- Left leg: x=4..7, y=21..29
- Right leg: x=8..11, y=21..29

The exact pixel shapes are at the implementer's discretion — the above is a starting point. The character should look like a humanoid silhouette at 16×32 resolution.

Example stub:
```typescript
export const BASE_BODY_LAYER: AnimatedLayerDef = {
  id: 'base-body',
  slot: 'body',
  pixels: [
    // torso
    { x: 4, y: 10, w: 8, h: 11, color: '#F5C09A' },
    // left arm
    { x: 1, y: 10, w: 3, h: 9, color: '#F5C09A' },
    // right arm
    { x: 12, y: 10, w: 3, h: 9, color: '#F5C09A' },
    // left leg
    { x: 4, y: 21, w: 4, h: 9, color: '#F5C09A' },
    // right leg
    { x: 8, y: 21, w: 4, h: 9, color: '#F5C09A' },
  ],
  // Optional: directional and walkFrames for section-10 lobby animation
};
```

### `BASE_HEAD_LAYER`

The head layer covers the face region and is always drawn above all other layers so eyes and mouth remain visible. Suggested colors: face `'#F5C09A'`, eyes `'#1A1A2E'`, mouth `'#C0705A'`.

Coverage:
- Face block: x=3..12, y=2..8
- Left eye: x=5..6, y=4..5
- Right eye: x=9..10, y=4..5
- Mouth: x=6..9, y=6..7

Example stub:
```typescript
export const BASE_HEAD_LAYER: AnimatedLayerDef = {
  id: 'base-head',
  slot: 'head',
  pixels: [
    // face
    { x: 3, y: 2, w: 10, h: 7, color: '#F5C09A' },
    // left eye
    { x: 5, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // right eye
    { x: 9, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // mouth
    { x: 6, y: 6, w: 4, h: 1, color: '#C0705A' },
  ],
};
```

---

## AVATAR_LAYER_MAP

`AVATAR_LAYER_MAP` maps every equippable `MarketItem.id` to its `AnimatedLayerDef`. At this stage (before section-06), only the 13 currently equippable items from `mockMarketItems` need entries. The `background` category does not need a layer definition (it is handled separately as a color swatch in the Market and as a background div in the Avatar Screen — not an SVG layer).

Current equippable item ids from `mockMarketItems` that need entries:

| id | name | slot |
|----|------|------|
| `'item-hat-1'` | Cyber Kask | hat |
| `'item-hat-2'` | Neon Şapka | hat |
| `'item-hat-3'` | Hologram Başlık | hat |
| `'item-hat-4'` | Efsanevi Korona | hat |
| `'item-top-1'` | Okul Ceketi | top |
| `'item-top-2'` | Akademi Üniforma | top |
| `'item-top-3'` | Çalışma Yelegi | top |
| `'item-acc-1'` | XP Halkası | accessory |
| `'item-acc-2'` | Zaman Gözlüğü | accessory |
| `'item-acc-3'` | Kuantum Kolye | accessory |
| `'item-special-1'` | DNA Kanadı | top |

Items `'item-bg-1'` and `'item-bg-2'` are `background` category — no SVG layer needed.

### Pixel Art Design Guidance

Each layer should only draw the pixels for that item's slot region — do NOT redraw body/face pixels in item layers. For example, a hat layer only draws pixels in the y=0..3 range (above the face). A top layer draws in the y=10..20 range (torso and arms).

Colors should follow the cyberpunk aesthetic using the project palette:
- Cyber: `'#22D3EE'` (--cyan), `'#7B5CF6'` (--purple), `'#F59E0B'` (--amber)
- Neutral clothing: `'#1E293B'` (dark navy), `'#334155'` (slate), `'#475569'` (medium slate)
- Gold/legendary: `'#FFD700'`
- Neon accents: `'#A78BFA'` (light purple), `'#34D399'` (green)

### Example Entry (hat layer)

```typescript
// 'item-hat-2': Neon Şapka
// Hat brim at y=2..3, crown at y=0..2, neon band accent at y=3
{
  id: 'item-hat-2',
  slot: 'hat',
  pixels: [
    // crown
    { x: 3, y: 0, w: 10, h: 3, color: '#1E293B' },
    // brim
    { x: 2, y: 3, w: 12, h: 1, color: '#1E293B' },
    // neon band
    { x: 3, y: 2, w: 10, h: 1, color: '#22D3EE' },
  ],
}
```

### Example Entry (top layer)

```typescript
// 'item-top-1': Okul Ceketi
// Covers torso and arms, leaves legs bare
{
  id: 'item-top-1',
  slot: 'top',
  pixels: [
    // jacket body
    { x: 4, y: 10, w: 8, h: 10, color: '#1E293B' },
    // left sleeve
    { x: 1, y: 10, w: 3, h: 8, color: '#1E293B' },
    // right sleeve
    { x: 12, y: 10, w: 3, h: 8, color: '#1E293B' },
    // collar highlight
    { x: 6, y: 10, w: 4, h: 1, color: '#334155' },
  ],
}
```

### Example Entry (accessory layer)

```typescript
// 'item-acc-2': Zaman Gözlüğü
// Drawn over the face at eye level (y=3..5), narrow band across eyes
{
  id: 'item-acc-2',
  slot: 'accessory',
  pixels: [
    // goggle frames
    { x: 4, y: 3, w: 8, h: 3, color: '#1E293B' },
    // left lens
    { x: 5, y: 3, w: 2, h: 3, color: '#22D3EE' },
    // right lens
    { x: 9, y: 3, w: 2, h: 3, color: '#22D3EE' },
    // bridge
    { x: 7, y: 4, w: 2, h: 1, color: '#475569' },
  ],
}
```

---

## Export Shape

The final file should export:

```typescript
export const BASE_BODY_LAYER: AnimatedLayerDef;
export const BASE_HEAD_LAYER: AnimatedLayerDef;
export const AVATAR_LAYER_MAP: Record<string, AnimatedLayerDef>;
```

`AVATAR_LAYER_MAP` is a plain object literal. Example structure:

```typescript
export const AVATAR_LAYER_MAP: Record<string, AnimatedLayerDef> = {
  'item-hat-1': { id: 'item-hat-1', slot: 'hat', pixels: [ /* ... */ ] },
  'item-hat-2': { id: 'item-hat-2', slot: 'hat', pixels: [ /* ... */ ] },
  // ... all other items
};
```

There is no default export.

---

## Relationship to Section 06 (Market Expansion)

When section-06 adds ~34 new market items to `mockMarketItems`, it must also add corresponding entries to `AVATAR_LAYER_MAP` in this file. The section-06 implementer will modify `/src/lib/avatar-layers.ts` to add the new entries. The base types and existing entries defined here must not be removed or renamed.

---

## File Location Summary

| File | Action |
|------|--------|
| `/src/lib/avatar-layers.ts` | CREATE — full new file |

No other files are modified by this section.