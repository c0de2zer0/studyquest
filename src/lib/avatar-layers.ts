// src/lib/avatar-layers.ts
// Pixel art layer definitions for the avatar system.
// No React, no store imports — pure data module.

export type AvatarSlot = 'body' | 'head' | 'hair' | 'top' | 'bottom' | 'shoes' | 'hat' | 'accessory';

export interface PixelRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export interface AvatarLayerDef {
  id: string;
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
  walkFrames?: PixelRect[][];
}

// ─── Base Character Layers ───────────────────────────────────────────────────
// viewBox: "0 0 16 32"
// y=0..1   hat brim / top of head
// y=2..8   head / face
// y=9..9   neck
// y=10..20 torso / top clothing
// y=21..24 hips / belt / bottom clothing start
// y=25..29 legs / bottom clothing
// y=30..31 feet / shoes

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
};

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

// ─── AVATAR_LAYER_MAP ────────────────────────────────────────────────────────
// Maps every equippable MarketItem.id to its AnimatedLayerDef.
// background items have no SVG layer — they are rendered as CSS background.

export const AVATAR_LAYER_MAP: Record<string, AnimatedLayerDef> = {

  // ── Hats ──
  'item-hat-1': {
    id: 'item-hat-1',
    slot: 'hat',
    pixels: [
      // helmet dome
      { x: 3, y: 0, w: 10, h: 4, color: '#334155' },
      // visor
      { x: 4, y: 3, w: 8, h: 1, color: '#22D3EE' },
      // brim
      { x: 2, y: 3, w: 12, h: 1, color: '#475569' },
    ],
  },

  'item-hat-2': {
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
  },

  'item-hat-3': {
    id: 'item-hat-3',
    slot: 'hat',
    pixels: [
      // hologram ring base
      { x: 2, y: 1, w: 12, h: 1, color: '#A78BFA' },
      // holo shimmer
      { x: 4, y: 0, w: 8, h: 2, color: '#7B5CF6' },
      // glow line
      { x: 3, y: 1, w: 10, h: 1, color: '#C4B5FD' },
    ],
  },

  'item-hat-4': {
    id: 'item-hat-4',
    slot: 'hat',
    pixels: [
      // crown band
      { x: 3, y: 1, w: 10, h: 2, color: '#FFD700' },
      // upper crown points
      { x: 4, y: 0, w: 2, h: 2, color: '#FFD700' },
      { x: 7, y: 0, w: 2, h: 2, color: '#FFD700' },
      { x: 10, y: 0, w: 2, h: 2, color: '#FFD700' },
      // gems
      { x: 5, y: 1, w: 1, h: 1, color: '#22D3EE' },
      { x: 8, y: 1, w: 1, h: 1, color: '#F59E0B' },
      { x: 11, y: 1, w: 1, h: 1, color: '#EF4444' },
    ],
  },

  // ── Tops ──
  'item-top-1': {
    id: 'item-top-1',
    slot: 'top',
    pixels: [
      // jacket body
      { x: 4, y: 10, w: 8, h: 10, color: '#1E293B' },
      // left sleeve
      { x: 1, y: 10, w: 3, h: 8, color: '#1E293B' },
      // right sleeve
      { x: 12, y: 10, w: 3, h: 8, color: '#1E293B' },
      // collar
      { x: 6, y: 10, w: 4, h: 1, color: '#334155' },
      // school badge
      { x: 5, y: 12, w: 2, h: 2, color: '#22D3EE' },
    ],
  },

  'item-top-2': {
    id: 'item-top-2',
    slot: 'top',
    pixels: [
      // uniform body
      { x: 4, y: 10, w: 8, h: 10, color: '#1E3A5F' },
      // left sleeve
      { x: 1, y: 10, w: 3, h: 8, color: '#1E3A5F' },
      // right sleeve
      { x: 12, y: 10, w: 3, h: 8, color: '#1E3A5F' },
      // collar accent
      { x: 6, y: 10, w: 4, h: 2, color: '#FFD700' },
      // left shoulder epaulette
      { x: 1, y: 10, w: 3, h: 1, color: '#FFD700' },
      // right shoulder epaulette
      { x: 12, y: 10, w: 3, h: 1, color: '#FFD700' },
    ],
  },

  'item-top-3': {
    id: 'item-top-3',
    slot: 'top',
    pixels: [
      // vest body (no sleeves)
      { x: 4, y: 10, w: 8, h: 10, color: '#F59E0B' },
      // arm skin (vest only, no sleeves)
      { x: 1, y: 10, w: 3, h: 9, color: '#F5C09A' },
      { x: 12, y: 10, w: 3, h: 9, color: '#F5C09A' },
      // front pockets
      { x: 5, y: 14, w: 2, h: 3, color: '#B45309' },
      { x: 9, y: 14, w: 2, h: 3, color: '#B45309' },
      // zipper
      { x: 7, y: 10, w: 2, h: 9, color: '#475569' },
    ],
  },

  'item-special-1': {
    id: 'item-special-1',
    slot: 'top',
    pixels: [
      // body suit
      { x: 4, y: 10, w: 8, h: 10, color: '#0F172A' },
      // left sleeve
      { x: 1, y: 10, w: 3, h: 9, color: '#0F172A' },
      // right sleeve
      { x: 12, y: 10, w: 3, h: 9, color: '#0F172A' },
      // DNA helix left wing
      { x: 0, y: 8, w: 1, h: 12, color: '#34D399' },
      { x: 0, y: 10, w: 2, h: 2, color: '#22D3EE' },
      { x: 0, y: 14, w: 2, h: 2, color: '#A78BFA' },
      { x: 0, y: 18, w: 2, h: 2, color: '#34D399' },
      // DNA helix right wing
      { x: 15, y: 8, w: 1, h: 12, color: '#34D399' },
      { x: 14, y: 10, w: 2, h: 2, color: '#22D3EE' },
      { x: 14, y: 14, w: 2, h: 2, color: '#A78BFA' },
      { x: 14, y: 18, w: 2, h: 2, color: '#34D399' },
      // center bio-glow
      { x: 7, y: 12, w: 2, h: 6, color: '#34D399' },
    ],
  },

  // ── Accessories ──
  'item-acc-1': {
    id: 'item-acc-1',
    slot: 'accessory',
    pixels: [
      // ring glow on right hand
      { x: 12, y: 17, w: 3, h: 2, color: '#A78BFA' },
      { x: 13, y: 17, w: 1, h: 2, color: '#FFD700' },
    ],
  },

  'item-acc-2': {
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
  },

  'item-acc-3': {
    id: 'item-acc-3',
    slot: 'accessory',
    pixels: [
      // necklace chain
      { x: 5, y: 9, w: 6, h: 1, color: '#A78BFA' },
      // pendant
      { x: 7, y: 10, w: 2, h: 2, color: '#B9F2FF' },
      { x: 7, y: 10, w: 2, h: 1, color: '#FFFFFF' },
    ],
  },
};
