'use client';
import React from 'react';
import { BASE_BODY_LAYER, BASE_HEAD_LAYER, AVATAR_LAYER_MAP } from '../lib/avatar-layers';
import type { StoreState } from '../store';
import type { AnimatedLayerDef, PixelRect } from '../lib/avatar-layers';

interface PixelAvatarProps {
  equippedItems: StoreState['user']['equippedItems'];
  size: 'preview' | 'lobby';
  direction?: 'down' | 'left' | 'right' | 'up';
  isWalking?: boolean;
  /** frameIndex 0-3: 0 = idle, 1-3 = walk cycle frames */
  frameIndex?: number;
}

const SIZE_MAP = { preview: 96, lobby: 48 } as const;

function selectPixels(
  layer: AnimatedLayerDef,
  direction: 'down' | 'left' | 'right' | 'up',
  isWalking: boolean,
  frameIndex: number,
): PixelRect[] {
  if (isWalking && frameIndex > 0 && layer.walkFrames?.[frameIndex]) {
    return layer.walkFrames[frameIndex];
  }
  if (direction !== 'down' && layer.directional?.[direction]) {
    return layer.directional[direction];
  }
  return layer.pixels;
}

function buildLayerStack(
  equippedItems: StoreState['user']['equippedItems'],
): AnimatedLayerDef[] {
  const slots = ['bottom', 'shoes', 'top', 'hair', 'hat', 'accessory'] as const;
  // z-order: body → bottom → shoes → top → hair → head → hat → accessory
  const layers: AnimatedLayerDef[] = [BASE_BODY_LAYER];

  for (const slot of slots) {
    if (slot === 'hair') {
      // insert head after hair in the z-order (head before hat/accessory)
    }
    const itemId = equippedItems[slot];
    if (itemId == null) {
      if (slot === 'hair') layers.push(BASE_HEAD_LAYER);
      continue;
    }
    const layerDef = AVATAR_LAYER_MAP[itemId];
    if (!layerDef) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`PixelAvatar: no layer definition found for item id "${itemId}"`);
      }
      if (slot === 'hair') layers.push(BASE_HEAD_LAYER);
      continue;
    }
    layers.push(layerDef);
    if (slot === 'hair') layers.push(BASE_HEAD_LAYER);
  }

  // If hair slot never triggered head insertion (hair was null, head was pushed in loop above)
  // We need to ensure BASE_HEAD_LAYER is in the stack after hair slot position.
  // The logic above handles it: head is pushed immediately after hair slot (whether equipped or not).
  return layers;
}

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
      height={pxSize * 2}
      style={{ imageRendering: 'pixelated', display: 'block' }}
      aria-hidden="true"
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
