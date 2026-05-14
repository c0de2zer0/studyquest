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
    // neck
    { x: 6, y: 9, w: 4, h: 1, color: '#E8B48A' },
    // torso (wider, more natural)
    { x: 3, y: 10, w: 10, h: 11, color: '#E8B48A' },
    // left arm (attached to torso)
    { x: 1, y: 10, w: 3, h: 10, color: '#E8B48A' },
    // right arm (attached to torso)
    { x: 12, y: 10, w: 3, h: 10, color: '#E8B48A' },
    // hip connector
    { x: 3, y: 21, w: 10, h: 1, color: '#D4956A' },
    // left leg
    { x: 3, y: 22, w: 4, h: 9, color: '#E8B48A' },
    // right leg
    { x: 9, y: 22, w: 4, h: 9, color: '#E8B48A' },
    // feet
    { x: 2, y: 30, w: 5, h: 2, color: '#D4956A' },
    { x: 9, y: 30, w: 5, h: 2, color: '#D4956A' },
  ],
};

export const BASE_HEAD_LAYER: AnimatedLayerDef = {
  id: 'base-head',
  slot: 'head',
  pixels: [
    // head shape (wider, more round)
    { x: 3, y: 1, w: 10, h: 8, color: '#F5C89A' },
    // forehead shading
    { x: 4, y: 1, w: 8, h: 1, color: '#E8B48A' },
    // left eye white
    { x: 4, y: 3, w: 3, h: 3, color: '#FFFFFF' },
    // right eye white
    { x: 9, y: 3, w: 3, h: 3, color: '#FFFFFF' },
    // left pupil
    { x: 5, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // right pupil
    { x: 10, y: 4, w: 2, h: 2, color: '#1A1A2E' },
    // left eye shine
    { x: 5, y: 4, w: 1, h: 1, color: '#4A90E2' },
    // right eye shine
    { x: 10, y: 4, w: 1, h: 1, color: '#4A90E2' },
    // nose
    { x: 7, y: 6, w: 2, h: 1, color: '#D4956A' },
    // mouth
    { x: 5, y: 7, w: 6, h: 1, color: '#C07050' },
    // mouth corners (smile)
    { x: 5, y: 7, w: 1, h: 1, color: '#A06040' },
    { x: 10, y: 7, w: 1, h: 1, color: '#A06040' },
    // chin
    { x: 4, y: 8, w: 8, h: 1, color: '#E8B48A' },
    // ear left
    { x: 2, y: 3, w: 2, h: 4, color: '#E8B48A' },
    // ear right
    { x: 12, y: 3, w: 2, h: 4, color: '#E8B48A' },
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
      { x: 3, y: 0, w: 10, h: 3, color: '#1E3A5F' },
      // brim
      { x: 2, y: 3, w: 12, h: 1, color: '#2D4F7A' },
      // neon band (2px tall)
      { x: 3, y: 1, w: 10, h: 2, color: '#22D3EE' },
      // neon highlight
      { x: 4, y: 1, w: 8, h: 1, color: '#67E8F9' },
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
      { x: 4, y: 10, w: 8, h: 10, color: '#1A2744' },
      // left sleeve
      { x: 1, y: 10, w: 3, h: 8, color: '#1A2744' },
      // right sleeve
      { x: 12, y: 10, w: 3, h: 8, color: '#1A2744' },
      // collar
      { x: 6, y: 10, w: 4, h: 1, color: '#2A3F60' },
      // school badge
      { x: 5, y: 12, w: 2, h: 2, color: '#22D3EE' },
      // neon trim on sleeves
      { x: 1, y: 17, w: 3, h: 1, color: '#22D3EE' },
      { x: 12, y: 17, w: 3, h: 1, color: '#22D3EE' },
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

  // ── More Hats ──
  'item-hat-5': {
    id: 'item-hat-5',
    slot: 'hat',
    pixels: [
      { x: 4, y: 0, w: 8, h: 1, color: '#64748B' },
      { x: 3, y: 1, w: 10, h: 2, color: '#475569' },
      { x: 3, y: 3, w: 10, h: 1, color: '#334155' },
    ],
  },
  'item-hat-6': {
    id: 'item-hat-6',
    slot: 'hat',
    pixels: [
      { x: 3, y: 1, w: 10, h: 3, color: '#1A1A2E' },
      { x: 4, y: 1, w: 8, h: 1, color: '#334155' },
    ],
  },
  'item-hat-7': {
    id: 'item-hat-7',
    slot: 'hat',
    pixels: [
      { x: 3, y: 0, w: 10, h: 2, color: '#A78BFA' },
      { x: 4, y: 2, w: 8, h: 2, color: '#7B5CF6' },
      { x: 6, y: 0, w: 4, h: 1, color: '#FFD700' },
    ],
  },
  'item-hat-8': {
    id: 'item-hat-8',
    slot: 'hat',
    pixels: [
      { x: 4, y: 0, w: 8, h: 1, color: '#FFD700' },
      { x: 3, y: 1, w: 10, h: 1, color: '#FDE68A' },
      { x: 5, y: 0, w: 6, h: 1, color: '#FFFFFF' },
    ],
  },

  // ── Hair ──
  'item-hair-1': {
    id: 'item-hair-1',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 2, color: '#334155' },
      { x: 4, y: 3, w: 8, h: 1, color: '#475569' },
    ],
  },
  'item-hair-2': {
    id: 'item-hair-2',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 3, color: '#A78BFA' },
      { x: 2, y: 2, w: 2, h: 4, color: '#7B5CF6' },
      { x: 12, y: 2, w: 2, h: 4, color: '#7B5CF6' },
    ],
  },
  'item-hair-3': {
    id: 'item-hair-3',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 2, color: '#22D3EE' },
      { x: 2, y: 2, w: 1, h: 5, color: '#22D3EE' },
      { x: 13, y: 2, w: 1, h: 5, color: '#22D3EE' },
      { x: 5, y: 1, w: 6, h: 1, color: '#A78BFA' },
    ],
  },
  'item-hair-4': {
    id: 'item-hair-4',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 2, color: '#92400E' },
      { x: 2, y: 2, w: 2, h: 8, color: '#92400E' },
      { x: 12, y: 2, w: 2, h: 8, color: '#92400E' },
    ],
  },
  'item-hair-5': {
    id: 'item-hair-5',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 2, color: '#B9F2FF' },
      { x: 2, y: 2, w: 2, h: 4, color: '#A78BFA' },
      { x: 12, y: 2, w: 2, h: 4, color: '#22D3EE' },
      { x: 5, y: 1, w: 6, h: 1, color: '#FFFFFF' },
    ],
  },
  'item-hair-6': {
    id: 'item-hair-6',
    slot: 'hair',
    pixels: [
      { x: 3, y: 1, w: 10, h: 2, color: '#EF4444' },
      { x: 2, y: 2, w: 2, h: 6, color: '#F97316' },
      { x: 12, y: 2, w: 2, h: 6, color: '#F97316' },
      { x: 5, y: 0, w: 6, h: 2, color: '#FFD700' },
    ],
  },

  // ── More Tops ──
  'item-top-4': {
    id: 'item-top-4',
    slot: 'top',
    pixels: [
      { x: 4, y: 10, w: 8, h: 10, color: '#1E293B' },
      { x: 1, y: 10, w: 3, h: 8, color: '#1E293B' },
      { x: 12, y: 10, w: 3, h: 8, color: '#1E293B' },
      { x: 6, y: 10, w: 4, h: 1, color: '#7B5CF6' },
    ],
  },
  'item-top-5': {
    id: 'item-top-5',
    slot: 'top',
    pixels: [
      { x: 4, y: 10, w: 8, h: 10, color: '#0F172A' },
      { x: 1, y: 10, w: 3, h: 9, color: '#0F172A' },
      { x: 12, y: 10, w: 3, h: 9, color: '#0F172A' },
      { x: 4, y: 14, w: 8, h: 1, color: '#22D3EE' },
      { x: 1, y: 14, w: 3, h: 1, color: '#22D3EE' },
      { x: 12, y: 14, w: 3, h: 1, color: '#22D3EE' },
    ],
  },
  'item-top-6': {
    id: 'item-top-6',
    slot: 'top',
    pixels: [
      { x: 4, y: 10, w: 8, h: 10, color: '#1E1B4B' },
      { x: 1, y: 10, w: 3, h: 9, color: '#1E1B4B' },
      { x: 12, y: 10, w: 3, h: 9, color: '#1E1B4B' },
      { x: 5, y: 11, w: 6, h: 8, color: '#2D2A6E' },
      { x: 6, y: 12, w: 4, h: 6, color: '#A78BFA' },
    ],
  },
  'item-top-7': {
    id: 'item-top-7',
    slot: 'top',
    pixels: [
      { x: 4, y: 10, w: 8, h: 10, color: '#422006' },
      { x: 1, y: 10, w: 3, h: 9, color: '#422006' },
      { x: 12, y: 10, w: 3, h: 9, color: '#422006' },
      { x: 4, y: 10, w: 8, h: 2, color: '#B45309' },
      { x: 1, y: 10, w: 3, h: 2, color: '#B45309' },
      { x: 12, y: 10, w: 3, h: 2, color: '#B45309' },
      { x: 6, y: 13, w: 4, h: 4, color: '#EF4444' },
    ],
  },

  // ── Bottom ──
  'item-bottom-1': {
    id: 'item-bottom-1',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 2, color: '#475569' },
      { x: 4, y: 23, w: 4, h: 7, color: '#334155' },
      { x: 8, y: 23, w: 4, h: 7, color: '#334155' },
    ],
  },
  'item-bottom-2': {
    id: 'item-bottom-2',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 9, color: '#22D3EE' },
      { x: 5, y: 22, w: 3, h: 7, color: '#0E7490' },
      { x: 8, y: 22, w: 3, h: 7, color: '#0E7490' },
    ],
  },
  'item-bottom-3': {
    id: 'item-bottom-3',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 5, color: '#1E293B' },
      { x: 4, y: 23, w: 8, h: 1, color: '#7B5CF6' },
      { x: 4, y: 25, w: 4, h: 4, color: '#F5C09A' },
      { x: 8, y: 25, w: 4, h: 4, color: '#F5C09A' },
    ],
  },
  'item-bottom-4': {
    id: 'item-bottom-4',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 9, color: '#1E293B' },
      { x: 4, y: 21, w: 8, h: 2, color: '#475569' },
      { x: 5, y: 23, w: 6, h: 7, color: '#334155' },
    ],
  },
  'item-bottom-5': {
    id: 'item-bottom-5',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 9, color: '#1E1B4B' },
      { x: 4, y: 24, w: 8, h: 1, color: '#A78BFA' },
      { x: 4, y: 27, w: 4, h: 3, color: '#2D2A6E' },
      { x: 8, y: 27, w: 4, h: 3, color: '#2D2A6E' },
    ],
  },
  'item-bottom-6': {
    id: 'item-bottom-6',
    slot: 'bottom',
    pixels: [
      { x: 4, y: 21, w: 8, h: 9, color: '#422006' },
      { x: 4, y: 21, w: 8, h: 2, color: '#B45309' },
      { x: 5, y: 23, w: 6, h: 7, color: '#92400E' },
      { x: 6, y: 25, w: 4, h: 3, color: '#EF4444' },
    ],
  },

  // ── Shoes ──
  'item-shoes-1': {
    id: 'item-shoes-1',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 30, w: 4, h: 2, color: '#FFFFFF' },
      { x: 8, y: 30, w: 4, h: 2, color: '#FFFFFF' },
      { x: 3, y: 31, w: 5, h: 1, color: '#E5E7EB' },
      { x: 8, y: 31, w: 5, h: 1, color: '#E5E7EB' },
    ],
  },
  'item-shoes-2': {
    id: 'item-shoes-2',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 30, w: 4, h: 2, color: '#22D3EE' },
      { x: 8, y: 30, w: 4, h: 2, color: '#22D3EE' },
      { x: 3, y: 31, w: 5, h: 1, color: '#0E7490' },
      { x: 8, y: 31, w: 5, h: 1, color: '#0E7490' },
      { x: 4, y: 30, w: 4, h: 1, color: '#67E8F9' },
      { x: 8, y: 30, w: 4, h: 1, color: '#67E8F9' },
    ],
  },
  'item-shoes-3': {
    id: 'item-shoes-3',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 29, w: 4, h: 3, color: '#334155' },
      { x: 8, y: 29, w: 4, h: 3, color: '#334155' },
      { x: 4, y: 30, w: 4, h: 1, color: '#EF4444' },
      { x: 8, y: 30, w: 4, h: 1, color: '#EF4444' },
    ],
  },
  'item-shoes-4': {
    id: 'item-shoes-4',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 28, w: 4, h: 4, color: '#1E293B' },
      { x: 8, y: 28, w: 4, h: 4, color: '#1E293B' },
      { x: 4, y: 29, w: 4, h: 1, color: '#7B5CF6' },
      { x: 8, y: 29, w: 4, h: 1, color: '#7B5CF6' },
      { x: 3, y: 31, w: 5, h: 1, color: '#0F172A' },
      { x: 8, y: 31, w: 5, h: 1, color: '#0F172A' },
    ],
  },
  'item-shoes-5': {
    id: 'item-shoes-5',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 28, w: 4, h: 4, color: '#1E3A5F' },
      { x: 8, y: 28, w: 4, h: 4, color: '#1E3A5F' },
      { x: 4, y: 31, w: 4, h: 1, color: '#22D3EE' },
      { x: 8, y: 31, w: 4, h: 1, color: '#22D3EE' },
      { x: 3, y: 30, w: 2, h: 1, color: '#FFD700' },
      { x: 11, y: 30, w: 2, h: 1, color: '#FFD700' },
    ],
  },
  'item-shoes-6': {
    id: 'item-shoes-6',
    slot: 'shoes',
    pixels: [
      { x: 4, y: 30, w: 4, h: 2, color: '#FFD700' },
      { x: 8, y: 30, w: 4, h: 2, color: '#FFD700' },
      { x: 3, y: 31, w: 5, h: 1, color: '#F59E0B' },
      { x: 8, y: 31, w: 5, h: 1, color: '#F59E0B' },
    ],
  },

  // ── More Accessories ──
  'item-acc-4': {
    id: 'item-acc-4',
    slot: 'accessory',
    pixels: [
      { x: 4, y: 4, w: 8, h: 2, color: '#0F172A' },
      { x: 5, y: 4, w: 2, h: 2, color: '#EF4444' },
      { x: 9, y: 4, w: 2, h: 2, color: '#EF4444' },
      { x: 7, y: 5, w: 2, h: 1, color: '#475569' },
    ],
  },
  'item-acc-5': {
    id: 'item-acc-5',
    slot: 'accessory',
    pixels: [
      { x: 3, y: 5, w: 2, h: 3, color: '#A78BFA' },
      { x: 11, y: 5, w: 2, h: 3, color: '#A78BFA' },
      { x: 3, y: 6, w: 2, h: 1, color: '#FFFFFF' },
      { x: 11, y: 6, w: 2, h: 1, color: '#FFFFFF' },
    ],
  },
  'item-acc-6': {
    id: 'item-acc-6',
    slot: 'accessory',
    pixels: [
      { x: 1, y: 17, w: 4, h: 2, color: '#22D3EE' },
      { x: 2, y: 17, w: 2, h: 2, color: '#0E7490' },
    ],
  },
  'item-acc-7': {
    id: 'item-acc-7',
    slot: 'accessory',
    pixels: [
      { x: 1, y: 10, w: 2, h: 10, color: '#7B5CF6' },
      { x: 13, y: 10, w: 2, h: 10, color: '#7B5CF6' },
    ],
  },
  'item-acc-8': {
    id: 'item-acc-8',
    slot: 'accessory',
    pixels: [
      { x: 1, y: 10, w: 3, h: 9, color: '#FFD700' },
      { x: 12, y: 10, w: 3, h: 9, color: '#FFD700' },
      { x: 1, y: 18, w: 3, h: 1, color: '#FDE68A' },
      { x: 12, y: 18, w: 3, h: 1, color: '#FDE68A' },
    ],
  },

  // ── Costume Virtual Sub-Items ──
  'item-hat-costume-1': { id: 'item-hat-costume-1', slot: 'hat', pixels: [{ x: 3, y: 0, w: 10, h: 4, color: '#422006' }, { x: 4, y: 0, w: 8, h: 1, color: '#B45309' }, { x: 6, y: 1, w: 4, h: 1, color: '#EF4444' }] },
  'item-top-costume-1': { id: 'item-top-costume-1', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#422006' }, { x: 1, y: 10, w: 3, h: 9, color: '#422006' }, { x: 12, y: 10, w: 3, h: 9, color: '#422006' }, { x: 5, y: 12, w: 6, h: 6, color: '#B45309' }] },
  'item-bottom-costume-1': { id: 'item-bottom-costume-1', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#422006' }, { x: 5, y: 22, w: 6, h: 8, color: '#92400E' }] },
  'item-shoes-costume-1': { id: 'item-shoes-costume-1', slot: 'shoes', pixels: [{ x: 4, y: 28, w: 4, h: 4, color: '#422006' }, { x: 8, y: 28, w: 4, h: 4, color: '#422006' }, { x: 3, y: 31, w: 5, h: 1, color: '#B45309' }, { x: 8, y: 31, w: 5, h: 1, color: '#B45309' }] },

  'item-hat-costume-2': { id: 'item-hat-costume-2', slot: 'hat', pixels: [{ x: 3, y: 0, w: 10, h: 4, color: '#0F172A' }, { x: 4, y: 2, w: 8, h: 1, color: '#22D3EE' }] },
  'item-top-costume-2': { id: 'item-top-costume-2', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#0F172A' }, { x: 1, y: 10, w: 3, h: 9, color: '#0F172A' }, { x: 12, y: 10, w: 3, h: 9, color: '#0F172A' }, { x: 4, y: 13, w: 8, h: 1, color: '#22D3EE' }] },
  'item-bottom-costume-2': { id: 'item-bottom-costume-2', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#0F172A' }, { x: 4, y: 24, w: 8, h: 1, color: '#22D3EE' }] },
  'item-shoes-costume-2': { id: 'item-shoes-costume-2', slot: 'shoes', pixels: [{ x: 4, y: 29, w: 4, h: 3, color: '#0F172A' }, { x: 8, y: 29, w: 4, h: 3, color: '#0F172A' }, { x: 4, y: 30, w: 4, h: 1, color: '#22D3EE' }, { x: 8, y: 30, w: 4, h: 1, color: '#22D3EE' }] },

  'item-hat-costume-3': { id: 'item-hat-costume-3', slot: 'hat', pixels: [{ x: 3, y: 0, w: 10, h: 3, color: '#1A1A2E' }, { x: 3, y: 2, w: 10, h: 1, color: '#A78BFA' }] },
  'item-top-costume-3': { id: 'item-top-costume-3', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#1A1A2E' }, { x: 1, y: 10, w: 3, h: 9, color: '#1A1A2E' }, { x: 12, y: 10, w: 3, h: 9, color: '#1A1A2E' }, { x: 4, y: 11, w: 1, h: 8, color: '#A78BFA' }, { x: 11, y: 11, w: 1, h: 8, color: '#A78BFA' }] },
  'item-bottom-costume-3': { id: 'item-bottom-costume-3', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#1A1A2E' }, { x: 4, y: 21, w: 8, h: 1, color: '#A78BFA' }] },
  'item-shoes-costume-3': { id: 'item-shoes-costume-3', slot: 'shoes', pixels: [{ x: 4, y: 29, w: 4, h: 3, color: '#1A1A2E' }, { x: 8, y: 29, w: 4, h: 3, color: '#1A1A2E' }] },

  'item-hat-costume-4': { id: 'item-hat-costume-4', slot: 'hat', pixels: [{ x: 3, y: 1, w: 10, h: 3, color: '#1A1A2E' }] },
  'item-top-costume-4': { id: 'item-top-costume-4', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#1A1A2E' }, { x: 1, y: 10, w: 3, h: 9, color: '#1A1A2E' }, { x: 12, y: 10, w: 3, h: 9, color: '#1A1A2E' }] },
  'item-bottom-costume-4': { id: 'item-bottom-costume-4', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#1A1A2E' }] },
  'item-shoes-costume-4': { id: 'item-shoes-costume-4', slot: 'shoes', pixels: [{ x: 4, y: 29, w: 4, h: 3, color: '#1A1A2E' }, { x: 8, y: 29, w: 4, h: 3, color: '#1A1A2E' }] },

  'item-hat-costume-5': { id: 'item-hat-costume-5', slot: 'hat', pixels: [{ x: 4, y: 0, w: 8, h: 4, color: '#1E3A5F' }, { x: 5, y: 2, w: 6, h: 1, color: '#22D3EE' }] },
  'item-top-costume-5': { id: 'item-top-costume-5', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#1E3A5F' }, { x: 1, y: 10, w: 3, h: 9, color: '#1E3A5F' }, { x: 12, y: 10, w: 3, h: 9, color: '#1E3A5F' }, { x: 6, y: 10, w: 4, h: 10, color: '#22D3EE' }] },
  'item-bottom-costume-5': { id: 'item-bottom-costume-5', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#1E3A5F' }, { x: 6, y: 21, w: 4, h: 9, color: '#22D3EE' }] },
  'item-shoes-costume-5': { id: 'item-shoes-costume-5', slot: 'shoes', pixels: [{ x: 4, y: 28, w: 4, h: 4, color: '#1E3A5F' }, { x: 8, y: 28, w: 4, h: 4, color: '#1E3A5F' }, { x: 4, y: 31, w: 4, h: 1, color: '#22D3EE' }, { x: 8, y: 31, w: 4, h: 1, color: '#22D3EE' }] },

  'item-hat-costume-6': { id: 'item-hat-costume-6', slot: 'hat', pixels: [{ x: 4, y: 0, w: 8, h: 3, color: '#7B5CF6' }, { x: 5, y: 2, w: 6, h: 1, color: '#A78BFA' }] },
  'item-top-costume-6': { id: 'item-top-costume-6', slot: 'top', pixels: [{ x: 4, y: 10, w: 8, h: 10, color: '#7B5CF6' }, { x: 1, y: 10, w: 3, h: 9, color: '#7B5CF6' }, { x: 12, y: 10, w: 3, h: 9, color: '#7B5CF6' }] },
  'item-bottom-costume-6': { id: 'item-bottom-costume-6', slot: 'bottom', pixels: [{ x: 4, y: 21, w: 8, h: 9, color: '#7B5CF6' }] },
  'item-shoes-costume-6': { id: 'item-shoes-costume-6', slot: 'shoes', pixels: [{ x: 4, y: 29, w: 4, h: 3, color: '#7B5CF6' }, { x: 8, y: 29, w: 4, h: 3, color: '#7B5CF6' }] },

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

// ─── Background Palettes ─────────────────────────────────────────────────────
// Color gradients for background items (rendered as CSS gradient swatches,
// not SVG character layers).

export const BACKGROUND_PALETTES: Record<string, string[]> = {
  'item-bg-1': ['#0F0A2E', '#1A1040', '#2D1B69'],   // Galaksi
  'item-bg-2': ['#0D0D1A', '#1A1A2E', '#00FF9F'],   // Neon Şehir
  'item-bg-3': ['#0A1A0A', '#1A2E1A', '#22D3EE'],   // Siber Orman
  'item-bg-4': ['#0A1020', '#0D2040', '#164E63'],   // Dijital Okyanus
  'item-bg-5': ['#0F0F1A', '#1A1A3E', '#7C3AED'],   // Neon Dağlar
  'item-bg-6': ['#050510', '#0A0A20', '#1A1A40'],   // Uzay İstasyonu
  'item-bg-7': ['#1A0A00', '#2D1400', '#7C2D12'],   // Ejderha Şatosu
  'item-bg-8': ['#001A00', '#003300', '#00FF00'],   // Matrix Boyutu
};
