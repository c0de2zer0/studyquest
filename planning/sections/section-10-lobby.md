Now I have all the context I need. Let me generate the section content for `section-10-lobby`.

# section-10-lobby: Avatar Lobby (2D Top-Down)

## Overview

This section implements `/src/components/screens/LobbyRoom.tsx` — a full-screen overlay that renders an 800x600 CSS pixel art room with a controllable player avatar. The overlay activates when the user clicks "Katıl" in a voice room from `CommunityScreen.tsx`. Five mock players occupy the room. The user moves their pixel art avatar via WASD/arrow keys using a `requestAnimationFrame` loop.

## Dependencies (Must Be Completed First)

- **section-01-store**: Provides `activeLobbyRoom: string | null`, `openLobby(roomId)`, `closeLobby()` store fields and actions.
- **section-04-pixel-avatar**: Provides the `PixelAvatar` component (`/src/components/PixelAvatar.tsx`) used for all character rendering in the lobby.
- **section-09-community**: Provides the updated `CommunityScreen.tsx` which renders `<LobbyRoom />` as an overlay and wires the "Katıl" button to `openLobby(roomId)`.

## Files to Create / Modify

| File | Action |
|------|--------|
| `/src/components/screens/LobbyRoom.tsx` | **CREATE** — main lobby component |
| `/src/components/screens/CommunityScreen.tsx` | **MODIFY** — import and conditionally render `<LobbyRoom />` |

## Tests First

The following verification stubs must pass before the feature is considered done. There is no test framework installed; these are TypeScript type checks and manual browser verifications.

### TypeScript Checks

Before implementing player movement:

- `keysRef` is typed as `React.MutableRefObject<Set<string>>` — NOT `useState`. Using `useState` here would cause a re-render on every keydown event, severely degrading performance.
- `posRef` is typed as `React.MutableRefObject<{ x: number; y: number }>` — NOT `useState`. This stores the mutable in-progress position between frames.
- `setPlayerPos` is called only inside the rAF callback, never directly in event handlers.
- `MockLobbyPlayer` interface is fully typed with no `any` fields.
- `React.memo` wrapping is present on both the room background component and each mock player component.

### Manual Browser Verifications

**Movement logic:**
- WASD keys move the player in the correct directions (W = up, S = down, A = left, D = right).
- Arrow keys also move the player (both bindings work simultaneously).
- Player cannot move outside room bounds — clamping prevents overflow through walls.
- Pressing arrow keys does NOT scroll the page (`preventDefault` is called in `keydown` handler).
- Walk animation plays while keys are held; stops (resets to `frameIndex = 0`) when all keys are released.

**Mock players:**
- 5 mock players are visible at distinct positions spread across the room.
- Mock players do NOT trigger React re-renders on every rAF tick. In React DevTools Profiler, only the user player div should highlight on frame updates. Mock player idle movement updates DOM directly via `ref.current.style.transform`.

**Mobile scaling:**
- Resizing browser to 375px width scales the lobby down — no horizontal scrollbar appears.
- Scale factor is calculated as `Math.min(1, window.innerWidth / 800)`.
- The exit button ("Lobiden Çık") remains tappable after scaling.

**Exit / cleanup:**
- "Lobiden Çık" button calls `closeLobby()` → `activeLobbyRoom` becomes `null`.
- The `LobbyRoom` overlay unmounts.
- `CommunityScreen` returns to normal three-panel view.
- The rAF loop is cancelled in `useEffect` cleanup — no memory leak (verify by navigating in and out of lobby rapidly without console errors).
- The `keydown` and `keyup` event listeners are removed in `useEffect` cleanup.

## Background and Context

### Rendering Architecture

`LobbyRoom.tsx` is a `position: fixed; inset: 0; z-index: 100` overlay rendered inside `CommunityScreen.tsx`. It is NOT rendered inside `AppShell.tsx`. The room is an 800×600 pixel-art area centered on screen inside the overlay.

The core performance challenge is that the player avatar position must update at 60fps via `requestAnimationFrame`. Naively calling `setState` for every input event would cause excessive re-renders cascading through child components. The solution is:

1. Event handlers only mutate refs, never call `setState`.
2. Only the rAF loop calls `setPlayerPos` (one React re-render per frame for the player element).
3. Room background is static (`React.memo`, never re-renders).
4. Mock players update their DOM position directly via `ref.current.style.transform`, bypassing React entirely.
5. `PixelAvatar` is already wrapped in `React.memo` (from section-04) — do not re-wrap it.

### Store Integration

Read `activeLobbyRoom` and `closeLobby` from the store using narrow selectors:

```typescript
const activeLobbyRoom = useStore(state => state.activeLobbyRoom);
const closeLobby = useStore(state => state.closeLobby);
const user = useStore(state => state.user);
```

`LobbyRoom` does not call `openLobby` — that is handled by the "Katıl" button in `CommunityScreen`.

### Constants

Define at the top of `LobbyRoom.tsx`:

```typescript
const MAP_W = 800;
const MAP_H = 600;
const WALL_THICKNESS = 40;
const PLAYER_SIZE = 48;       // matches 'lobby' size in PixelAvatar (48px wide)
const SPEED = 3;              // pixels per rAF frame
const FRAMES_PER_STEP = 7;    // rAF frames per walk animation step
const WALK_FRAME_COUNT = 4;   // total walk frames (0=idle, 1-3=walk)
```

## Implementation Details

### CommunityScreen.tsx Integration

In `CommunityScreen.tsx`, add the following at the top of the component (after existing store reads):

```typescript
const activeLobbyRoom = useStore(state => state.activeLobbyRoom);
```

Render the overlay conditionally at the end of the JSX, inside the outermost `<div>`:

```typescript
{activeLobbyRoom !== null && <LobbyRoom />}
```

The voice room "Katıl" button in the channel sidebar must call `openLobby(room.id)` instead of `joinRoom(room.id)`. The `openLobby` action (from section-01) internally calls `joinRoom` as well. Update that button's `onClick` handler accordingly.

### LobbyRoom Component Structure

```typescript
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { PixelAvatar } from '@/components/PixelAvatar';
import { StoreState } from '@/store';

// ... constants defined here ...

interface MockLobbyPlayer {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  equippedItems: StoreState['user']['equippedItems'];
}

// Define 5 mock players inline (or import from mock-data.ts)
const MOCK_PLAYERS: MockLobbyPlayer[] = [ /* ... */ ];

// Memoized sub-components
const RoomBackground = React.memo(function RoomBackground() { /* CSS room */ });
const MockPlayer = React.memo(function MockPlayer({ player }: { player: MockLobbyPlayer }) { /* ... */ });

export function LobbyRoom() {
  const closeLobby = useStore(state => state.closeLobby);
  const user = useStore(state => state.user);

  // Key input — ref only, no state
  const keysRef = useRef<Set<string>>(new Set());

  // Mutable position for rAF — ref only
  const posRef = useRef({ x: 200, y: 300 });

  // React state — triggers re-renders for player visual update
  const [playerPos, setPlayerPos] = useState({ x: 200, y: 300 });
  const [playerDir, setPlayerDir] = useState<'down' | 'left' | 'right' | 'up'>('down');
  const [isWalking, setIsWalking] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);

  // Walk animation counter
  const frameCounterRef = useRef(0);

  // Mobile scale
  const [scale, setScale] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => { /* rAF loop + key listeners */ }, []);
  useEffect(() => { /* ResizeObserver for mobile scale */ }, []);

  return ( /* overlay JSX */ );
}
```

### Key Event Handlers

Register `keydown` and `keyup` handlers on `window` inside the main `useEffect`. Use `event.preventDefault()` for arrow keys to stop page scrolling:

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
  keysRef.current.add(e.key);
};
const handleKeyUp = (e: KeyboardEvent) => {
  keysRef.current.delete(e.key);
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
```

### rAF Movement Loop

The loop runs continuously while the component is mounted. Each tick:

1. Read pressed keys from `keysRef.current`.
2. Compute `dx` and `dy` from WASD/arrow key state (`-SPEED`, `0`, or `+SPEED`).
3. Clamp new position to `[WALL_THICKNESS, MAP_W - WALL_THICKNESS - PLAYER_SIZE]` for x, `[WALL_THICKNESS, MAP_H - WALL_THICKNESS - PLAYER_SIZE]` for y.
4. Update `posRef.current` with clamped values.
5. Call `setPlayerPos({ x, y })` to trigger a re-render for the player element.
6. Determine direction: if moving left → `'left'`, right → `'right'`, up → `'up'`, down → `'down'`. If not moving, retain last direction.
7. Call `setPlayerDir` and `setIsWalking` based on whether `dx !== 0 || dy !== 0`.
8. When walking, advance `frameCounterRef.current++`. Compute `frameIndex = Math.floor(frameCounterRef.current / FRAMES_PER_STEP) % WALK_FRAME_COUNT`. Call `setFrameIndex`.
9. When not walking, reset `frameCounterRef.current = 0` and call `setFrameIndex(0)`.
10. Store the return value of `requestAnimationFrame(loop)` in `rafRef.current` for cleanup.

Cleanup in `useEffect` return:
```typescript
return () => {
  cancelAnimationFrame(rafRef.current);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
};
```

### Mobile Scaling

Use a `ResizeObserver` (or `window.addEventListener('resize', ...)`) to recalculate scale:

```typescript
const updateScale = () => {
  setScale(Math.min(1, window.innerWidth / MAP_W));
};
updateScale(); // run on mount
```

Apply to the room container:
```typescript
style={{
  transform: `scale(${scale})`,
  transformOrigin: 'top center',
}}
```

### Room Background (CSS Pixel Art)

`RoomBackground` is a `React.memo` component. It renders a `position: relative; width: 800px; height: 600px` div containing:

- **Floor**: CSS `repeating-linear-gradient` creating a 4px grid pattern using `var(--s1)` and `var(--s2)` colors. Example:
  ```typescript
  background: `repeating-linear-gradient(
    0deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
  ), repeating-linear-gradient(
    90deg, transparent, transparent 3px, rgba(255,255,255,.02) 3px, rgba(255,255,255,.02) 4px
  ), var(--s1)`
  ```

- **Walls**: Four absolutely-positioned divs (top, bottom, left, right) each `WALL_THICKNESS = 40px` thick, using `var(--bg)` color.

- **Furniture**: 3-4 absolutely-positioned colored rectangle divs representing desks and bookshelves. Use cyberpunk colors (`var(--purple)`, `var(--cyan)`) with low opacity. Examples:
  - A desk: `position: absolute; left: 100; top: 80; width: 120; height: 60; background: rgba(123,92,245,.15); border: 1px solid rgba(123,92,245,.3); borderRadius: 4`
  - A bookshelf: Similar styling with `var(--cyan)` palette

All furniture is purely decorative — no collision detection.

### Mock Players

Define 5 players spread around the room. Each player object includes a distinct `equippedItems` set (can be all nulls for bare character). Example positions spread to avoid crowding:

```typescript
const MOCK_PLAYERS: MockLobbyPlayer[] = [
  { id: 'mock-1', name: 'AstroKid', emoji: '🚀', x: 120, y: 150,
    equippedItems: { hat: null, top: null, bottom: null, shoes: null, hair: null, accessory: null, background: null } },
  { id: 'mock-2', name: 'NeonStar', emoji: '⭐', x: 600, y: 200,
    equippedItems: { hat: null, top: null, bottom: null, shoes: null, hair: null, accessory: null, background: null } },
  // ... 3 more at different positions
];
```

The `MockPlayer` component is wrapped in `React.memo`. It takes a player prop and renders a `position: absolute` div with a `ref`. For idle movement, use `useEffect` with `setInterval` inside the component that updates `ref.current.style.left` and `ref.current.style.top` directly (DOM mutation, no React state):

```typescript
const MockPlayer = React.memo(function MockPlayer({ player }: { player: MockLobbyPlayer }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const baseX = player.x;
    const baseY = player.y;
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      const newX = Math.max(WALL_THICKNESS, Math.min(MAP_W - WALL_THICKNESS - PLAYER_SIZE, baseX + dx));
      const newY = Math.max(WALL_THICKNESS, Math.min(MAP_H - WALL_THICKNESS - PLAYER_SIZE, baseY + dy));
      containerRef.current.style.left = `${newX}px`;
      containerRef.current.style.top = `${newY}px`;
    }, 2500);
    return () => clearInterval(interval);
  }, [player.x, player.y]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', left: player.x, top: player.y }}>
      <PixelAvatar equippedItems={player.equippedItems} size="lobby" direction="down" />
      {/* name label */}
    </div>
  );
});
```

### Player Rendering

The user's player div is `position: absolute` with `left: playerPos.x` and `top: playerPos.y`. It renders `PixelAvatar` with live direction/walking/frameIndex state and a name label floating above:

```typescript
<div style={{ position: 'absolute', left: playerPos.x, top: playerPos.y }}>
  {/* Name label */}
  <div style={{
    position: 'absolute', bottom: '100%', left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'Space Mono', fontSize: 8, color: '#22D3EE',
    whiteSpace: 'nowrap', marginBottom: 2,
  }}>
    {user.name}
  </div>
  <PixelAvatar
    equippedItems={user.equippedItems}
    size="lobby"
    direction={playerDir}
    isWalking={isWalking}
    frameIndex={frameIndex}
  />
</div>
```

### Exit Button

Positioned fixed in the top-right corner of the overlay (not inside the room container, so it is always visible regardless of room scaling):

```typescript
<button
  onClick={closeLobby}
  style={{
    position: 'absolute', top: 16, right: 16, zIndex: 110,
    fontFamily: 'Space Mono', fontSize: 10,
    background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
    color: '#EF4444', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
  }}
>
  Lobiden Çık
</button>
```

### Full Overlay JSX Structure

```typescript
return (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(0,0,0,.85)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    paddingTop: 20,
  }}>
    {/* Exit button — outside room container so it's not scaled */}
    <button onClick={closeLobby} style={{ /* top-right absolute */ }}>Lobiden Çık</button>

    {/* Room container — scaled for mobile */}
    <div style={{
      width: MAP_W, height: MAP_H,
      position: 'relative', overflow: 'hidden',
      transform: `scale(${scale})`,
      transformOrigin: 'top center',
    }}>
      <RoomBackground />

      {/* Mock players */}
      {MOCK_PLAYERS.map(p => <MockPlayer key={p.id} player={p} />)}

      {/* User player */}
      <div style={{ position: 'absolute', left: playerPos.x, top: playerPos.y }}>
        {/* name label */}
        <PixelAvatar
          equippedItems={user.equippedItems}
          size="lobby"
          direction={playerDir}
          isWalking={isWalking}
          frameIndex={frameIndex}
        />
      </div>
    </div>
  </div>
);
```

## Styling Consistency

- Use `var(--bg)`, `var(--s1)`, `var(--s2)`, `var(--purple)`, `var(--cyan)` CSS variables throughout — no hardcoded color values except where required by `RANK_TIER_COLORS` equivalents.
- Room walls use `var(--bg)`.
- Floor grid uses `var(--s1)` base with subtle `rgba(255,255,255,.02)` grid lines.
- Furniture uses `var(--purple)` and `var(--cyan)` accent colors at 15% opacity with 30% opacity borders.
- Name labels above avatars use `#22D3EE` (cyan) for the user, `var(--dim)` for mock players.
- Fonts: `Space Mono` for labels, `Orbitron` for any headings.

## Common Pitfalls to Avoid

1. **Do not call `setPlayerPos` from keydown handlers** — only call it from inside the rAF loop. Doing otherwise causes React to batch state updates with input events, leading to stuttering.

2. **Do not use `useState` for `keysRef` or `posRef`** — these refs are intentionally mutable and do not trigger re-renders. The only React state that should trigger re-renders is `playerPos`, `playerDir`, `isWalking`, and `frameIndex`.

3. **Do not forget to cancel the rAF loop on unmount** — `cancelAnimationFrame(rafRef.current)` in the `useEffect` return. Failing to do this leaves a running loop after the component unmounts.

4. **Do not forget to remove key listeners on unmount** — the same `useEffect` cleanup removes both event listeners.

5. **Mock player idle movement must NOT use React state** — the `setInterval` in `MockPlayer` must update `containerRef.current.style.left` and `.top` directly. Using `useState` would cause `MockPlayer` to re-render every 2.5 seconds and cascade up unnecessarily.

6. **`React.memo` on `RoomBackground` and `MockPlayer` is mandatory** — without it, every `setPlayerPos` call (60fps) re-renders these components unnecessarily.

7. **Exit button must be outside the scaled room container** — otherwise on mobile the scale transform makes it hard to tap.