Now I have all the context needed. Let me generate the section content for `section-04-pixel-avatar`.

# Section 04: Pixel Avatar Component

## Overview

This section creates `/src/components/PixelAvatar.tsx` — a `React.memo`-wrapped SVG component that renders the base pixel art character plus any equipped item layers in the correct z-order. It is used in the Avatar Screen (static preview), the Market Screen (item cards), and the Lobby Room (animated walking character).

**Dependencies required before starting this section:**
- `section-01-store`: `user.equippedItems` must have `bottom`, `shoes`, and `hair` slots; store types must compile
- `section-02-constants-mockdata`: `mockUser` must have the new `equippedItems` shape
- `section-03-avatar-layers`: `avatar-layers.ts` must export `BASE_BODY_LAYER`, `BASE_HEAD_LAYER`, and `AVATAR_LAYER_MAP`

**This section blocks:**
- `section-06-market-expansion` (pixel preview in market cards)
- `section-07-avatar-screen` (replaces emoji display)
- `section-10-lobby` (animated walking player in lobby room)

---

## Tests

No test framework is installed. TypeScript strict mode (`"strict": true`) is the primary correctness mechanism. The following checks must pass before and after implementation.

### TypeScript Checks

Before writing the component body, verify the props interface compiles cleanly:

- `equippedItems` must match `StoreState['user']['equippedItems']` exactly — derive this type from the store, do not redefine it inline
- `size` prop is the literal union `'preview' | 'lobby'`, not `string`
- `direction` is `'down' | 'left' | 'right' | 'up'` (optional, defaults to `'down'`)
- `isWalking` is `boolean` (optional, defaults to `false`)
- `frameIndex` is `number` in range 0–3 (optional, defaults to `0`) — document the range in a comment, TypeScript cannot enforce the range
- The component export is wrapped with `React.memo` (not a bare function export)
- No `any` types used anywhere in the file
- `npm run build` passes with zero errors after creating the file

### Manual Browser Verification Checklist

Run the dev server (`npm run dev` at `/home/behlul/studyquest`) and verify each of the following:

1. **Base character renders:** With no items equipped, the avatar displays a visible body and head as colored pixel rectangles. The SVG is not blank.
2. **Z-order is correct:** Equipping a hat causes the hat layer to appear above the head layer. Equipping bottom clothing appears below the top clothing layer.
3. **imageRendering applied:** The SVG does not appear blurry at small sizes. Inspect the element and confirm `image-rendering: pixelated` is present in the computed style.
4. **Size prop works:** `size="preview"` renders the avatar at 96px wide. `size="lobby"` renders at 48px wide. Both are visually distinct.
5. **Direction prop works:** Passing different `direction` values changes which `directional` pixel array is used (if the layer def has `directional`; otherwise falls back to `pixels`).
6. **Walk animation:** When `isWalking={true}` and `frameIndex` cycles 0–3, the avatar visibly changes pose (if walk frame data is defined in the layer).
7. **No re-render cascade:** In React DevTools Profiler, confirm that `PixelAvatar` only re-renders when its own props change, not on every parent state update.

---

## Implementation

### File to Create

`/home/behlul/studyquest/src/components/PixelAvatar.tsx`

### Props Interface

```typescript
import type { StoreState } from '../store';  // adjust path as needed

interface PixelAvatarProps {
  equippedItems: StoreState['user']['equippedItems'];
  size: 'preview' | 'lobby';
  direction?: 'down' | 'left' | 'right' | 'up';
  isWalking?: boolean;
  frameIndex?: number;  // 0-3; 0 = idle frame
}
```

Derive `StoreState` from wherever the store exports its type. The `equippedItems` shape after section-01 is:

```typescript
{
  hat: string | null;
  top: string | null;
  bottom: string | null;
  shoes: string | null;
  hair: string | null;
  accessory: string | null;
  background: string | null;
}
```

### Size Constants

```typescript
const SIZE_MAP = {
  preview: 96,  // rendered CSS width in px
  lobby: 48,
} as const;
```

The SVG `viewBox` is always `"0 0 16 32"` regardless of size. CSS scaling handles the rest.

### Layer Z-Order

Collect layers from bottom to top in this exact order:

```
body → bottom → shoes → top → hair → head → hat → accessory
```

The `body` and `head` layers come from `BASE_BODY_LAYER` and `BASE_HEAD_LAYER` (always present). All other slots come from `AVATAR_LAYER_MAP[equippedItems[slot]]` if the slot is non-null and the key exists in the map.

### Pixel Selection Logic

For each layer, select which `PixelRect[]` array to render using this priority:

1. If `isWalking && frameIndex > 0` and `layer.walkFrames?.[frameIndex]` exists → use walk frame
2. Else if `direction !== 'down'` and `layer.directional?.[direction]` exists → use directional variant
3. Else → use `layer.pixels` (the default, always present)

### Component Structure (stub)

```typescript
import React from 'react';
import { BASE_BODY_LAYER, BASE_HEAD_LAYER, AVATAR_LAYER_MAP } from '../lib/avatar-layers';
import type { StoreState } from '../store';
import type { AnimatedLayerDef } from '../lib/avatar-layers';

interface PixelAvatarProps { /* ... as above */ }

const SLOT_ORDER: Array<keyof StoreState['user']['equippedItems']> = [
  'bottom', 'shoes', 'top', 'hair', 'hat', 'accessory',
  // Note: 'body' and 'head' are inserted manually at the correct positions
  // Note: 'background' is a display-only slot, not a character layer
];

const SIZE_MAP = { preview: 96, lobby: 48 } as const;

/**
 * Selects the appropriate PixelRect[] from a layer definition
 * based on walking state, frame index, and facing direction.
 */
function selectPixels(
  layer: AnimatedLayerDef,
  direction: 'down' | 'left' | 'right' | 'up',
  isWalking: boolean,
  frameIndex: number
): PixelRect[] { /* ... */ }

/**
 * Builds the ordered list of active layers for the current equip state.
 * Order: body → bottom → shoes → top → hair → head → hat → accessory
 */
function buildLayerStack(
  equippedItems: StoreState['user']['equippedItems']
): AnimatedLayerDef[] { /* ... */ }

const PixelAvatar = React.memo(function PixelAvatar({
  equippedItems,
  size,
  direction = 'down',
  isWalking = false,
  frameIndex = 0,
}: PixelAvatarProps) {
  const pxSize = SIZE_MAP[size];
  const layers = buildLayerStack(equippedItems);

  return (
    <svg
      viewBox="0 0 16 32"
      width={pxSize}
      height={pxSize * 2}  // aspect ratio 1:2 (16 wide, 32 tall)
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {layers.map(layer => {
        const pixels = selectPixels(layer, direction, isWalking, frameIndex);
        return (
          <g key={layer.id}>
            {pixels.map((rect, i) => (
              <rect
                key={i}
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={rect.color}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
});

export default PixelAvatar;
```

### Background Slot Handling

The `background` slot in `equippedItems` is NOT rendered as a character layer inside the SVG. It is a backdrop for the whole avatar display area — handled by the parent component (AvatarScreen wraps `PixelAvatar` in a div with the background color/gradient). `PixelAvatar` itself ignores `equippedItems.background`.

### Important: No Missing Layer Silently

If `equippedItems[slot]` is non-null but the id does not exist in `AVATAR_LAYER_MAP`, skip it silently (do not throw). Log a warning in development:

```typescript
if (process.env.NODE_ENV !== 'production') {
  console.warn(`PixelAvatar: no layer definition found for item id "${itemId}"`);
}
```

### Sizing Height Note

The SVG `viewBox` is `16 × 32` (1:2 ratio). When `size="preview"` (96px wide), set height to `192px`. When `size="lobby"` (48px wide), set height to `96px`. This keeps the character proportions correct.

### imageRendering Compatibility

Set `imageRendering: 'pixelated'` as an inline React style. This is a valid CSS property in all modern browsers. No vendor prefix needed. The SVG will remain crisp (not antialiased/blurry) when scaled up by the browser.

---

## Integration Points (Do Not Implement Here)

Once `PixelAvatar` is created and verified, it is consumed in three later sections:

- **section-07-avatar-screen**: `<PixelAvatar equippedItems={user.equippedItems} size="preview" direction="down" />` replaces the large emoji div in `AvatarScreen.tsx`
- **section-06-market-expansion**: A small SVG preview in market item cards (uses `PixelAvatar` or a subset of the rendering logic directly)
- **section-10-lobby**: Player and mock players in `LobbyRoom.tsx` use `size="lobby"` with walking props animated by the rAF loop

Do not import or reference screen components from within `PixelAvatar.tsx` — it must remain a pure presentational component with no store access.

---

## Relevant Source Files

These existing files should be read before implementing to understand the current structure:

- `/home/behlul/studyquest/src/store/index.ts` — for `StoreState['user']['equippedItems']` type shape
- `/home/behlul/studyquest/src/lib/avatar-layers.ts` — created in section-03; provides all layer data imports
- `/home/behlul/studyquest/src/components/screens/AvatarScreen.tsx` — to understand current emoji display being replaced (context only)